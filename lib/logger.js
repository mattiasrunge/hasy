"use strict";

let winston = require('winston');

var getLabel = function(callingModule) {
    var parts = callingModule.filename.split('/');
    return parts[parts.length - 2] + '/' + parts.pop();
};

module.exports = function(callingModule, level) {
  return new winston.Logger({
    transports: [new winston.transports.Console({
      label: getLabel(callingModule),
      level: level || 'debug',
      prettyPrint: true,
      colorize: true,
      silent: false,
      timestamp: true
    })]
  });
};
