import { expect } from "@esm-bundle/chai";
import { isEqualArray, isFunction, isObject } from "../utils.js";

describe("src/utils", () => {
    it("isEqualArray", () => {
        expect(isEqualArray([1, 2, 3, 4], [1, 2, 3, 4])).to.be.true;
        expect(isEqualArray([1, 2, 3, 4], [1, 2, 3])).to.be.false;
        expect(isEqualArray([5, 1, 2, 3], [1, 2, 3, 5])).to.be.false;
        expect(isEqualArray([], [])).to.be.true;
    });

    it("isFunction", () => {
        expect(isFunction(() => {})).to.be.true;
        expect(isFunction(null)).to.be.false;
        expect(isFunction(Function())).to.be.true;
        expect(isFunction(1)).to.be.false;
    });

    it("isObject", () => {
        expect(isObject(() => {})).to.be.false;
        expect(isObject(null)).to.be.true;
        expect(isObject([])).to.be.true;
        expect(isObject(1)).to.be.false;
    });
});
