var myPromise = require('./promise-polyfill').default;

// 1.Promise的立即执行性
function test_immediate_execution() {
    var p = new myPromise(function(resolve, reject){
        console.log('create a promise');
        resolve('success');
    });
        
    console.log('after new Promise');
        
    p.then(function(value){
        console.log(value);
    });
}

// 2.Promise 三种状态
function test_promise_status() {
    var p1 = new myPromise(function(resolve,reject){
        resolve(1);
    });
    var p2 = new myPromise(function(resolve,reject){
        setTimeout(function(){
            resolve(2);
        }, 500);
    });
    var p3 = new myPromise(function(resolve,reject){
        setTimeout(function(){
            reject(3);
        }, 500);
    });
        
    console.log(p1);
    console.log(p2);
    console.log(p3);
    setTimeout(function(){
        console.log(p2);
    }, 1000);
    setTimeout(function(){
        console.log(p3);
    }, 1000);
        
    p1.then(function(value){
        console.log(value);
    });
    p2.then(function(value){
        console.log(value);
    });
    p3.catch(function(err){
        console.log(err);
    });
}

// 3.Promise 状态的不可逆性
function test_irreversible() {
    var p1 = new Promise(function(resolve, reject){
        resolve('success1');
        resolve('success2');
    });
        
    var p2 = new Promise(function(resolve, reject){
        resolve('success');
        reject('reject');
    });
        
    p1.then(function(value){
        console.log(value);
    });
        
    p2.then(function(value){
        console.log(value);
    });
}

// 4.链式调用
function test_chain() {
    var p = new Promise(function(resolve, reject){
        resolve(1);
    });
    p.then(function(value){ //第一个then
        console.log(value);
        return value*2;
    }).then(function(value){ //第二个then
        console.log(value);
    }).then(function(value){ //第三个then
        console.log(value);
        return Promise.resolve('resolve');
    }).then(function(value){ //第四个then
        console.log(value);
        return Promise.reject('reject');
    }).then(function(value){ //第五个then
        console.log('resolve: '+ value);
    }, function(err){
        console.log('reject: ' + err);
    });
}

// 5.Promise then() 回调异步性
function test_callback_async() {
    var p = new Promise(function(resolve, reject){
        resolve('success');
    });
        
    p.then(function(value){
        console.log(value);
    });
        
    console.log('which one is called first ?');
}

// 6.Promise 中的异常
function test_exception () {
    var p1 = new Promise( function(resolve,reject){
        foo.bar();
        resolve( 1 );    
    });
        
    p1.then(
        function(value){
            console.log('p1 then value: ' + value);
        },
        function(err){
            console.log('p1 then err: ' + err);
        }
    ).then(
        function(value){
            console.log('p1 then then value: '+value);
        },
        function(err){
            console.log('p1 then then err: ' + err);
        }
    );
        
    var p2 = new Promise(function(resolve,reject){
        resolve( 2 );    
    });
        
    p2.then(
        function(value){
            console.log('p2 then value: ' + value);
            foo.bar();
        },
        function(err){
            console.log('p2 then err: ' + err);
        }
    ).then(
        function(value){
            console.log('p2 then then value: ' + value);
        },
        function(err){
            console.log('p2 then then err: ' + err);
            return 1;
        }
    ).then(
        function(value){
            console.log('p2 then then then value: ' + value);
        },
        function(err){
            console.log('p2 then then then err: ' + err);
        }
    );
}

// 7.Promise.resolve()
function test_resolve_in_promise() {
    var p1 = Promise.resolve( 1 );
    var p2 = Promise.resolve( p1 );
    var p3 = new Promise(function(resolve, reject){
        resolve(1);
    });
    var p4 = new Promise(function(resolve, reject){
        resolve(p1);
    });
    
    // Promise.resolve(...)可以接收一个值或者是一个Promise对象作为参数。
    // 当参数是普通值时，它返回一个resolved状态的Promise对象，
    // 对象的值就是这个参数；当参数是一个Promise对象时，它直接返回这个Promise参数。
    // 因此，p1 === p2。
    console.log(p1 === p2);
    console.log(p1 === p3);
    console.log(p1 === p4);
    console.log(p3 === p4);
    
    p4.then(function(value){
        console.log('p4=' + value);
    });
    
    p2.then(function(value){
        console.log('p2=' + value);
    });
    
    p1.then(function(value){
        console.log('p1=' + value);
    });
}

// 8.resolve vs reject
/*
Promise回调函数中的第一个参数resolve，会对Promise执行"拆箱"动作。
即当resolve的参数是一个Promise对象时，resolve会"拆箱"获取这个Promise对象的状态和值，

但这个过程是异步的。p1"拆箱"后，获取到Promise对象的状态是resolved，
因此fulfilled回调被执行；p2"拆箱"后，获取到Promise对象的状态是rejected，
因此rejected回调被执行。但Promise回调函数中的第二个参数reject不具备”拆箱“的能力，
reject的参数会直接传递给then方法中的rejected回调。
因此，即使p3 reject接收了一个resolved状态的Promise，then方法中被调用的依然是rejected，
并且参数就是reject接收到的Promise对象。
*/
function test_resolve_vs_reject() {
    var p1 = new myPromise(function(resolve, reject){
        resolve(myPromise.resolve('resolve'));
    });
      
    var p2 = new myPromise(function(resolve, reject){
        resolve(myPromise.reject('reject'));
    });
      
    var p3 = new myPromise(function(resolve, reject){
        reject(myPromise.resolve('resolve'));
    });
      
    p1.then(
        function fulfilled(value){
            console.log('fulfilled: ' + value);
        }, 
        function rejected(err){
            console.log('rejected: ' + err);
        }
    );
      
    p2.then(
        function fulfilled(value){
            console.log('fulfilled: ' + value);
        }, 
        function rejected(err){
            console.log('rejected: ' + err);
        }
    );
      
    p3.then(
        function fulfilled(value){
            console.log('fulfilled: ' + value);
        }, 
        function rejected(err){
            console.log('rejected: ' + err);
        }
    );
      
}


function test_resolve() {
    var p = new myPromise(function(resolve, reject) {
        resolve(1);
    });

    p.then(function(x) {
        console.log(x);
    });
}

function test_delay_resolve() {
    var p = new myPromise(function(resolve, reject) {
        setTimeout(function() {
            resolve(1);
        }, 1000);
    });

    p.then(function(x) {
        console.log(x);
    });
}

function test_then_chain() {
    var p = new myPromise(function(resolve, reject) {
        setTimeout(function() {
            console.log('first resolve');
            resolve(1);
        }, 1000);
    });

    p.then(function(data) {
        console.log(`chain ${data}`);
        return 1;
    }).then(function(x) {
        console.log(x);
    });
}


function test_then_chain_time() {
    var p = new myPromise(function(resolve, reject) {
        setTimeout(function() {
            console.log('1 resolve');
            resolve(1);
            // resolve(deferred.promise, ret);
        }, 1000);
    });

    // then1
    // 每个 then 的调动都会产生一个 pomise，并且产生一个 deferred 存入当前 promise 的 
    //  _deferreds 数组。
    // deferred 代表 promise解决后需要处理的回调
    // deferred 是一个 Handler 对象, 它的 promise 存储下一个需要处理的 promise。
    // p._deferreds[0] 为p第一个 then 对应的 deferred, 它的promise 指向 第一个 then 产生的 promise
    // 如此形成一个  deferred 链
    var a = p.then(function(data) {
        console.log('then 第一次调用' + data);
        return new myPromise(function(resolve, reject) {
            setTimeout(function() {
                console.log('2 resolve');
                // 这里2的解决，导致 下面 then 的 resolved 回调函数的调用
                // 调用返回后，会获得一个ret,此处是 promise1
                // 用这个 promise1 去解决下个 then 的 promise（promise2）。
                // promise1 1 是 延迟解决，当前状态为 pedding,
                // 加入 promise2 的延迟解决队列
                resolve(2);
            }, 1000);
        });
    // then2
    }).then(function(data) {
        console.log('then 第二次调用' + data);
        return new myPromise(function(resolve, reject) {
            // setTimeout(function() {
            //     console.log('3 resolve');
            //     // 此时的resolve作用的对象仍然是 上层 new 的 promise
            //     resolve(3);
            // }, 1000);
            resolve(3);
        });
    }).then((a) =>console.log(a));

    
    console.log(a === p._deferreds[0].promise._deferreds[0].promise);
}


function test_then_chain_multi_time() {

    console.log('开始');
    var p = new myPromise(function(resolve, reject) {
        console.log('产生第一个 promise');
        setTimeout(function() {
            console.log('1 resolve -');
            resolve(1);
        }, 1000);
    });

    // then 的本质是往 promise 的 _deferreds 数组注册延时回调
    // 当 promise 解决时，延时回调函数被调用
    // 下面相当于给 p 注册了两个异步链

    /*
    开始
    产生第一个 promise
    开始调用p的第一个then
    开始调用p的第二个then
    到达第一轮循环尾部
    1 resolve -
    第一个then的resolve函数调用， data: 1
    第二个then的resolve函数调用， data: 1
    第一个then的promise解决， data: 1
    第二个then的promise解决， data: 1
    then 1 with 2
    then 2 with 3
    */
    console.log('开始调用p的第一个then');

    p.then(function(data) {
        console.log('第一个then的resolve函数调用， data: ' + data);
        return new myPromise(function(resolve, reject) {
            setTimeout(function() {
                console.log('第一个then的promise解决， data: ' + data);
                resolve(2);
            }, 1000);
        });
    }).then((x) => console.log('then 1 with ' + x));

    console.log('开始调用p的第二个then');
    p.then(function(data) {
        console.log('第二个then的resolve函数调用， data: ' + data);
        return new myPromise(function(resolve, reject) {
            setTimeout(function() {
                console.log('第二个then的promise解决， data: ' + data);
                resolve(3);
            }, 1000);
        });
    }).then((x) => console.log('then 2 with ' + x));

    console.log('到达第一轮循环尾部');
    //console.log(p);
}

function test_then_promise() {
    var p = new myPromise(function(resolve, reject) {
        resolve('初始化promise');
    });
    p.then(function() {
        return new myPromise(function(resolve, reject) {
            resolve('then里面的promise返回值1');
        });
    }).then(function(x) {
        console.log(x);
    });
}

function test_then_promise2() {
    var p = new myPromise(function(resolve, reject) {
        resolve('初始化promise');
    });
    p.then(function() {
        return new myPromise(function(resolve, reject) {
            resolve(new myPromise(function(resolve, reject) {
                resolve('then里面的promise返回值1');
            }));
        });
    }).then(function(x) {
        console.log(x);
    });
}

function test_then_no_call() {
    var p = new myPromise(function(resolve, reject) {
        resolve('初始化promise');
    });
    p.then().then(function(x) {
        console.log(x);
    });
}

function test_throw() {
    var p = new myPromise(function(resolve, reject) {
        resolve(1);
    });

    p.then(() => {
        console.log('then1');
        throw Error('Something failed');
    }
    ).then(() => console.log('then2')
    ).then(() => console.log('then3')
    ).catch((e) => console.log(e))
    ;
}

// 即使是一个已经变成 resolve 状态的 Promise，传递给 then 的函数也总是会被异步调用

function test_async_resolve() {
    myPromise.resolve().then(() => console.log(2));
    console.log(1); // 1, 2
}


function test_async_resolve2() {
    const wait = ms => new myPromise(resolve => setTimeout(resolve, ms));

    wait(1).then(() => console.log(4));
    myPromise.resolve().then(() => console.log(2)).then(() => console.log(3));
    console.log(1); // 1, 2, 3, 4
}

test_resolve_vs_reject();
