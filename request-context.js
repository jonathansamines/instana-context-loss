'use strict';

const crypto = require('crypto');
const namespace = require('./namespace');

function requestContextFactory() {
  return function requestContext(req, res, next) {
    namespace.run(() => {
      namespace.bindEmitter(req);
      namespace.bindEmitter(res);
      namespace.set('id', crypto.randomUUID());

      return next();
    })
  };
}

module.exports = requestContextFactory;