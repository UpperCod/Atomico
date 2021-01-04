import { expect } from "@esm-bundle/chai";
import { createHooks } from "../create-hooks.js";
import { useState } from "../hooks.js";

describe("src/hooks/use-state", () => {
    it("single execution", () => {
        let cycles = 0;
        let render = () => {
            expect(cycles).to.equal(1);
        };
        let hooks = createHooks(render);

        let load = () => {
            let [, setState] = useState(0);
            cycles++;
            setState();
        };

        hooks.load(load);
    });

    it("update cycle and executable status", async (done) => {
        let loop = 3;

        let render = () => {
            if (loop) {
                hooks.load(load);
                hooks.cleanEffects()();
            } else {
                done();
            }
        };

        let hooks = createHooks(render);

        let load = () => {
            let [state, setState] = useState(loop);
            expect(state).to.equal(loop);
            setState(() => --loop);
        };

        render();
    });

    it("callback based update", () => {
        let loop = 1;

        let render = () => {
            if (loop-- > 0) {
                hooks.load(load);
            }
        };

        let hooks = createHooks(render);

        let load = () => {
            const [state, setState] = useState(100);
            setState((state) => expect(state).to.equal(100));
        };

        render();
    });
});
