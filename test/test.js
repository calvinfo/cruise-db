var Server = require('../');
var test = require('supertest');
var assert = require('assert');


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
    before(function(done){
      done = after(3, done);
      var ports = [4001, 4002, 4003];
      var servers = ports.map(function(port){
        var server = new Server();
        server
          .app()
          .listen(port);
      });


    });


  });

  it('should replicate across servers', function(){
    var ports =
    var servers = ports.map(function(port){

      server.app().listen(port);
    });



    function join(){
      ports.forEach(function(){

      });
    }




  });
});

/**
 * Run `fn` after `num` invocations
 *
 * No internets :'(
 */

function after(num, fn){
  return function(){
    if (num-- <= 0) fn.apply(fn, arguments);
  });
}