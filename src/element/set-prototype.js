import { isObject, isFunction } from "../utils.js";

/**
 * The Any type avoids the validation of prop types
 * @type {null}
 **/
export const Any = null;

/**
 * Attributes considered as valid boleanos
 * @type {Array<true|1|""|"1"|"true">}
 **/
const TRUE_VALUES = { true: 1, "": 1, 1: 1 };

/**
 * Constructs the setter and getter of the associated property
 * only if it is not defined in the prototype
 * @param {Object} proto
 * @param {string} prop
 * @param {any} schema
 * @param {Object<string,string>} attrs
 * @param {Object<string,any>} values
 */
export function setPrototype(proto, prop, schema, attrs, values) {
    /**@type {Schema} */
    let {
        type,
        reflect,
        event,
        value,
        attr = getAttr(prop),
    } = isObject(schema) && schema != Any ? schema : { type: schema };

    let isCallable = !(type == Function || type == Any);

    Object.defineProperty(proto, prop, {
        /**
         * @this {import("./base").Base}
         * @param {any} newValue
         */
        set(newValue) {
            let { _props, _change = _props } = this;
            let oldValue = _change[prop];
            let { error, value } = filterValue(
                type,
                isCallable && isFunction(newValue)
                    ? newValue(oldValue)
                    : newValue
            );
            if (error && value != null) {
                throw {
                    message: `The value defined for prop '${prop}' must be of type '${type.name}'`,
                    value,
                    target: this,
                };
            }

            if (oldValue == value) return;

            this._update();
            this._change[prop] = value;
            /**
             * 1.7.0 >, this position reduces the amount of updates to the DOM and render
             */
            if (event) dispatchEvent(this, event);
            /**
             * attribute mirroring must occur if component is mounted
             */
            this.updated.then(() => {
                if (reflect) {
                    this._ignoreAttr = attr;
                    reflectValue(this, type, attr, this[prop]);
                    this._ignoreAttr = null;
                }
            });
        },
        /**
         * @this {import("./base").Base}
         */
        get() {
            let { _props, _change = _props } = this;
            return _change[prop];
        },
    });

    if (value != null) {
        values[prop] = value;
    }

    attrs[attr] = { prop, type };
}

/**
 * Dispatch an event
 * @param {Element} node - DOM node to dispatch the event
 * @param {InternalEvent & InternalEventInit} event - Event to dispatch on node
 */
export const dispatchEvent = (
    node,
    { type, base = CustomEvent, ...eventInit }
) => node.dispatchEvent(new base(type, eventInit));

/**
 * Transform a Camel Case string to a Kebab case
 * @param {string} prop - string to apply the format
 * @returns {string}
 */
const getAttr = (prop) => prop.replace(/([A-Z])/g, "-$1").toLowerCase();

/**
 * reflects an attribute value of the given element as context
 * @param {Element} context
 * @param {any} type
 * @param {string} attr
 * @param {any} value
 */
const reflectValue = (context, type, attr, value) =>
    value == null || (type == Boolean && !value)
        ? context.removeAttribute(attr)
        : context.setAttribute(
              attr,
              isObject(value)
                  ? JSON.stringify(value)
                  : type == Boolean
                  ? ""
                  : value
          );

/**
 * transform a string to a value according to its type
 * @param {any} type
 * @param {string} value
 * @returns {any}
 */
export const transformValue = (type, value) =>
    type == Boolean
        ? !!TRUE_VALUES[value]
        : type == Number
        ? Number(value)
        : type == Array || type == Object
        ? JSON.parse(value)
        : value;
/**
 * Filter the values based on their type
 * @param {any} type
 * @param {any} value
 * @returns {{error?:boolean,value:any}}
 */
const filterValue = (type, value) =>
    type == Any
        ? { value }
        : type != String && value === ""
        ? { value: null }
        : {}.toString.call(value) == `[object ${type.name}]`
        ? { value, error: type == Number && Number.isNaN(value) }
        : { value, error: true };
/**
 * Type any, used to avoid type validation.
 * @typedef {null} Any
 */

/**
 * @typedef {Object} InternalEventInit
 * @property {typeof CustomEvent|typeof Event} [base] -
 * @property {boolean} [bubbles] - indicating whether the event bubbles. The default is false.
 * @property {boolean} [cancelable] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {boolean} [composed] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {any} [detail] - indicating whether the event will trigger listeners outside of a shadow root.
 */

/**
 * Interface used by dispatchEvent to automate event firing
 * @typedef {Object} InternalEvent
 * @property {string} type - type of event to dispatch.
 */

/**
 * @typedef {Object} Schema
 * @property {any} [type] - data type to be worked as property and attribute
 * @property {string} [attr] - allows customizing the name as an attribute by skipping the camelCase format
 * @property {boolean} [reflect] - reflects property as attribute of node
 * @property {InternalEvent} [event] - Allows to emit an event every time the property changes
 * @property {any} [value] - defines a default value when instantiating the component
 */
