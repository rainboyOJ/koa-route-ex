"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Function容器 */
class container {
    constructor() {
        this.separator = '.';
        this.container = new Map();
    }
    /** 加入Function 到容器*/
    register(list, namespace) {
        if (typeof namespace === 'undefined' || namespace.length === 0) {
            namespace = 'global';
        }
        if (typeof list === 'function') {
            this.container.set(`${namespace}${this.separator}${list.name}`, list);
            return;
        }
        for (let l of list) {
            this.container.set(`${namespace}${this.separator}${l.name}`, l);
        }
    }
    /** 取出Function */
    get(name, namespace) {
        if (typeof namespace === 'undefined' || namespace.length === 0) {
            namespace = 'global';
        }
        let key = `${namespace}${this.separator}${name}`;
        if (this.container.has(key)) {
            return this.container.get(key);
        }
        throw new Error(`Do not have Function: ${key}`);
    }
}
exports.default = container;
