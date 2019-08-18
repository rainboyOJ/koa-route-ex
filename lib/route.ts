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
import container from './container'
import pathToRegexp  from 'path-to-regexp'
import Debug from 'debug'
const debug = Debug('koa-route-ex')
import {routeType,Middleware_describe,containerType,anyObj,CTX,routeFactoryType,Middleware_Function} from '../index.d'


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

class route implements routeType{
    Middles:(string | Middleware_describe)[]
    container:containerType
    url_regx:RegExp
    path:string
    Method:string = 'GET' //default
    paramNames:pathToRegexp.Key[]  = []

    constructor(url_regx:string,middles:(string | Middleware_describe)[],container:containerType) {

        this.path = url_regx
        this.url_regx = pathToRegexp(url_regx,this.paramNames)
        this.Middles = middles;
        this.container = container;

    }
    /** 设定 方法 use GET POST */
    setMethod(method:string) {
        this.Method = method
    }

    /** 加入 Middles ,容器*/
    add(middles: string | string[] | Middleware_describe | Middleware_describe[]) {
        if(Array.isArray(middles)){ this.Middles =  this.Middles.concat(middles)
        }
        else{
            this.Middles.push(middles)
        }
    }

    /** 
     * @description 返回捕获的params数组
     * @param path 待捕获的路径
     * */
    captures(path:string):string[] | null{
        let match = path.match(this.url_regx)
        if( match){
            return match.slice(1)
        }
        return null
    }


    /**
     * @description Safe decodeURIComponent, won't throw any error.
     * If `decodeURIComponent` error happen, just return the original value.
     *
     * @param text text
     * @returns  URL decode original string.
     */

    safeDecodeURIComponent(text:string):string {
        try {
            return decodeURIComponent(text);
        } catch (e) {
            return text;
        }
    }

    params(path:string,existingParams:anyObj){
        var captures = this.captures(path);
        var params = existingParams || {}

        if( !captures) return params

        for(let len = captures.length,i = 0;i<len;i++){
            if( this.paramNames[i]){
                var c = captures[i]
                params[this.paramNames[i].name] = c ? this.safeDecodeURIComponent(c):c;
            }
        }

        return params
    }




    getMiddle(i:number):Function | undefined{

        if( i >= this.Middles.length) return undefined

        let describe = this.Middles[i];
        let name:string
        let name_space:string |undefined = undefined
        let argument : anyObj | undefined = undefined

        if( typeof describe === 'string'){
            let split_name = describe.split(this.container.separator)
            if( split_name.length > 2)
                throw new Error(`to many split character ${this.container.separator} !`)
            if( split_name.length == 2){
                name = split_name[1]
                name_space = split_name[0]
            }
            else {
                name = split_name[0]
            }
        }
        else {
            name = describe.name
            name_space = describe.namespace
            argument = describe.argument
        }

        let fn = this.container.get(name, name_space)

        if( !argument){
            return fn
        }
        else 
            return async function(ctx:CTX,next:Function){
                return fn(ctx,argument,next)
            }

    }

    match(ctx:any):boolean{
        let matchMethod = false
        let matchUrl = false

        if( ctx.method  === undefined)
            matchMethod = true;
        else if(ctx.method === this.Method)
            matchMethod = true;

        if( ctx.path === undefined)
            matchUrl = true
        else if ( this.url_regx.exec(ctx.path))
            matchUrl = true

        return matchUrl && matchMethod
    }

    routes(){
        let self = this
        return async function(ctx:any,next:Function){
            /** 1 if match */
            if(self.match(ctx)){
                debug(`math: ${self.path}<==>${ctx.path}`)
                ctx.params = self.params(ctx.path, ctx.params)
                debug('Get Params :')
                debug( JSON.stringify(ctx.params,null,4))
                let com = self.compose()
                await com(ctx,next)
            }
            else{
                debug(`not math!! : ${self.path}<==>${ctx.path}`)
                return next()
            }
        }

    }

    /** 运行 */
    compose():Function{
        let self = this
        return function(context:CTX,next:Function){
            let index = -1;
            return dispatch(0)

            function dispatch(i:number):any {
                if( i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i;
                let fn = self.getMiddle(i)
                if( i === self.Middles.length ) fn = next

                if( !fn )  return Promise.resolve()
                
                try {
                    return Promise.resolve(fn(context,dispatch.bind(null,i+1)))
                }catch(err){
                    return Promise.reject(err)
                }

            }
        }
    }

}

class routeFactory implements routeFactoryType{

    container:containerType;

    constructor(){ 
        this.container = new container();
    }

    /** proxy */
    register(list: Middleware_Function[] | Middleware_Function,namespace:string | undefined):void{
        this.container.register(list, namespace);
    }

    create(url_regx:string,middles:[]){
        return new route(url_regx,middles,this.container)
    }

}

export  = new routeFactory()

