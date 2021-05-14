import { base } from "./base.js";
import { render } from "../render.js";

export const el = (Base) =>
    class El extends base(Base) {
        constructor() {
            super();
            this.symbolId = Symbol();
        }
        async _render() {
            const { updated } = this;
            let nextUpdate;
            if (this.update) nextUpdate = await this.update(this._change);
            if (nextUpdate != false)
                updated.then(() =>
                    render(this.render(this._props), this, this.symbolId)
                );
        }
    };

export const El = el(HTMLElement);
