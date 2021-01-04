import { expect } from "@esm-bundle/chai";
import { render } from "../render.js";
import html from "../../html/html.js";

describe("src/render", () => {
    it("textContent", () => {
        let el = document.createElement("div");
        let textValue = "any";
        render(html`<host>${textValue}</host>`, el);
        expect(el.textContent).to.equal(textValue);
    });

    it("Elimination of the style for non-use", () => {
        let el = document.createElement("div");

        [
            { style: "color: red;", cssText: "color: red;" },
            { style: { color: "red" }, cssText: "color: red;" },
        ].forEach(({ style, cssText }) => {
            render(html`<host style="${style}">0</host>`, el);
            expect(el.style.cssText).to.equal(cssText);

            render(html`<host>0</host>`, el);
            expect(el.style.cssText).to.equal("");
        });
    });

    it("ignore children", () => {
        let el = document.createElement("div");
        let htmlContent = "<h1>...</h1>";
        el.innerHTML = htmlContent;

        render(html`<host></host>`, el);

        expect(el.innerHTML).to.equal(htmlContent);
    });

    it("set attributes", () => {
        let el = document.createElement("div");

        let attrs = {
            "data-string": {
                value: "data-set",
                expect: "data-set",
            },
            "data-object": {
                value: {},
                expect: "{}",
            },
            "data-array": {
                value: [],
                expect: "[]",
            },
            class: {
                value: "class",
                expect: "class",
            },
            id: {
                value: "id",
                expect: "id",
            },
        };

        render(
            html`<host
                ...${Object.keys(attrs).reduce((props, key) => {
                    props[key] = attrs[key].value;
                    return props;
                }, {})}
            ></host>`,
            el
        );

        for (let key in attrs) {
            expect(el.getAttribute(key)).to.equal(attrs[key].expect);
        }
    });

    it("empty child", () => {
        let el = document.createElement("div");
        let content = html`<span>content</span>`;

        let view = (state) =>
            render(html`<host>${state && content}</host>`, el);

        let emptyValues = [null, false, undefined];

        emptyValues.map((value) => {
            view(true);

            expect(!!el.querySelector("span")).to.be.true;

            view(value);

            expect(el.querySelector("span")).to.be.null;
        });
    });

    it("shadowDom", () => {
        let el = document.createElement("div");

        render(html`<host shadowDom></host>`, el);

        expect(el.shadowRoot).to.be.is.not.null;
    });

    it("addEventListener", (done) => {
        let el = document.createElement("div");

        let handler = ({ target }) => {
            expect(target).to.equal(el);
            done();
        };

        render(html`<host onAnyEvent="${handler}"></host>`, el);

        el.dispatchEvent(new Event("AnyEvent"));
    });

    it("input", () => {
        let el = document.createElement("input");
        let initValue = "start";

        render(html`<host value="${initValue}"></host>`, el);

        expect(initValue).to.equal(el.value);
    });

    it("nodo raw", () => {
        let el = document.createElement("div");
        let raw = document.createElement("div");

        let initValue = "start";

        render(
            html`<host
                >${html`<${raw} style="color:red">...text</${raw}>`}</host
            >`,
            el
        );

        expect(el.querySelector(":scope > div")).to.equal(raw);
        /*@ts-ignore*/
        expect(el.querySelector(":scope > div").style.cssText).to.equal(
            "color: red;"
        );

        expect(el.querySelector(":scope > div").textContent).to.equal(
            "...text"
        );
    });
});
