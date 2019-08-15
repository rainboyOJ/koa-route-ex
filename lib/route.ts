import container from './container'
import pathToRegexp  from 'path-to-regexp'
import Debug from 'debug'

const debug = Debug('koa-route-ex')
class route {
    Middles:(string | Middleware_describe)[]
    container:containerType
    url_regx:RegExp
    Method:string = 'POST' //default

    constructor(url_regx:string,middles:[],container:containerType) {

        this.url_regx = pathToRegexp(url_regx)
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

        if( ctx.Method  === undefined)
            matchMethod = true;
        else if(ctx.Method === this.Method)
            matchMethod = true;

        if( ctx.url === undefined)
            matchUrl = true
        else if ( this.url_regx.exec(ctx.url))
            matchUrl = true

        return matchUrl && matchMethod
    }

    async routes(ctx:any,next:Function){

        /** 1 if match */
        if(this.match(ctx)){
            debug('match')
            let com = this.compose()
            await com(ctx,next)
        }
        else
            return next()
    }

    /** 运行 */
    compose(){
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

class routeFactory {

    container:containerType;

    constructor(){ 
        this.container = new container();
    }

    create(url_regx:string,middles:[]){
        return new route(url_regx,middles,this.container)
    }

}

//export default route
export var factory = new routeFactory()

