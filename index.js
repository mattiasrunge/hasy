"use strict";

let argv = require("yargs").argv;
let Hasy = require("./lib/hasy");

let hasy = new Hasy();

hasy.start(argv);
