var Server = require('../');
var test = require('supertest');

describe('cruise-db', function(){
  var app;
  beforeEach(function(done){
    var server = new Server();
    app = server.app();
    var interval = setInterval(function(){
      if (!server.isLeader()) return;
      clearInterval(interval);
      done();
    }, 100);
  });

  describe('/join', function(){
    var ports = [ ];

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