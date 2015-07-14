"use strict";

let co = require("bluebird").coroutine;
let promisifyAll = require("bluebird").promisifyAll;
let xml2js = promisifyAll(require("xml2js"));
let request = require("request");

module.exports = function(config) {
    this.type = "receiver";

    this.read = co(function*(data) {
        let result = yield this.sendCommand("GET", data);

        result = yield xml2js.parseStringAsync(result, { explicitArray: false });

        return result.YAMAHA_AV;
    }, this);

    this.send = co(function*(data) {

        return yield this.sendCommand("PUT", data);
    }, this);

    this.sendCommand = function(action, data) {
        data.$ = { cmd: action };

        let builder = new xml2js.Builder({ rootName: "YAMAHA_AV", renderOpts: { pretty: false }, headless: true });
        let options = {
            url: "http://" + config.hostname + "/YamahaRemoteControl/ctrl",
            body: builder.buildObject(data),
            headers: {
                "Content-Type": "text/xml; charset=UTF-8",
                "Cache-Control": "no-cache"
            }
        };

        return new Promise(function(resolve, reject) {
            request.post(options, function(error, response, body) {
                if (error) {
                    return reject(error);
                } else if (response.statusCode !== 200) {
                    return reject("Request did not return 200 OK");
                }

                resolve(body);
            });
        });
    };
};
