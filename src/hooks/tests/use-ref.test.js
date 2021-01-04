import { expect } from "@esm-bundle/chai";
import { createHooks } from "../create-hooks.js";
import { useRef } from "../hooks.js";

describe("src/hooks/use-ref", () => {
    it("referencia persistente de creacion", () => {
        let render = () => {};
        let hooks = createHooks(render, null);

        let load = (param) => {
            let ref = useRef(param);
            return ref.current;
        };

        expect(hooks.load(() => load(true))).to.be.true;
        expect(hooks.load(() => load(false))).to.be.true;
    });
});
