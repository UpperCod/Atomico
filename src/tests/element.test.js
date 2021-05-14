import { expect } from "@esm-bundle/chai";
import { c, Any } from "../element/el-hooks";
import html from "../../html/html";

/**
 *
 * @param {any} component
 * @returns {any}
 */
export function customElementScope(component, autoScope = true) {
    let scope = `w-${(Math.random() + "").slice(2)}`;
    customElements.define(scope, autoScope ? c(component) : component);
    return document.createElement(scope);
}

describe("src/element", () => {
    it("create a customElement without declaring tagName", () => {
        //@ts-ignore
        expect(c(() => {}).prototype).to.be.an.instanceof(HTMLElement);
    });
    it("transfer of prop to virtual-dom", async () => {
        let value = 10;

        function Wc({ value }) {
            return html`<host>${value}</host>`;
        }

        Wc.props = {
            value: Number,
        };

        let node = customElementScope(Wc);

        document.body.appendChild(node);

        node.value = value;

        await node.updated;

        expect(node.textContent).to.equal(value + "");

        node.value = value = value + value;

        await node.updated;

        expect(node.textContent).to.equal(value + "");
    });

    it("property definition from the host tag", async () => {
        let cn = "my-class";

        function Wc({ cn }) {
            return html`<host class="${cn}"></host>`;
        }

        Wc.props = {
            cn: String,
        };

        let node = customElementScope(Wc);

        document.body.appendChild(node);

        node.cn = cn;

        await node.updated;

        expect(node.className).to.equal(cn);
    });
    it("schema Number", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Number,
        };

        let node = customElementScope(Wc);

        document.body.appendChild(node);

        await node.updated;

        node.setAttribute("value", "1000");

        await node.updated;

        expect(node.value).to.equal(1000);
    });
    it("schema Any", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Any,
        };

        let node = customElementScope(Wc);

        let nextValue;
        document.body.appendChild(node);

        await node.updated;
        nextValue = 1000;
        node.value = nextValue;

        await node.updated;

        expect(node.value).to.equal(nextValue);

        await node.updated;

        nextValue = Promise.resolve();
        node.value = nextValue;

        await node.updated;

        expect(node.value).to.equal(nextValue);

        nextValue = () => 10;
        node.value = nextValue;

        await node.updated;

        expect(node.value).to.equal(nextValue);
    });
    it("schema Object", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Object,
        };

        let node = customElementScope(Wc);
        let value = { value: 10 };

        document.body.appendChild(node);

        await node.updated;

        node.setAttribute("value", JSON.stringify(value));

        await node.updated;

        expect(node.value).to.deep.equal(value);
    });

    it("schema Array", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Array,
        };

        let node = customElementScope(Wc);
        let value = [{ value: 10 }];

        document.body.appendChild(node);

        await node.updated;

        node.setAttribute("value", JSON.stringify(value));

        await node.updated;

        expect(node.value).to.deep.equal(value);
    });

    it("schema String", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: String,
        };

        let node = customElementScope(Wc);
        let value = "message";

        document.body.appendChild(node);

        await node.updated;

        node.setAttribute("value", value);

        await node.updated;

        expect(node.value).to.equal(value);
    });
    it("schema Function, valid only as property", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Function,
        };

        let node = customElementScope(Wc);
        let value = () => "function";

        document.body.appendChild(node);

        await node.updated;

        node.value = value;

        await node.updated;

        expect(node.value).to.equal(value);
    });
    it("schema Function, valid only as property", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Promise,
        };

        let node = customElementScope(Wc);

        let value = Promise.resolve();

        document.body.appendChild(node);

        await node.updated;

        node.value = value;

        await node.updated;

        expect(node.value).to.equal(value);
    });
    it("schema Symbol, valid only as property", async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            value: Symbol,
        };

        let node = customElementScope(Wc);

        let value = Symbol();

        document.body.appendChild(node);

        await node.updated;

        node.value = value;

        await node.updated;

        expect(node.value).to.equal(value);
    });
    it('schema "" equals null', async () => {
        function Wc() {
            return html`<host />`;
        }

        Wc.props = {
            prop1: String,
            prop2: Object,
        };

        let node = customElementScope(Wc);

        node.prop1 = "content";
        node.prop1 = "";

        expect(node.prop1).to.equal("");

        node.prop2 = {};
        node.prop2 = "";

        expect(node.prop2).to.equal(null);
    });
});
