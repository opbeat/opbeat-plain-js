var utils = require('./utils')
var storage = require('./storage')

function Config () {
  this.config = {}
  this.defaults = {
    VERSION: '%%VERSION%%',
    apiHost: 'intake.opbeat.com',
    isInstalled: false,
    orgId: null,
    appId: null,
    angularAppName: null,
    performance: {
      enable: true,
      enableStackFrames: false
    },
    libraryPathPattern: '(node_modules|bower_components|webpack)',
    context: {
      user: {
        uuid: _generateUUID()
      },
      extra: null
    }
  }

  // Only generate stack frames 10% of the time
  var shouldGenerateStackFrames = utils.getRandomInt(0, 10) === 1
  if (shouldGenerateStackFrames) {
    this.defaults.performance.enableStackFrames = shouldGenerateStackFrames
  }
}

Config.prototype.init = function () {
  var scriptData = _getConfigFromScript()
  this.setConfig(scriptData)
}

Config.prototype.get = function (key) {
  return utils.arrayReduce(key.split('.'), function (obj, i) {
    return obj[i]
  }, this.config)
}

Config.prototype.set = function (key, value) {
  var levels = key.split('.')
  var max_level = levels.length - 1
  var target = this.config

  utils.arraySome(levels, function (level, i) {
    if (typeof level === 'undefined') {
      return true
    }
    if (i === max_level) {
      target[level] = value
    } else {
      var obj = target[level] || {}
      target[level] = obj
      target = obj
    }
  })
}

Config.prototype.setConfig = function (properties) {
  properties = properties || {}
  this.config = utils.mergeObject(this.defaults, properties)
}

Config.prototype.isValid = function () {
  var requiredKeys = ['appId', 'orgId']
  var values = requiredKeys.map(function (key) {
    return (this.config[key] === null) || (this.config[key] === undefined)
  }.bind(this))

  return values.indexOf(true) === -1
}

function _generateUUID () {
  var key = 'opbeat-uuid'
  var uuid = storage.get(key)

  if (!uuid) {
    uuid = utils.generateUuid()
    storage.set(key, uuid)
  }

  return uuid
}

var _getConfigFromScript = function () {
  var script = utils.getCurrentScript()
  var config = _getDataAttributesFromNode(script)
  return config
}

function _getDataAttributesFromNode (node) {
  var dataAttrs = {}
  var dataRegex = /^data\-([\w\-]+)$/

  if (node) {
    var attrs = node.attributes
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i]
      if (dataRegex.test(attr.nodeName)) {
        var key = attr.nodeName.match(dataRegex)[1]

        // camelCase key
        key = key.split('-').map(function (group, index) {
          return index > 0 ? group.charAt(0).toUpperCase() + group.substring(1) : group
        }).join('')

        dataAttrs[key] = attr.value || attr.nodeValue
      }
    }
  }

  return dataAttrs
}

module.exports = new Config()
