"use strict";

let co = require("bluebird").coroutine;
let Promise = require("bluebird");
let request = require("request");
let xml2js = Promise.promisifyAll(require("xml2js"));

module.exports = function(config) {
    this.type = "receiver";

    this.read = co(function*(data, subProperty) {
        let result = yield this.sendCommand("<YAMAHA_AV cmd=\"GET\">" + data + "</YAMAHA_AV>");
        // <YAMAHA_AV rsp="GET" RC="0"><System><Power_Control><Power>On</Power></Power_Control></System></YAMAHA_AV>

        console.log("res", result);
        if (!result || result.indexOf("<YAMAHA_AV rsp=\"GET\" RC=\"0\">") !== 0) {
            throw new Error("Response not formated correctly, " + result);
        }
        if (subProperty) {
            var parsed = yield xml2js.parseStringAsync(result);
            console.log(JSON.stringify(parsed,null,2))
            return parsed.YAMAHA_AV.Main_Zone[0].Surround[0].Program_Sel[0].Current[0].Sound_Program[0];
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
