"use strict";

let co = require("bluebird").coroutine;
let logger = require('../../logger')(module);

module.exports = function(config, unit) {
    this.type = "message";

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            if (!config.port) {
                reject(new Error('port must be specified'));
            }
            if (!config.username || !config.password) {
                reject(new Error("username and password must be specified"));
            }

            let authCallback = function(username, password, callback) {
                let authOk = username == config.username && password == config.password;
                logger.debug("Auth OK");
                callback(!authOk, authOk);
            };

            let callback = function(json, done) {
                logger.debug("Got JSON:", JSON.stringify(json));
                unit.setProperty("Message", JSON.stringify(json), 0);
                done();
            };

            var express = require('express');
            var iftttWebhook = require('express-ifttt-webhook');
            let app = express();
            app.use(iftttWebhook(authCallback, callback));

            app.get('/', function (req, res) {
                logger.debug("request");
                res.status(403).send("403 Forbidden");
            });

            let server = app.listen(config.port, function () {
                logger.info('App listening at http://%s:%s', 'localhost', config.port);
            });
            resolve();
        }.bind(this));
    };
};
