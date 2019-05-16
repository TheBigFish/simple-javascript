const Taxi = require('./taxi');

let p = new Taxi(
    //resolve(100);
);

console.log('test taxi');
p.then(function(data){
    console.log(`data:${data}`);
    return 222;
}, function(err){
    console.log(`data:${err}`);
}).then(function(data){
    console.log(`data2:${data}`);
});