"use strict";

let serialport = require("serialport");
let co = require("bluebird").coroutine;
let logger = require("../../logger")(module);

module.exports = function(config) {
    this.type = "tv";
    this.serialPort = null;
    this.pending = [];

    this.read = co(function*(cmd1, cmd2) {
        return yield this.sendCommand(cmd1, cmd2, "FF");
    }, this);

    this.send = co(function*(cmd1, cmd2, data) {
        return yield this.sendCommand(cmd1, cmd2, data);
    }, this);

    this.sendCommand = function(cmd1, cmd2, data) {
        return new Promise(function(resolve, reject) {
            this.serialPort.write(cmd1 + cmd2 + " 00 " + data + "\r", function(error) {
                if (error) {
                    return reject(error);
                }

                this.pending.push({ cmd1: cmd1, cmd2: cmd2, data: data, resolve: resolve, reject: reject });
            }.bind(this));
        }.bind(this));
    };

    this.setup = function() {
        return new Promise(function(resolve, reject) {
            logger.info("Opening serial port to " + config.device);
            this.serialPort = new serialport.SerialPort(config.device, {
                baudrate: config.baudrate,
                parser: serialport.parsers.readline("x")
            });

            this.serialPort.on("open", function() {
                logger.info("Serial port is now open!");

                this.serialPort.on("data", function(data) {
                    logger.info("Data received: " + data);

                   let parts = data.split(" ");
                   let cmd2 = parts[0];
                   let info = parts[2];

                   let action = this.pending.filter(function(item) {
                       return item.cmd2 === cmd2;
                   })[0];

                   if (!action) {
                       // TODO: Send as event
                       return;
                   }

                   this.pending.splice(this.pending.indexOf(action), 1);

                   if (info.substr(0, 2) === "NG") {
                       return action.reject("Failed to set value");
                   }

                   let raw = info.substr(2);

                   action.resolve(raw);

                }.bind(this));

                resolve();
            }.bind(this));
        }.bind(this));
    };
};
