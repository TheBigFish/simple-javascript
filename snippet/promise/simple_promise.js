
function MyPromise(executor) {
    var self = this;
    self.status = 'pending';
    self.value = undefined;
    self.reason = undefined;
    self.onFullfilledFun = [];
    self.onRejectedFun = [];
    
    function resolve(value){
        if(self.status === 'pending'){
            self.value = value;
            self.status = 'fullfilled';
            self.onFullfilledFun.forEach(function(fn){
                fn(self.value);
            });
        }
    }

    function reject(reason){
        if(self.status === 'pending'){
            self.reason = reason;
            self.status = 'rejected';
            self.onRejectedFun.forEach(function(fn){
                fn(self.reason);
            });
        }
    }

    function resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            reject(new TypeError('循环引用'));
        }

        let called;
        if(x !== null && typeof x==='function' || typeof x === 'object'){
            let then = x.then;
            try {
                if(typeof then === 'function') {
                    then.call(x, function(y){
                        
                    },function(err){
                        
                    });
                } else {
                    resolve(then);
                }
            }catch(e){
                if(called) return;
                called = true;
                reject(e);
            }
        }else{
            resolve(x);
        }
    }

    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}


MyPromise.prototype.then = function(onFullfilled, onRejected){
    var self = this;
    var MyPromise2;
    
    if(self.status === 'fullfilled') {
        MyPromise2 = new MyPromise(function(resolve, reject){
            try {
                let x =  onFullfilled(self.value);
                resolve(x);
            }catch(e){
                reject(e);
            }
        });
    }
    if(self.status === 'rejected') {
        MyPromise2 = new MyPromise(function(resolve, reject){
            try {
                let x =  onRejected(self.value);
                resolve(x);
            }catch(e){
                reject(e);
            }
        });
    }       
    if(self.status === 'pending') {
        MyPromise2 = new MyPromise(function(resolve, reject){
            self.onFullfilledFun.push(function(value){
                try {
                    let x =  onFullfilled(value);
                    resolve(x);
                }catch(e){
                    reject(e);
                }
            });
            self.onRejectedFun.push(function(reason){
                try {
                    let x =  onRejected(reason);
                    resolve(x);
                }catch(e){
                    reject(e);
                }
            });
        });
    }

    return MyPromise2;
};

let p = new MyPromise(function(resolve, reject) {
    setTimeout(()=>{
        resolve(100);
    }, 5000);
    //resolve(100);
});

p.then(function(data){
    console.log(`data:${data}`);
    return 222;
}, function(err){
    console.log(`data:${err}`);
}).then(function(data){
    console.log(`data2:${data}`);
});