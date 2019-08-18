import {containerType,Middleware_Function} from '../index.d'
/** Function容器 */
class container implements containerType{
    container:Map<string,Function>
    readonly separator:string = '.'
    constructor(){
        this.container = new Map<string,Function>()
    }

    /** 加入Function 到容器*/
    register(list: Middleware_Function[] | Middleware_Function,namespace:string | undefined):void{

        if( typeof namespace === 'undefined' || (<string>namespace).length === 0){
            namespace = 'global'
        }

        if( typeof list === 'function' ){
            this.container.set(`${namespace}${this.separator}${list.name}`,list);
            return 
        }

        for( let l of list){
            this.container.set(`${namespace}${this.separator}${l.name}`,l);
        }

    }

    /** 取出Function */
    get(name:string,namespace:string | undefined):Function{

        if( typeof namespace === 'undefined' || (<string>namespace).length === 0){
            namespace = 'global'
        }
        let key = `${namespace}${this.separator}${name}`
        if( this.container.has(key) ){
            return <Function>this.container.get(key)
        }
        throw new Error(`Do not have Function: ${key}`)
    }
}

export default container
