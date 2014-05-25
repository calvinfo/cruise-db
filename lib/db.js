var debug = require('debug')('cruise-db:db');

/**
 * Module `exports`.
 */

module.exports = Db;

/**
 * Creates a new database
 */

function Db(path){
  if (!this instanceof Db) return new Db(path);
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
};

/**
 * Gets a value from the database
 *
 * @param {String} key
 * @return {Mixed} val
 */

Db.prototype.get = function(key, fn){
  debug('get %s: %j', key);
  return this.store[key];
};