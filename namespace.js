'use strict';

const hooked = require('cls-hooked');

const namespaceID = 'test-instana';
const namespace = hooked.getNamespace(namespaceID) || hooked.createNamespace(namespaceID);

module.exports = namespace;