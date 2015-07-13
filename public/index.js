"use strict";

requirejs.config({
    paths: {
        text: "node_modules/requirejs-text/text",
        lib: "lib",
        components: "components",
        knockout: "node_modules/knockout/build/output/knockout-latest.debug",
        mdl: "node_modules/material-design-lite/material"
    }
});

requirejs([ "lib/main" ]);
