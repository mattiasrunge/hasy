"use strict";

let co = require("bluebird").coroutine;
let WebSocket = require('ws');
let Bluebird = require("bluebird");
let request = Bluebird.promisify(require('request'));
Bluebird.promisifyAll(request);
let logger = require('../../logger')(module);

module.exports = function(config, unit) {
  this.type = "message";

  const PB_STREAM_URL = 'wss://stream.pushbullet.com/websocket/';
  const PB_PUSHES_URL = 'https://api.pushbullet.com/v2/pushes?modified_after=';
  let lastUpdate = Math.floor(new Date().getTime() / 1000);

  let getPushes = co(function*() {
    let result = yield request(PB_PUSHES_URL + lastUpdate, { 'auth': { 'bearer': config.token } });
    lastUpdate = Math.floor(new Date().getTime() / 1000);
    let body = JSON.parse(result[1]);
    logger.info('Got ' + body.pushes.length + ' new pushes');
    body.pushes.forEach(function(push) {
      unit.setProperty('Message', JSON.stringify(push), 0);
    });
  });

  this.setup = function() {
    return new Promise(function(resolve, reject) {
      if (!config.token) {
        throw new Error('token required');
      }
      var ws = new WebSocket(PB_STREAM_URL + config.token);

      ws.on('open', function open() {
        logger.info('Websocket open');
      });

      ws.on('close', function close() {
        logger.info('Websocket closed');
      });

      ws.on('message', co(function*(data, flags) {
        data = JSON.parse(data);
        if (data.type == 'tickle') {
          yield getPushes();
        } else if (data.type == 'push') {
          unit.setProperty("Message", JSON.stringify(data), 0);
        } else {
          logger.debug('Ignoring message type: ' + data.type);
        }
      }, this));
      resolve();
    }.bind(this));
  };
};
