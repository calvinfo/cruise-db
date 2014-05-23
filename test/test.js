var Server = require('../');
var test = require('supertest');
var assert = require('assert');
var after = require('after');

describe('cruise-db', function(){
  var app;
  var server;
  beforeEach(function(done){
    server = new Server();
    app = server.app();
    var interval = setInterval(function(){
      if (!server.isLeader()) return;
      clearInterval(interval);
      done();
    }, 100);
  });

  describe('/join', function(){
    it('should return the host and port of the cruise leader', function(done){
      var cruise = server.cruise;
      test(app)
        .post('/join')
        .send({ host: '127.0.0.1', port: 4030 })
        .expect({
          host: cruise.host(),
          port: cruise.port()
        })
        .end(function(err){
          assert(!err);
          assert.equal(cruise.peers().length, 2);
          done();
        });
    });
  });

  describe('/put', function(){
    it('should return filled keys', function(done){
      var key = 'key';
      var val = { foo: 'bar' };
      test(app)
        .post('/db/' + key)
        .send(val)
        .expect(200)
        .end(function(){
          test(app)
            .get('/db/' + key)
            .expect(200)
            .expect(val)
            .end(done);
        });
    });
  });

  describe('/get', function(){
    it('should return 404 for empty keys', function(done){
      test(app)
        .get('/db/non-existent')
        .expect(404)
        .end(done);
    });
  });

  describe('clustering', function(){
    var servers = [];

    before(function(done){
      for (var i = 0; i < 3; i++) servers.push(new Server());
      var nodes = servers.map(function(server){ return server.cruise; });
      nodes.forEach(function(node){
        nodes.forEach(function(peer){
          node.addPeer(peer.host(), peer.port());
        });
      });

      setTimeout(done, 1000);
    });

    it('should record a key from the master', function(done){
      var leader = findLeader();
      done = after(3, done);
      test(leader.app())
        .post('/db/key')
        .send({ foo: 'bar' })
        .expect(200)
        .end(function(err){
          assert(!err);
          setTimeout(verify, 300);
        });

      function verify(){
        servers.forEach(function(server){
          test(server.app())
            .get('/db/key')
            .expect({ foo: 'bar' })
            .end(done);
        });
      }
    });

    /**
     * Finds the leader from the group of servers
     *
     * @return {Server} leader
     */

    function findLeader(){
      var leaders = servers
        .filter(function(server){
          return server.isLeader();
        })
        .sort(function(x, y){
          return x.cruise.term() < y.cruise.term();
        });

      return leaders[0];
    }
  });
});