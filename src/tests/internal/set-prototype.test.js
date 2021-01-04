import { expect } from "@esm-bundle/chai";
import { setPrototype } from "../../element/set-prototype.js";

describe("internal: setPrototype", () => {
    it("declare basic", () => {
        class MyElement extends HTMLElement {}
        /**
         * @type {Object<string,string>}
         */
        const attrs = {};
        const values = {};
        const tagName = "internal-set-prototype";
        setPrototype(MyElement.prototype, "value", Number, attrs, values);

        customElements.define(tagName, MyElement);

        const element = document.createElement(tagName);

        expect(attrs).to.deep.equal({ value: "value" });
    });

    it("declare shema", () => {
        class MyElement extends HTMLElement {}
        /**
         * @type {Object<string,string>}
         */
        const attrs = {};
        const values = {};
        const tagName = "internal-set-prototype-schema";
        setPrototype(
            MyElement.prototype,
            "value",
            {
                type: Number,
                value: 1000,
            },
            attrs,
            values
        );

        customElements.define(tagName, MyElement);

        expect(attrs).to.deep.equal({ value: "value" });
        expect(values).to.deep.equal({ value: 1000 });
    });
});
