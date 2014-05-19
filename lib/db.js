var debug = require('debug')('cruise-db:db');

/**
 * Module `exports`.
 */

module.exports = Db;

/**
 * Creates a new database
 */

function Db(){
  if (!this instanceof Db) return new Db();
  this.store = {};
}

/**
 * Puts a key/value pair into the database
 *
 * @param {String} key
 * @param {Mixed} val
 * @return {this}
 */

Db.prototype.put = function(key, val){
  debug('put %s: %j', key, val);
  this.store[key] = val;
  return this;
}

/**
 * Gets a value from the database
 *
 * @param {String} key
 * @return {Mixed} val
 */

Db.prototype.get = function(key){
  var val = this.store[key];
  debug('get %s: %j', key, val);
  return val;
};