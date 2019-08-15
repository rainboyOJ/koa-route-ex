const {factory:RouteIns }= require("..")

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


console.log(RouteIns)
RouteIns.container.register([add_attr,print_attr,add_one,add_some])



var route_1 = RouteIns.create('/not_match',middles)
var route_2 = RouteIns.create('/',middles)

var ctx = {
    method:'POST',
    url:'/'
}

async function main(){
    console.log('===========start===========')
    await route_1.routes(ctx,function(){
        console.log('===========no match===========')
    })
    await route_2.routes(ctx,function(){})
}

main();
