var bindAll = require('bind-all');
var bodyParser = require('body-parser');
var Cruise = require('cruise');
var Db = require('./db');
var express = require('express');
var debug = require('debug')('cruise-db:server');

/**
 * Module `exports`.
 */

module.exports = Server;

/**
 * Server constructor
 */

function Server(){
  if (!this instanceof Server) return new Server();
  this.cruise = new Cruise();
  this.cruise.listen(port());
  var db = new Db();
  this.db = db;
  this.cruise.on('data', function(data){
    db.put(data.key, data.val);
  });
  bindAll(this);
}

/**
 * Creates a new app for mounting
 *
 * @return {App} app
 */

Server.prototype.app = function(){
  var app = express()
    .use(bodyParser())
    .post('/join', this.leader, this.join)
    .post('/db/:key', this.leader, this.put)
    .get('/db/:key', this.get);
  return app;
};

/**
 *
 */

Server.prototype.join = function(req, res, next){
  // TODO: fix me once safe membership changes have been added.
  var host = req.param('host');
  var port = req.param('port');
  var cruise = this.cruise;
  cruise.addPeer(host, port);
  res.send(200, {
    host: cruise.host(),
    port: cruise.port()
  });
}

/**
 * Set a value in our database
 *
 * @param {Request} req
 *   @param {String} key
 *   @param {Mixed} body  the value to set
 * @param {Response} res
 * @param {Function} next
 */

Server.prototype.put = function(req, res, next){
  var key = req.param('key');
  var val = req.body;
  debug('recording %s: %j', key, val);
  this.cruise.do({ key: key, val: val }, function(err, success){
    if (err) return res.send(500, err.message);
    if (!success) return res.send(500, 'could not set the value');
    res.send(200);
  });
};

/**
 * Retrieves the value from the database
 *
 * @param {Request} req
 *   @param {String} key
 * @param {Response} res
 * @param {Function} next
 */

Server.prototype.get = function(req, res, next){
  var key = req.param('key');
  var val = this.db.get(key);
  if (val == null) return res.send(404);
  res.send(val);
};

/**
 * Middleware to ensure that the command is sent to the leader
 *
 * @param {Request} req
 * @param {Res} response
 * @param {Function} next
 */

Server.prototype.leader = function(req, res, next){
  if (this.isLeader()) return next();
  res.send(400, 'changes must be sent to the leader');
};

/**
 * Return whether the current server is the leader
 *
 * @return {Boolean} isLeader
 */

Server.prototype.isLeader = function(){
  return this.cruise.isLeader();
}

/**
 * Get a random port for the cruise server
 */

function port(){
  return Math.floor((Math.random() * 55536) + 10000)
}