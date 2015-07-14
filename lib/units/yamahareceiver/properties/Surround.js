"use strict";

module.exports = {
    value: "Standard",
    type: "enum",
    values: [ "Mono Movie", "Surround Decoder", "Standard", "2ch Stereo", "7ch Stereo" ],
    get: function*(unit) {
        let result = yield unit.read({ Main_Zone: { Surround: { Program_Sel: { Current: "GetParam" } } } });

        return this.value = result.Main_Zone.Surround.Program_Sel.Current.Sound_Program;
    },
    set: function*(unit, value) {
        if (this.values.indexOf(value) === -1) {
            throw new Error("Unknown value " + value);
        }

        yield unit.send({ Main_Zone: { Surround: { Program_Sel: { Current: { Sound_Program: value } } } } });

        this.value = value;
    }
};
