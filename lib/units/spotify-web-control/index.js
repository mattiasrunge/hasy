"use strict";

let Promise = require("bluebird");
let co = Promise.coroutine;
let logger = require('../../logger')(module);

module.exports = function(config, unit) {
  this.type = "remote";

  this.setup = function() {
    return new Promise(co(function*(resolve, reject) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // TODO: Find a real fix for this

      var nodeSpotifyWebHelper = require('node-spotify-webhelper');
      var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper({ port: 4371 });
      Promise.promisifyAll(spotify);

      let parseResponse = co(function*(res) {
        logger.debug("Assigning properties...");
        yield unit.setProperty('PlayState', res.playing ? "Playing" : "Paused");
        yield unit.setProperty('CurrentTrack', res.track.track_resource.uri);
      });

      let pollStatus = co(function*(timeout, callback) {
        logger.debug("Polling status");
        let retry = function(err) {
          logger.debug("Will retry because of error:", err);
          return Promise.delay(1000).then(pollStatus.bind(this, timeout, callback));
        };
        let promise = spotify.getStatusAsync(timeout || 60).then(parseResponse).error(retry);
        if (callback) {
          promise.then(callback);
        } else {
          promise.then(pollStatus.bind(this, timeout, callback));
        }
        return promise;
      });
      yield pollStatus(0, resolve);
      yield pollStatus();
    }.bind(this)));
  };
};
