"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/**
 * @author rainboy
 *
 * ```typescript
 * var RouteIns = require("koa-route-ex")
 * asyn function foo(ctx,next){
 *      ctx.number = 1
 *      await next()
 * }
 * var ctx = {}
 *
 * RouteIns.container.register([foo],'std')
 * var route = RouteIns.create(['std.foo'])
 *
 * await route.routes()(ctx)
 * ```
 * */
const container_1 = __importDefault(require("./container"));
const path_to_regexp_1 = __importDefault(require("path-to-regexp"));
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default('koa-route-ex');
/**
 * route class
 * @author rainboy
 * @param url_regx 要匹配的路径 '/problem?id=1'
 * @param middles 中间件描述
 * @param container 挂载的中间件容器
 *
 *
 * ```typescript
 *  var middles = [
 *      'foo',
 *      'std.foo_1',
 *      {
 *          name:foo_2,
 *          namespace:'std',
 *          argument:{foo:bar}
 *      }
 *  ]
 * ```
 * */
class route {
    constructor(url_regx, middles, container) {
        this.Method = 'GET'; //default
        this.paramNames = [];
        this.path = url_regx;
        this.url_regx = path_to_regexp_1.default(url_regx, this.paramNames);
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
    /**
     * @description 返回捕获的params数组
     * @param path 待捕获的路径
     * */
    captures(path) {
        let match = path.match(this.url_regx);
        if (match) {
            return match.slice(1);
        }
        return null;
    }
    /**
     * @description Safe decodeURIComponent, won't throw any error.
     * If `decodeURIComponent` error happen, just return the original value.
     *
     * @param text text
     * @returns  URL decode original string.
     */
    safeDecodeURIComponent(text) {
        try {
            return decodeURIComponent(text);
        }
        catch (e) {
            return text;
        }
    }
    params(path, existingParams) {
        var captures = this.captures(path);
        var params = existingParams || {};
        if (!captures)
            return params;
        for (let len = captures.length, i = 0; i < len; i++) {
            if (this.paramNames[i]) {
                var c = captures[i];
                params[this.paramNames[i].name] = c ? this.safeDecodeURIComponent(c) : c;
            }
        }
        return params;
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
        if (ctx.method === undefined)
            matchMethod = true;
        else if (ctx.method === this.Method)
            matchMethod = true;
        if (ctx.path === undefined)
            matchUrl = true;
        else if (this.url_regx.exec(ctx.path))
            matchUrl = true;
        return matchUrl && matchMethod;
    }
    routes() {
        let self = this;
        return async function (ctx, next) {
            /** 1 if match */
            if (self.match(ctx)) {
                debug(`math: ${self.path}<==>${ctx.path}`);
                ctx.params = self.params(ctx.path, ctx.params);
                debug('Get Params :');
                debug(JSON.stringify(ctx.params, null, 4));
                let com = self.compose();
                await com(ctx, next);
            }
            else {
                debug(`not math!! : ${self.path}<==>${ctx.path}`);
                return next();
            }
        };
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
    /** proxy */
    register(list, namespace) {
        this.container.register(list, namespace);
    }
    create(url_regx, middles) {
        return new route(url_regx, middles, this.container);
    }
}
module.exports = routeFactory;
