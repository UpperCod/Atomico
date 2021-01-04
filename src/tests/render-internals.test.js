import { expect } from "@esm-bundle/chai";
import {
    flat,
    setEvent,
    setPropertyStyle,
    diffProps,
    setProperty,
} from "../render.js";
import html from "../../html/html.js";

describe("src/render#flat", () => {
    it("flatDeep", () => {
        const vnode = html`<div></div>`;
        const children = flat([
            vnode,
            [vnode, vnode, vnode],
            [[vnode, vnode, vnode]],
        ]);
        expect(children.length).to.equal(7);
    });
    it("flatDeep null", () => {
        const ref = html`<div></div>`;
        const vnode = html`${null}${() => {}}${false}${[ref]}`;

        //@ts-ignore
        const result = flat(vnode);

        expect(result.length).to.equal(4);

        expect(result).deep.equal(["", "", "", ref]);
    });
    it("flatDeep saniate", () => {
        const script = html`<script>
            alert();
        </script>`;

        const vnode = html`<style>
            ${script}
        </style>`;
        //@ts-ignore
        expect(flat(vnode.children, true)).deep.equal([""]);
    });
});

describe("src/render#setEvent", () => {
    it("setEvent", (done) => {
        const handlers = {};
        const handler = () => {
            done();
        };
        const container = document.createElement("div");
        //@ts-ignore
        setEvent(container, "onclick", handler, handlers);
        container.click();
    });
});

describe("src/render#setPropertyStyle", () => {
    it("setPropertyStyle", () => {
        const container = document.createElement("div");

        setPropertyStyle(container.style, "width", "100px");

        expect(container.style.width).to.equal("100px");
    });
});

describe("src/render#diffProps", () => {
    it("diffProps", () => {
        const container = document.createElement("div");
        const props = {};
        const nextProps = { class: "my-class" };
        const handlers = {};

        diffProps(container, props, nextProps, handlers, false);

        expect(container.className).to.equal("my-class");

        diffProps(container, nextProps, props, handlers, false);

        expect(container.className).to.equal("");
    });
});

describe("src/render#setProperty", () => {
    it("setProperty", () => {
        const container = document.createElement("div");
        const handlers = {};
        //@ts-ignore
        setProperty(container, "class", "", "my-class", false, handlers);

        expect(container.className).to.equal("my-class");
        //@ts-ignore
        setProperty(container, "class", "my-class", "", false, handlers);

        expect(container.className).to.equal("");
    });
});
