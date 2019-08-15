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
