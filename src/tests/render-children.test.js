import { expect } from "@esm-bundle/chai";
import { flat, renderChildren } from "../render.js";
import html from "../../html/html.js";

describe("src/render#children", () => {
    let createRandomList = (max, list = [], min = 0) => {
        let addValues = () => {
            if (list.length < max) {
                let value = Math.floor(Math.random() * (max - min)) + min;
                if (!list.includes(value)) {
                    list.push(value);
                }
                addValues();
            }
            return list;
        };
        return addValues();
    };
    it("Render: Size", () => {
        const root = document.createElement("div");
        const children = [...Array(10)].map((_, id) => html`<span></span>`);
        const id = Symbol();
        const childNodes = renderChildren(children, [], root, id, false);
        expect(childNodes.length).to.equal(children.length);
    });
    it("Render: Simple list rendering", () => {
        const root = document.createElement("div");
        const id = Symbol();
        let childNodes = [];
        /**
         *
         * @param {number} size
         */
        let update = (size) => {
            let list = [...Array(size)];
            childNodes = renderChildren(
                flat(
                    list.map(
                        (_, index) =>
                            html`<span data-id="${index}">${index}</span>`
                    )
                ),
                childNodes,
                root,
                id,
                false
            );

            let children = [...root.querySelectorAll(":scope > span[data-id]")];

            if (children == null) {
                children = [];
            }

            expect(childNodes.length).to.equal(list.length);

            children.forEach((el, index) =>
                expect(el.getAttribute("data-id")).to.equal(index + "")
            );
        };
        update(66);
        update(10);
        update(0);
        update(11);
        update(33);
    });

    it("Render: Simple list rendering with keyes", () => {
        const root = document.createElement("div");
        let childNodes = [];
        const update = (size) => {
            const ref_1 = {};
            const list = createRandomList(size);
            const createRef = (ref, index) => (ref[index] = ref[index] || {});
            const id = Symbol();
            childNodes = renderChildren(
                flat(
                    list.map(
                        (index) => html`<span
                            key="${index}"
                            data-key="${index}"
                            ref="${createRef(ref_1, index)}"
                        >
                            ${index}
                        </span>`
                    )
                ),
                childNodes,
                root,
                id,
                false
            );

            list.forEach((key, i) => {
                expect(Number(childNodes[i].getAttribute("data-key"))).to.equal(
                    key
                );
            });

            list.reverse();

            let ref_2 = {};

            childNodes = renderChildren(
                flat(
                    list.map(
                        (index) =>
                            html`<span
                                key="${index}"
                                data-key="${index}"
                                ref="${createRef(ref_2, index)}"
                            >
                                ${index}
                            </span>`
                    )
                ),
                childNodes,
                root,
                id,
                false
            );

            list.forEach((key, i) => {
                expect(Number(childNodes[i].getAttribute("data-key"))).to.equal(
                    key
                );
            });

            for (const key in ref_1) {
                expect(ref_1[key].current).to.equal(ref_2[key].current);
            }
        };
        update(10);
    });
});
