import {Key} from 'path-to-regexp/index'
declare var koaRouteEx : koaRouteEx.routeFactoryType
declare namespace koaRouteEx {
    export interface anyObj {
        [propName:string]:any
    }

    export interface CTX {
        [propName:string]:any
    }

    export interface CONFIG{
        [propName:string]:any
    }

    export interface Middleware_Function_2_Parameter {
        (ctx:CTX,next:Function):void;
    }

    export interface Middleware_Function_3_Parameter {
        (ctx:CTX,config:CONFIG,next:Function):void;
    }


    export type Middleware_Function = Middleware_Function_3_Parameter | Middleware_Function_2_Parameter

    export interface containerType {
        readonly separator:string;
        register(list: Middleware_Function[] | Middleware_Function ,namespace:string | undefined):void;

        get(name:string, namespace:string | undefined):Function;
    }


    export interface routeType {
        Middles:(string | Middleware_describe)[];
        container:containerType;
        url_regx:RegExp;
        Method:string ;
        paramNames:Key[];

        setMethod(method:string):void;


        captures(path:string):string[] | null;

        add(middles: string | string[] | Middleware_describe | Middleware_describe[]):void;

        getMiddle(i:number):Function | undefined;

        match(ctx:any):boolean;

        routes(ctx:any,next:Function):void;

        compose():Function;
    }


    export interface Middleware_describe {
        name:string;
        namespace?:string;
        argument?:anyObj;
    }

    interface routeFactoryType {
        container:containerType;
        register(list: Middleware_Function[] | Middleware_Function ,namespace:string | undefined):void;
        create(url_regx:string,middles:[]): routeType;
    }

}

export = koaRouteEx
