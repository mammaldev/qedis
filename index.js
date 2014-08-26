var Q = require('q');

module.exports = Qedis;

function Qedis(redisClient) {
  this.redisClient = redisClient;
}

Qedis.prototype.exists = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'exists', cacheKey)
  .fail(failureHandler);
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
  .fail(failureHandler);
};

Qedis.prototype.get = function(cacheKey) {
  return Q.ninvoke(this.redisClient, 'get', cacheKey)
  .then(b64DecodeAndJSONParse)
  .fail(failureHandler);
};

Qedis.prototype.set = function(cacheKey, value) {
  return Q.ninvoke(this.redisClient, 'set', cacheKey, jsonStringifyAndB64Encode(value))
  .fail(failureHandler);
};

Qedis.prototype.blpop = function() {
  var listKeys = [].slice.call(arguments);
  return Q.npost(this.redisClient, 'blpop', listKeys)
  .spread(function(key, item) {
    return b64DecodeAndJSONParse(item);
  })
  .fail(failureHandler);
};

Qedis.prototype.lrange = function(list, start, end) {
  return Q.ninvoke(this.redisClient, 'lrange', list, start, end)
  .then(function(items) {
    return items.map(function(item) {
      return b64DecodeAndJSONParse(item);
    });
  })
  .fail(failureHandler);
};

Qedis.prototype.lpop = function(list) {
  return Q.ninvoke(this.redisClient, 'lpop', list)
  .then(b64DecodeAndJSONParse)
  .fail(failureHandler);
};

Qedis.prototype.lpush = function(list) {
  var encodedItems = [].slice.call(arguments, 1).map(jsonStringifyAndB64Encode);
  var args = [ list ].concat(encodedItems);

  return Q.npost(this.redisClient, 'lpush', args)
  .fail(failureHandler);
};

Qedis.prototype.rpush = function(list) {
  var encodedItems = [].slice.call(arguments, 1).map(jsonStringifyAndB64Encode);
  var args = [ list ].concat(encodedItems);

  return Q.npost(this.redisClient, 'rpush', args)
  .fail(failureHandler);
};

Qedis.prototype.lindex = function(list, index) {
  return this.sendCommand('lindex', [list, index])
  .then(b64DecodeAndJSONParse)
  .fail(failureHandler);
};

Qedis.prototype.sendCommand = function(command, args) {
  return Q.ninvoke(this.redisClient, 'send_command', command, args)
  .fail(failureHandler);
};

Qedis.prototype.readonlyTransactionB64Decoded = function ( commands ) {
  return Q.ninvoke(this.redisClient.multi(commands), 'exec')
   .then(function ( data ) {
    if ( Array.isArray(data) && Array.isArray(data[ 0 ]) ) {
      return data[ 0 ].map(function ( item ) {
        return b64DecodeAndJSONParse(item);
      });
    }
    return data;
  })
  .fail(failureHandler);
};

Qedis.prototype.setex = function (cacheKey, expirePeriod, value) {
  return this.sendCommand('setex', [cacheKey, expirePeriod, jsonStringifyAndB64Encode(value)]);
};

function b64DecodeAndJSONParse( b64String ) {
  if ( b64String === null ) {
    return null;
  }
  return JSON.parse(new Buffer(b64String, 'base64').toString('utf16le'));
}

function jsonStringifyAndB64Encode( obj ) {
  return new Buffer(JSON.stringify(obj), 'utf16le').toString('base64');
}

function failureHandler(err) {
  console.log(err.stack);
  throw err;
}
