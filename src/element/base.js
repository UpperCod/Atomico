import { setPrototype, transformValue } from "./set-prototype.js";

/**
 *
 * @typedef {Object} BaseContext
 * @property {Promise<void>} mounted - After the component has mounted
 * @property {Promise<void>} unmounted - after the component has been completely removed from the document
 * @property {Promise<void>} updated - each update execution generates a queue of tasks grouped in updated
 * @property {Object<string,any>} _props - each update execution generates a queue of tasks grouped in updated
 * @property {Object<string,any>} [_change] - each update execution generates a queue of tasks grouped in updated
 * @property {string} [_ignoreAttr] - attribute that should be ignored at runtime
 * @property {()=>Promise<void>} _update - request an update
 * @property {()=>any} _render - request an update
 */

/**
 *
 * @param {HTMLElement} Base
 */
export let base = (Base) =>
    class El extends Base {
        constructor() {
            super();

            const { values } = this.constructor;

            this._props = {};
            this.mounted = new Promise((resolve) => (this.mount = resolve));
            this.unmounted = new Promise((resolve) => (this.unmount = resolve));

            for (let prop in values) this[prop] = values[prop];

            this._update();
            this.setup();
        }
        /**
         * Alias for constructor
         * @return {any}
         */
        setup() {}
        /**
         * View to render by the component
         * @return {any}
         */
        render() {}
        /**
         * Render request process
         * @return {any}
         */
        _render() {}
        /**
         * Update request process
         * @param {Object<string,any>} [nextProps]
         * @return {Promise<void>}
         */
        _update(nextProps) {
            if (!this._change) {
                const change = (this._change = {});
                const merge = () => {
                    delete this._change;
                    this._props = { ...this._props, ...change };
                };
                this.updated = this.mounted
                    .then(() => this._render(), merge)
                    .then(merge);
            }

            for (const prop in nextProps) this._change[prop] = nextProps[prop];

            return this.updated;
        }
        /**
         *  the class uses the execution of observedAttributes to set the prototypes
         */
        static get observedAttributes() {
            const { props, attrs = {}, values = {}, prototype } = this;
            for (const prop in props) {
                setPrototype(prototype, prop, props[prop], attrs, values);
            }
            this.attrs = attrs;
            this.values = values;
            return Object.keys(attrs);
        }
        /**
         * will solve the unmounted promise
         */
        connectedCallback() {
            this.mount();
        }
        /**
         * will solve the unmounted promise
         */
        async disconnectedCallback() {
            // The webcomponent will only resolve disconnected if it is
            // actually disconnected of the document, otherwise it will keep the record.
            await this.mounted;
            !this.isConnected && this.unmount();
        }
        /**
         * redirect updates to the prop system
         * @param {string} attr
         * @param {string} [oldValue]
         * @param {string} value
         */
        attributeChangedCallback(attr, oldValue, value) {
            if (attr === this._ignoreAttr || oldValue === value) return;
            const { attrs } = this.constructor;
            const { prop, type } = attrs[attr];
            this[prop] = transformValue(type, value);
        }
    };
