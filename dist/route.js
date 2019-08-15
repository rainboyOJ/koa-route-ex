"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const container_1 = __importDefault(require("./container"));
const path_to_regexp_1 = __importDefault(require("path-to-regexp"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('koa-route-ex');
class route {
    constructor(url_regx, middles, container) {
        this.Method = 'POST'; //default
        this.url_regx = path_to_regexp_1.default(url_regx);
        this.Middles = middles;
        this.container = container;
    }
    /** 设定 方法 use GET POST */
    setMethod(method) {
        this.Method = method;
    }
    /** 加入 Middles ,容器*/
    add(middles) {
        if (Array.isArray(middles)) {
            this.Middles = this.Middles.concat(middles);
        }
        else {
            this.Middles.push(middles);
        }
    }
    getMiddle(i) {
        if (i >= this.Middles.length)
            return undefined;
        let describe = this.Middles[i];
        let name;
        let name_space = undefined;
        let argument = undefined;
        if (typeof describe === 'string') {
            let split_name = describe.split(this.container.separator);
            if (split_name.length > 2)
                throw new Error(`to many split character ${this.container.separator} !`);
            if (split_name.length == 2) {
                name = split_name[1];
                name_space = split_name[0];
            }
            else {
                name = split_name[0];
            }
        }
        else {
            name = describe.name;
            name_space = describe.namespace;
            argument = describe.argument;
        }
        let fn = this.container.get(name, name_space);
        if (!argument) {
            return fn;
        }
        else
            return async function (ctx, next) {
                return fn(ctx, argument, next);
            };
    }
    match(ctx) {
        let matchMethod = false;
        let matchUrl = false;
        if (ctx.Method === undefined)
            matchMethod = true;
        else if (ctx.Method === this.Method)
            matchMethod = true;
        if (ctx.url === undefined)
            matchUrl = true;
        else if (this.url_regx.exec(ctx.url))
            matchUrl = true;
        return matchUrl && matchMethod;
    }
    async routes(ctx, next) {
        /** 1 if match */
        if (this.match(ctx)) {
            debug('match');
            let com = this.compose();
            await com(ctx, next);
        }
        else
            return next();
    }
    /** 运行 */
    compose() {
        let self = this;
        return function (context, next) {
            let index = -1;
            return dispatch(0);
            function dispatch(i) {
                if (i <= index)
                    return Promise.reject(new Error('next() called multiple times'));
                index = i;
                let fn = self.getMiddle(i);
                if (i === self.Middles.length)
                    fn = next;
                if (!fn)
                    return Promise.resolve();
                try {
                    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
        };
    }
}
class routeFactory {
    constructor() {
        this.container = new container_1.default();
    }
    create(url_regx, middles) {
        return new route(url_regx, middles, this.container);
    }
}
//export default route
exports.factory = new routeFactory();
