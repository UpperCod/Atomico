import { expect } from "@esm-bundle/chai";
import { createHooks } from "../create-hooks.js";
import { useMemo, useCallback } from "../hooks.js";

describe("src/hooks/use-callback", () => {
    it("reflection of useMemo", () => {
        let hooks = createHooks();
        let load = (param) => {
            let fn = useCallback(() => param, [param]);
            expect(fn()).to.equal(param);
        };

        let update = (param) => {
            hooks.load(() => load(param));
        };

        update(1);
        update(1);
        update(2);
    });
});

describe("src/hooks/use-memo", () => {
    it("execution between updates without memorizing arguments", () => {
        let hooks = createHooks();
        let cycles = 0;
        let cyclesEffect = 0;
        let load = () => {
            cycles++;
            useMemo(() => {
                cyclesEffect++;
            });
        };

        let update = () => {
            hooks.load(load);
            hooks.cleanEffects()();
        };

        update();
        update();
        update();

        expect(cycles).to.equal(cyclesEffect);
    });

    it("execution between updates without memorizing arguments", () => {
        let hooks = createHooks();
        let cycles = 0;
        let values = {};
        let load = (value) => {
            values[cycles++] = useMemo(() => value, [value]);
        };

        let update = (value) => {
            hooks.load(() => load(value));
            hooks.cleanEffects()();
        };

        update(0); // values[0] = 0
        update(0); // values[1] = 0
        update(0); // values[2] = 0

        let ref = {};

        update(ref); // values[0] = ref
        update(ref); // values[2] = ref

        expect(values[0]).to.equal(0);
        expect(values[1]).to.equal(0);
        expect(values[2]).to.equal(0);

        expect(values[3]).to.equal(ref);
        expect(values[4]).to.equal(ref);
    });
});
