"use strict";

module.exports = {
    value: "Standard",
    type: "enum",
    values: [ "Standard", "7ch Stereo" ],
    get: function*(unit) {
        let result = yield unit.read("<Main_Zone><Surround><Program_Sel><Current>GetParam</Current></Program_Sel></Surround></Main_Zone>", "hej");

        if (result) {
            module.exports.value = result;
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (module.exports.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        yield unit.send("<Main_Zone><Surround><Program_Sel><Current><Sound_Program>"+value+"</Sound_Program></Current></Program_Sel></Surround></Main_Zone>");

        module.exports.value = value;
    }
};
