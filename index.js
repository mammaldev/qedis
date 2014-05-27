var Q = require('q');

module.exports = Qedis;

function Qedis(redisClient) {
  this.redisClient = redisClient;
}

Qedis.prototype.exists = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'exists', cacheKey)
  .fail(function(err) {
    console.log(err);
    throw err;
  });
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
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.get = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'get', cacheKey)
  .then(JSON.parse.bind(JSON))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.set = function(cacheKey, value) {
  return Q.ninvoke(this.redisClient, 'set', cacheKey, JSON.stringify(value))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.blpop = function() {
  return Q.ninvoke.apply(Q, [this.redisClient, 'blpop'].concat([].slice.call(arguments)))
  .then(JSON.parse.bind(JSON))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.lrange = function(start, end) {
  return Q.ninvoke(this.redisClient, 'lrange', start, end)
  .then(JSON.parse.bind(JSON))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.lpop = function(list) {
  return Q.ninvoke(this.redisClient, 'lpop', list)
  .then(JSON.parse.bind(JSON))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.lpush = function(list, obj) {
  return Q.ninvoke(this.redisClient, 'lpush', list, JSON.stringify(obj))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};

Qedis.prototype.rpush = function(list, obj) {
  return Q.ninvoke(this.redisClient, 'rpush', list, JSON.stringify(obj))
  .fail(function(err) {
    console.log(err);
    throw err;
  });
};
