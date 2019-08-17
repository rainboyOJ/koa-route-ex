interface anyObj {
    [propName:string]:any
}

interface CTX {
    [propName:string]:any
}

interface CONFIG{
    [propName:string]:any
}

interface Middleware_Function_2_Parameter {
    (ctx:CTX,next:Function):void;
}

interface Middleware_Function_3_Parameter {
    (ctx:CTX,config:CONFIG,next:Function):void;
}


type Middleware_Function = Middleware_Function_3_Parameter | Middleware_Function_2_Parameter


interface routeType {
    Middles:(string | Middleware_describe)[];
    container:containerType;
    url_regx:RegExp;
    Method:string ;

    setMethod(method:string):void;

    add(middles: string | string[] | Middleware_describe | Middleware_describe[]):void;

    getMiddle(i:number):Function | undefined;

    match(ctx:any):boolean;

    routes(ctx:any,next:Function):void;

    compose():Function;
}

interface containerType {
    readonly separator:string;
    register(list: Middleware_Function[] | Middleware_Function ,namespace:string | undefined):void;

    get(name:string, namespace:string | undefined):Function;
}

interface Middleware_describe {
    name:string;
    namespace?:string;
    argument?:anyObj;
}

interface routeFactoryType {
    container:containerType;
    register(list: Middleware_Function[] | Middleware_Function ,namespace:string | undefined):void;
    create(url_regx:string,middles:[]): routeType;
}
