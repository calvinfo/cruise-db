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
      test(app)
        .post('/join')
        .send({ host: '127.0.0.1', port: 4030 })
        .expect({
          host: server.cruise.host(),
          port: server.cruise.port()
        })
        .end(done);
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

  it('should replicate across servers', function(){
  });
});