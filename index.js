var Q = require('q');

module.exports = Qedis;

function Qedis(redisClient) {
  this.redisClient = redisClient;
}

Qedis.prototype.exists = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'exists', cacheKey)
  .fail(failureHandler)
};

Qedis.prototype.fetch = function(cacheKey) {
  var self = this;
  return Q.ninvoke(this.redisClient, 'keys', cacheKey)
  .then(function(keys) {
    return Q.all(
      keys.map(function(key) {
        return self.get(key);
      })
    );
  })
  .fail(failureHandler)
};

Qedis.prototype.get = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'get', cacheKey)
  .then(JSON.parse.bind(JSON))
  .fail(failureHandler)
};

Qedis.prototype.set = function(cacheKey, value) {
  return Q.ninvoke(this.redisClient, 'set', cacheKey, JSON.stringify(value))
  .fail(failureHandler)
};

Qedis.prototype.blpop = function() {
  return Q.ninvoke.apply(Q, [this.redisClient, 'blpop'].concat([].slice.call(arguments)))
  .then(JSON.parse.bind(JSON))
  .fail(failureHandler)
};

Qedis.prototype.lrange = function(list, start, end) {
  return Q.ninvoke(this.redisClient, 'lrange', list, start, end)
  .then(JSON.parse.bind(JSON))
  .fail(failureHandler)
};

Qedis.prototype.lpop = function(list) {
  return Q.ninvoke(this.redisClient, 'lpop', list)
  .then(JSON.parse.bind(JSON))
  .fail(failureHandler)
};

Qedis.prototype.lpush = function(list, obj) {
  return Q.ninvoke(this.redisClient, 'lpush', list, JSON.stringify(obj))
  .fail(failureHandler)
};

Qedis.prototype.rpush = function(list, obj) {
  return Q.ninvoke(this.redisClient, 'rpush', list, JSON.stringify(obj))
  .fail(failureHandler)
};

Qedis.prototype.sendCommand = function(command, args) {
  return Q.ninvoke(this.redisClient, 'send_command', command, args)
  .fail(failureHandler);
};

function failureHandler(err) {
  console.log(err.stack);
  throw err;
}
