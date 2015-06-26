"use strict";

module.exports = {
    value: "HDMI1",
    type: "enum",
    values: [ "HDMI1", "HDMI2", "HDMI3", "HDMI4", "HDMI6", "AV1", "AV2", "AV3", "AV4", "AV5", "AV6" ],
    get: function*(unit) {
        let result = yield unit.read("<Main_Zone><Input><Input_Sel>GetParam</Input_Sel></Input></Main_Zone>");

        if (result) {
            module.exports.value = result;
        }

        return module.exports.value;
    },
    set: function*(unit, value) {
        if (module.exports.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        yield unit.send("<Main_Zone><Input><Input_Sel>" + value + "</Input_Sel></Input></Main_Zone>");

        module.exports.value = value;
    }
};
