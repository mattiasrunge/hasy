var argv = require('yargs').argv;
var Hasy = require("./lib/hasy");

var hasy = new Hasy();

hasy.start(argv);
