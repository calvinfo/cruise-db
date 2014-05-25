var bindAll = require('bind-all');
var bodyParser = require('body-parser');
var Cruise = require('cruise');
var Db = require('./db');
var debug = require('debug')('cruise-db:server');
var express = require('express');

/**
 * Module `exports`.
 */

module.exports = Server;

/**
 * Server constructor
 */

function Server(opts){
  if (!this instanceof Server) return new Server(opts);
  opts = opts || {};
  var addr = opts.addr || '127.0.0.1:' + port();
  this.cruise = new Cruise(addr);
  this.cruise.listen();
  var db = this.db = new Db();
  this.cruise
    .on('data', function(data){ db.put(data.key, data.val); })
    .on('add peer', function(peer){ debug('added peer %s', peer); });
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
    .post('/join', this.join)
    .post('/db/:key', this.put)
    .get('/db/:key', this.get);
  return app;
};

/**
 * Joins a peer to the leader node
 *
 * @param {Request} req
 *   @param {String} addr  e.g. 127.0.0.1:4001
 * @param {Response} res
 * @param {Function} next
 */

Server.prototype.join = function(req, res, next){
  var addr = req.param('addr');
  var cruise = this.cruise;
  cruise.join(addr);
  var peers = cruise
    .peers()
    .map(function(peer){
      return peer.addr();
    });
  peers.push(cruise.addr());
  res.send(200, {
    peers: peers
  });
};

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
  this.cruise.do({ key: key, val: val }, function(err){
    if (err) return res.send(500, err.message);
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
 * Get a random port for the cruise server
 */

function port(){
  return Math.floor((Math.random() * 55536) + 10000);
}