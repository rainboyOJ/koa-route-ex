const routeIns = require("..")

const RouteIns = new routeIns()

async function add_attr(ctx,next){
    ctx.number = 1
    await next();
}
async function add_one(ctx,next){
    ctx.number++
    await next();
}

async function add_some(ctx,num,next){
    ctx.number += num
    await next();
}

async function print_attr(ctx,next){
    console.log(ctx)
}

var middles = [
'add_attr','add_one',
    {
        name:'add_some',
        argument:100,
    },
'print_attr'
]


RouteIns.register([add_attr,print_attr,add_one,add_some])
RouteIns.register(add_one,'std')



var route_1 = RouteIns.create('/not_match',middles)
var route_2 = RouteIns.create('/',middles)

var na = Array.from(middles)
na.splice(2,0,'std.add_one')
var route_3 = RouteIns.create('/',na)

var ctx = {
    method:'GET',
    path:'/'
}

var ctx_params_path = {
    method:'GET',
    path:'/rainboy/1000'
}

var route_params = RouteIns.create('/:username/:id',middles)

async function main(){
    console.log('===========start===========')
    await route_1.routes(ctx,function(){
        console.log('===========no match===========')
    })
    await route_2.routes()(ctx,function(){})
    await route_3.routes()(ctx,function(){})
    await route_params.routes()(ctx_params_path,function(){})
}

main();
