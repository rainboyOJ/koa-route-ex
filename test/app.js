var koa = require("koa")
var RouteIns = require("..")

var app = new koa()


async function sayHello(ctx,next){
    console.log('hello world')
    await next();
}

async function add_num (ctx,next){
    ctx.number = 1;
    await next();
}
async function print(ctx,next){
    console.log(ctx.number)
    ctx.body = `your number is ${ctx.number}`
}
RouteIns.container.register([sayHello,add_num,print])
var route = RouteIns.create('/',['sayHello','add_num','print'])


app.use(route.routes())
app.listen(3300,function(){
    console.log('listen at port 3300')
})
