function api (opbeat, queuedCommands) {
  this.q = []

  this.opbeat = opbeat
  this.execute = this.execute.bind(this)
  this.push = this.push.bind(this)

  if (queuedCommands) {
    for (var i = 0; i < queuedCommands.length; i++) {
      var cmd = queuedCommands[i]
      this.push(cmd)
    }
  }
}

api.prototype.execute = function (cmd, args) {
  return this.opbeat[cmd].apply(this.opbeat, args)
}

api.prototype.push = function () {
  var argsArray = Array.prototype.slice.call(arguments)

  var cmd = argsArray.slice(0, 1)[0]
  var args = argsArray.slice(1)

  this.execute(cmd, args)
}

module.exports = api
