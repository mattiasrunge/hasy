"use strict";

let argv = require("yargs").argv;
let Control = require("./control");

let control = new Control();

control.start(argv);
