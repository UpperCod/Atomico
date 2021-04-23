import { isFunction, isObject } from "./utils.js";
// Object used to know which properties are extracted directly
// from the node to verify 2 if they have changed
const FROM_PROP = {
    id: 1,
    className: 1,
    checked: 1,
    value: 1,
    selected: 1,
};
// Map of attributes that escape the property analysis
const WITH_ATTR = {
    list: 1,
    type: 1,
    size: 1,
    form: 1,
    width: 1,
    height: 1,
    src: 1,
};
// Immutable for comparison of empty properties
const EMPTY_PROPS = {};
// Immutable for empty children comparison
const EMPTY_CHILDREN = [];
// Used to identify text type nodes when using Node.nodeType
const TYPE_TEXT = 3;
// Alias for document
const $ = document;
// Internal marker to know if the vdom comes from Atomico
export const vdom = Symbol();
// Symbol used to retrieve the key that associates the node to the keyes
export const KEY = Symbol();
// Default ID used to store the VDom state
export const ID = Symbol();
/**
 * @param {string|null|RawNode} type
 * @param {object} [p]
 * @param  {...any} children
 * @returns {Vdom}
 */
export function h(type, p, ...argsChildren) {
    let props = p || EMPTY_PROPS;

    let { children } = props;

    children = children || argsChildren;

    const raw = type
        ? type instanceof Node
            ? 1
            : type.prototype instanceof HTMLElement && 2
        : false;

    return {
        vdom,
        type,
        props,
        children,
        key: props.key,
        shadow: props.shadowDom,
        //@ts-ignore
        raw,
    };
}

/**
 * Create or update a node
 * Node: The declaration of types through JSDOC does not allow to compress
 * the exploration of the parameters
 * @param {any} vnode
 * @param {RawNode} node
 * @param {ID} [id]
 * @param {boolean} [isSvg]
 */

export function render(vnode, node, id = ID, isSvg) {
    let isNewNode;
    // If the node maintains the source vnode it escapes from the update tree
    if (node && node[id] && node[id].vnode == vnode) return node;
    // Injecting object out of Atomico context
    if (vnode && vnode.type && vnode.vdom != vdom) return node;

    // The process only continues when you may need to create a node
    if (vnode != null || !node) {
        isSvg = isSvg || vnode.type == "svg";
        isNewNode =
            vnode.type != "host" &&
            (vnode.raw == 1
                ? node != vnode.type
                : vnode.raw == 2
                ? !(node instanceof vnode.type)
                : node
                ? node.localName != vnode.type
                : !node);
        if (isNewNode) {
            let nextNode;
            if (vnode.type != null) {
                nextNode =
                    vnode.raw == 1
                        ? vnode.type
                        : vnode.raw == 2
                        ? new vnode.type()
                        : isSvg
                        ? $.createElementNS(
                              "http://www.w3.org/2000/svg",
                              vnode.type
                          )
                        : $.createElement(
                              vnode.type,
                              vnode.is ? { is: vnode.is } : undefined
                          );
            }
            node = nextNode;
        }
    }
    /**
     * @type {Vdom}
     */
    let oldVNode = node[id] ? node[id].vnode : EMPTY_PROPS;
    /**
     * @type {Vdom["props"]}
     */
    let oldVnodeProps = oldVNode.props || EMPTY_PROPS;
    /**
     * @type {Vdom["children"]}
     */
    let oldVnodeChildren = oldVNode.children || EMPTY_CHILDREN;
    /**
     * @type {Handlers}
     */
    let handlers = isNewNode || !node[id] ? {} : node[id].handlers;

    let fragment = node[id] && node[id].fragment;

    if (vnode.shadow) {
        if (!node.shadowRoot) {
            node.attachShadow({ mode: "open" });
        }
    }

    if (vnode.props != oldVnodeProps) {
        diffProps(node, oldVnodeProps, vnode.props, handlers, isSvg);
    }

    if (vnode.children != oldVnodeChildren) {
        let nextParent = vnode.shadow ? node.shadowRoot : node;
        fragment = renderChildren(
            vnode.children,
            /**
             * @todo for hydration use attribute and send childNodes
             */
            fragment,
            nextParent,
            id,
            // add support to foreignObject, children will escape from svg
            isSvg && vnode.type == "foreignObject" ? false : isSvg
        );
    }

    node[id] = { vnode, handlers, fragment };

    return node;
}
/**
 * This method should only be executed from render,
 * it allows rendering the children of the virtual-dom
 * @param {any} children
 * @param {Fragment} fragment
 * @param {RawNode|ShadowRoot} parent
 * @param {any} id
 * @param {boolean} isSvg
 */
export function renderChildren(children, fragment, parent, id, isSvg) {
    if (
        !(children = children
            ? Array.isArray(children)
                ? children
                : [children]
            : null)
    ) {
        return nextFragment;
    }

    /**
     * @type {Fragment}
     */
    let nextFragment = fragment || {
        s: parent.appendChild(new Comment()),
        e: parent.appendChild(new Comment()),
    };

    let nk;
    let { s, e, k } = nextFragment;
    let c = s;

    const flatMap = (children, p = 0) => {
        const { length } = children;
        for (let i = 0; i < length; i++) {
            const child = children[i];
            const type = typeof child;

            if (type == null || type == "boolean" || type == "function") {
                continue;
            } else if (Array.isArray(child)) {
                flatMap(child, p + i);
                continue;
            }

            const key = child.vdom && child.key;

            c = c == e ? e : c.nextSibling;

            const childNode = k && key != null ? k.get(key) : c;
            let nextChildNode = childNode;

            if (!child.vdom) {
                const text = child + "";
                if (nextChildNode.nodeType != TYPE_TEXT) {
                    nextChildNode = new Text(text);
                } else if (nextChildNode.data != text) {
                    nextChildNode.data = text;
                }
            } else {
                nextChildNode = render(child, childNode, id, isSvg);
            }

            if (!childNode) {
                c = parent.insertBefore(nextChildNode, c);
            } else if (k && nextChildNode != c) {
                c = parent.insertBefore(nextChildNode, c);
            } else if (nextChildNode != childNode) {
                if (childNode == e) {
                    c = parent.insertBefore(nextChildNode, e);
                } else {
                    parent.replaceChild(nextChildNode, childNode);
                }
            }
            if (key != null) {
                nk = nk || new Map();
                nk.set(key, nextChildNode);
            }
        }
    };

    flatMap(children);

    if (fragment && c != s && c != e) {
        c = c.nextSibling;
        while (c != e) {
            let r = c;
            c = c.nextSibling;
            r.remove();
        }
    }

    nextFragment.k = nk;

    return nextFragment;
}

/**
 *
 * @param {RawNode} node
 * @param {Object} props
 * @param {Object} nextProps
 * @param {boolean} isSvg
 * @param {Object} handlers
 **/
export function diffProps(node, props, nextProps, handlers, isSvg) {
    for (let key in props) {
        if (!(key in nextProps)) {
            setProperty(node, key, props[key], null, isSvg, handlers);
        }
    }
    for (let key in nextProps) {
        setProperty(node, key, props[key], nextProps[key], isSvg, handlers);
    }
}

/**
 *
 * @param {RawNode} node
 * @param {string} key
 * @param {any} prevValue
 * @param {any} nextValue
 * @param {boolean} isSvg
 * @param {Handlers} handlers
 */
export function setProperty(node, key, prevValue, nextValue, isSvg, handlers) {
    key = key == "class" && !isSvg ? "className" : key;
    // define empty value
    prevValue = prevValue == null ? null : prevValue;
    nextValue = nextValue == null ? null : nextValue;

    if (key in node && FROM_PROP[key]) {
        prevValue = node[key];
    }

    if (
        nextValue === prevValue ||
        key == "shadowDom" ||
        key == "children" ||
        key[0] == "_"
    )
        return;

    if (
        key[0] == "o" &&
        key[1] == "n" &&
        (isFunction(nextValue) || isFunction(prevValue))
    ) {
        setEvent(node, key.slice(2), nextValue, handlers);
    } else if (key == "key") {
        node[KEY] = nextValue;
    } else if (key == "ref") {
        if (nextValue) nextValue.current = node;
    } else if (key == "style") {
        let style = node.style;

        prevValue = prevValue || "";
        nextValue = nextValue || "";

        let prevIsObject = isObject(prevValue);
        let nextIsObject = isObject(nextValue);

        if (prevIsObject) {
            for (let key in prevValue) {
                if (nextIsObject) {
                    if (!(key in nextValue)) setPropertyStyle(style, key, null);
                } else {
                    break;
                }
            }
        }

        if (nextIsObject) {
            for (let key in nextValue) {
                let value = nextValue[key];
                if (prevIsObject && prevValue[key] === value) continue;
                setPropertyStyle(style, key, value);
            }
        } else {
            style.cssText = nextValue;
        }
    } else {
        if (
            (!isSvg && !WITH_ATTR[key] && key in node) ||
            isFunction(nextValue) ||
            isFunction(prevValue)
        ) {
            node[key] = nextValue == null ? "" : nextValue;
        } else if (nextValue == null) {
            node.removeAttribute(key);
        } else {
            node.setAttribute(
                key,
                isObject(nextValue) ? JSON.stringify(nextValue) : nextValue
            );
        }
    }
}

/**
 *
 * @param {RawNode} node
 * @param {string} type
 * @param {Listener} [nextHandler]
 * @param {Handlers} [handlers]
 */
export function setEvent(node, type, nextHandler, handlers) {
    // add handleEvent to handlers
    if (!handlers.handleEvent) {
        /**
         * {@link https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener#The_value_of_this_within_the_handler}
         **/
        handlers.handleEvent = (event) =>
            handlers[event.type].call(node, event);
    }
    if (nextHandler) {
        // create the subscriber if it does not exist
        if (!handlers[type]) {
            node.addEventListener(type, handlers);
        }
        // update the associated event
        handlers[type] = nextHandler;
    } else {
        // 	delete the associated event
        if (handlers[type]) {
            node.removeEventListener(type, handlers);
            delete handlers[type];
        }
    }
}
/**
 *
 * @param {*} style
 * @param {string} key
 * @param {string} value
 */
export function setPropertyStyle(style, key, value) {
    let method = "setProperty";
    if (value == null) {
        method = "removeProperty";
        value = null;
    }
    if (~key.indexOf("-")) {
        style[method](key, value);
    } else {
        style[key] = value;
    }
}

/**
 * @typedef {Map<any,Element>} Keyes
 */

/**
 * @typedef {Object} Fragment
 * @property {Comment} s
 * @property {Comment} e
 * @property {Keyes} [k]
 */

/**
 * @typedef {object} Vdom
 * @property {any} type
 * @property {symbol} vdom
 * @property {Object<string,any>} props
 * @property {FlatParamMap} [children]
 * @property {any} [key]
 * @property {boolean} [raw]
 * @property {boolean} [shadow]
 */

/**
 *
 * @typedef {Object} HandleEvent
 * @property {(event:Event|CustomEvent)=>any} handleEvent
 */

/**
 *
 * @typedef {(event:Event|CustomEvent)=>any} Listener
 */

/**
 * @typedef {Object<string,Listener> & HandleEvent } Handlers
 */

/**
 * @typedef {Object<string,any>} StyleFill
 */

/**
 * @typedef {Object} Style
 * @property {string} cssText
 */

/**
 * @typedef { any } RawNode
 */

/**
 * @typedef {symbol|string} ID
 */

/**
 * @typedef {Array<any> & {_?:Map<any,any>}} FlatParamMap
 */

/**
 * @typedef {ChildNode[] & {splice?:any}} Nodes
 */
