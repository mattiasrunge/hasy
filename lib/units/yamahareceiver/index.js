"use strict";

let co = require("bluebird").coroutine;
let request = require("request");

module.exports = function(config) {
    this.type = "receiver";

    this.read = co(function*(data) {
        let result = yield this.sendCommand("<YAMAHA_AV cmd=\"GET\">" + data + "</YAMAHA_AV>");
        // <YAMAHA_AV rsp="GET" RC="0"><System><Power_Control><Power>On</Power></Power_Control></System></YAMAHA_AV>

        if (!result || result.indexOf("<YAMAHA_AV rsp=\"GET\" RC=\"0\">") !== 0) {
            throw new Error("Response not formated correctly, " + result);
        }

        let match = result.match(/>([^<]+?)<\//);
        return match ? match[1] : null;
    }, this);

    this.send = co(function*(data) {
        return yield this.sendCommand("<YAMAHA_AV cmd=\"PUT\">" + data + "</YAMAHA_AV>");
    }, this);

    this.sendCommand = function(data) {
        let options = {
            url: "http://" + config.hostname + "/YamahaRemoteControl/ctrl",
            body: data,
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
