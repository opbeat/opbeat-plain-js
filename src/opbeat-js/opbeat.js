require('es6-promise')
var opbeatCore = require('opbeat-js-core')
var ServiceFactory = opbeatCore.ServiceFactory
var Opbeat = require('./opbeatPlain')

module.exports = new Opbeat(new ServiceFactory())
