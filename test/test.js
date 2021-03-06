var Server = require('../');
var test = require('supertest');
var assert = require('assert');
var after = require('after');

describe('simple cruise-db', function(){
  var app;
  var server;
  beforeEach(function(done){
    server = new Server();
    app = server.app();
    var interval = setInterval(function(){
      if (!server.cruise.isLeader()) return;
      clearInterval(interval);
      done();
    }, 100);
  });

  describe('/join', function(){
    it('should return the host and port of the cruise leader', function(done){
      var cruise = server.cruise;
      test(app)
        .post('/join')
        .send({ addr: '127.0.0.1:4030' })
        .expect({
          peers: ['127.0.0.1:4030', cruise.addr()]
        })
        .end(function(err){
          assert(!err);
          assert.equal(cruise.peers().length, 1);
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
});

describe('clustering cruise-db', function(){
  var servers = [];

  before(function(done){
    for (var i = 0; i < 3; i++) servers.push(new Server());
    var nodes = servers.map(function(server){ return server.cruise; });
    nodes.forEach(function(node){
      nodes.forEach(function(peer){
        node.addPeer(peer.addr());
      });
    });

    setTimeout(done, 1000);
  });

  it('should record a key from the master', function(done){
    var leader = servers[0];
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
});