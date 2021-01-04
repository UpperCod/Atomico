import { expect } from "@esm-bundle/chai";
import { setup } from "../../element/setup.js";
import { h } from "../../render.js";
import { customElementScope } from "../element.test.js";

describe("internal: setup", () => {
    it("setup", async () => {
        const Component = () => h("host");

        class MyElement extends HTMLElement {
            /**@this import("../../element/custom-element").BaseContext */
            constructor() {
                super();
                this._props = {};
                setup(this, Component);
                expect(this.update).instanceOf(Function);
                expect(this.mount).instanceOf(Function);
                expect(this.unmount).instanceOf(Function);

                this.update();
            }
            /**@this import("../../element/custom-element").BaseContext */
            connectedCallback() {
                this.mount();
            }
        }

        const element = customElementScope(MyElement, false);

        expect(element.mounted).instanceOf(Promise);
        expect(element.unmounted).instanceOf(Promise);
        expect(element.updated).instanceOf(Promise);
    });
});
