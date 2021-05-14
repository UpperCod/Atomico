import { base } from "./base.js";
import { render } from "../render.js";
import { createHooks } from "../hooks/create-hooks.js";
export { Any } from "./set-prototype.js";
/**
 *
 * @param {any} component
 * @param {Base} [Base]
 */
export const c = (component, Base = HTMLElement) =>
    class El extends base(Base) {
        static get props() {
            const { props } = component;
            return props;
        }
        async setup() {
            this.symbolId = Symbol();
            const _hooks = (this._hooks = createHooks(
                () => this._update(),
                this
            ));
            await this.unmounted;
            _hooks.cleanEffects(true)();
        }
        _render() {
            const props = { ...this._props, ...this._change };
            const { _hooks, updated } = this;
            render(
                _hooks.load(() => component(props)),
                this,
                this.symbolId
            );
            delete this._change;
            // _hooks.
            updated.then(_hooks.cleanEffects());
        }
    };

/**
 * @typedef {typeof HTMLElement} Base
 */

/**
 * @typedef {Object} Context
 * @property {(value:any)=>void} mount
 * @property {(value:any)=>void} unmount
 * @property {Promise<void>} mounted
 * @property {Promise<void>} unmounted
 * @property {Promise<void>} updated
 * @property {()=>Promise<void>} update
 * @property {Object<string,any>} _props
 * @property {string} [_ignoreAttr]
 * @property {symbol} [symbolId]  - symbolId allows to obtain the symbol id that stores the state of the virtual-dom
 */

/**
 * @typedef {HTMLElement & Context} BaseContext
 */
