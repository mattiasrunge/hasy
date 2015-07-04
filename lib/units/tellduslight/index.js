"use strict";

let tellsock = require("node-tellsock");
let co = require("bluebird").coroutine;

let TelldusEvents = tellsock.TelldusEvents;
let TelldusClient = tellsock.TelldusClient;

module.exports = function(config) {
    this.type = "light";
    this.tc = null;

    this.send = co(function*(value) {
        return yield this.sendCommand(value);
    }, this);

    this.sendCommand = function(value) {
        if (value === 0) {
            return this.tc.tdTurnOff(config.id);
        }

        return this.tc.tdDim(config.id, value);
    };

    this.setup = function() {
        return new Promise(function(resolve, reject) {
//             let events = new TelldusEvents();
            this.tc = new TelldusClient();
            resolve();

//             events.on('connect', function () {
//                 console.log('listening for events');
//                 resolve();
//             });
//
//             events.on('sensor', function (payload) {
//                 console.log('sensor', payload);
//             });
//
//             events.on('raw', function (payload) {
//                 console.log('raw', payload);
//             });
//
//             events.on('message', function (msg) {
//                 console.log('message', msg);
//             });

//             tc.tdGetNumberOfDevices()
//             .then(function (count) {
//                 console.log('%d number of devices is configured', count);
//                 return tc.tdGetName(5);
//             })
//             .then(function (name) {
//                 console.log('device 5 is called "%s"', name);
//                 return tc.tdMethods(5, tellsock.DeviceMethods.TURNON | tellsock.DeviceMethods.TURNOFF | tellsock.DeviceMethods.DIM);
//             })
//             .then(function (methods) {
//                 console.log('supports turnon', (methods & tellsock.DeviceMethods.TURNON) > 0);
//                 console.log('supports turnoff', (methods & tellsock.DeviceMethods.TURNOFF) > 0);
//                 console.log('supports dim', (methods & tellsock.DeviceMethods.DIM) > 0);
//                 return tc.tdTurnOn(5);
//             })
//             .then(function (result) {
//                 console.log('device 5 was turned on:', result === 0);
//                 return tc.tdTurnOff(5);
//             })
//             .then(function (result) {
//                 console.log('device 5 was turned off:', result === 0);
//             })
//             .catch(function (err) {
//                 console.error('and error occured', err);
//             });

        }.bind(this));
    };
};
