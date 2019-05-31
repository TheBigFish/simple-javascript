import promiseFinally from './finally';

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout;

function noop() {}

// Polyfill for Function.prototype.bind
function bind(fn, thisArg) {
    return function() {
        fn.apply(thisArg, arguments);
    };
}

/**
 * @constructor
 * @param {Function} fn
 */
function Promise(fn) {
    if (!(this instanceof Promise))
        throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    // _deferreds 存储延迟处理对象
    this._deferreds = [];

    // 执行当前 Promise 传入的程序
    doResolve(fn, this);
}

// promise 延时处理函数调用
function handle(self, deferred) {
    // 如果延时处理对象是 promise, 处理该 promise对象
    // 最终，self 会赋值为最后一个promise，该pomise, 状态可能为 0, 1, 2
    while (self._state === 3) {
        self = self._value;
    }
    // 如果是 pending 状态，则放入 _deferreds 数组
    // self 被换成了新的 promise
    // 将原来的 deferred 保存到新的 _deferreds 从而保持 deferred 链
    if (self._state === 0) {
        self._deferreds.push(deferred);
        return;
    }
    // 如果是 fulfilled 或者 rejected，加入本轮循环末尾
    self._handled = true;
    Promise._immediateFn(function() {
        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        // 如果当前 promise 没有注册任何的 onFulfilled onRejected
        // 也就是 then()
        // 那么将 当前的 _value 传递给 下一个promise
        // 通过对应 的 resolve reject 的调用，_state 状态也得到传递
        
        // 抛出的异常如果没有被 catch, 就会被当前的 promise (deferred.promise) 重新 reject
        // 从而传给下一个 promise
        if (cb === null) {
            (self._state === 1 ? resolve : reject)(
                deferred.promise,
                self._value
            );
            return;
        }
        var ret;
        try {
            ret = cb(self._value);
        } catch (e) {
            reject(deferred.promise, e);
            return;
        }
        // 处理下一个 Promise 的 then 回调方法
        // ret 作为上一个Promise then 回调 return的值 => 返回给下一个Promise then 作为输入值
        // then 在什么时候调用？上一个promise得到解决的时候。
        // 这里是 promise 链调用的关键。
        // 使用 上一个 ret 值来解决当前的 promise 的 deferred 的 promise 对象。
        resolve(deferred.promise, ret);
    });
}

/**
 * 使用值解决当前的 promise
 * self  promise 指针
 * newValue 传入的值
 * resolve,reject 是由用户在异步任务里面触发的回调函数
 * 调用 resolve reject 方法的注意点
 * 1、newValue不能为当前的 this 对象
 * const pro = new Promise((resolve)=>{setTimeout(function () {
 *   resolve(pro);
 * },1000)});
 *
 * pro.then(data => console.log(data)).catch(err => {console.log(err)});
 * 2、newValue可以为另一个Promise 对象类型实例， resolve 的值返回的是另一个 Promise 对象实例的内部的_value,
 * 而不是其本身 Promise 对象。即可以这样写
 * const pro1 = new Promise((resolve)=>{setTimeout(function () {
 *   resolve(100);
 * },2000)});
 * const pro = new Promise((resolve)=>{setTimeout(function () {
 *   resolve(pro1);
 * },1000)});
 * pro.then(data => console.log('resolve' + data)).catch(err => {console.log('reject' + err)});
 * // 输出结果：resolve 100
 * // data 并不是pro1对象
 */
function resolve(self, newValue) {
    try {
        // resolve 的值不能为本身 this 对象
        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === self)
            throw new TypeError('A promise cannot be resolved with itself.');
        if (
            newValue &&
            (typeof newValue === 'object' || typeof newValue === 'function')
        ) {
            var then = newValue.then;
            if (newValue instanceof Promise) {
                // 如果待解决的对象是一个 promise, 则将该 promise 赋给 当前 promise 的 _value, 
                // 在 finale 中循环处理得到最终的 promise 的结果。
                // 最终的 promise会 reject 或者 resolve 一个非 promise 值
                self._state = 3;
                self._value = newValue;
                finale(self);
                return;
            } else if (typeof then === 'function') {
                // 兼容类 Promise 对象的处理方式，对其 then 方法继续执行 doResolve
                // 相当于调用 newValue.then()
                // resolve 为解决这个 promise，可以提供三类值
                // 1. 值 
                // 2. promise 对象 
                // 3. 含有 then 方法的对象或者函数（then 方法内部可能调用 resolve 或者 reject）
                // 针对3， 则以当前 promise 调用一次 newValue 的 resolve。
                // 
                doResolve(bind(then, newValue), self);
                return;
            }
        }
        self._state = 1;
        self._value = newValue;
        finale(self);
    } catch (e) {
        reject(self, e);
    }
}

function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
}

/**
 * promise 状态设置后最终的处理，回调函数的执行
 * 
 */
function finale(self) {
    // 处理状态为 reject 但是没有注册reject处理的 promise
    if (self._state === 2 && self._deferreds.length === 0) {
        Promise._immediateFn(function() {
            // 如果未处理
            if (!self._handled) {
                Promise._unhandledRejectionFn(self._value);
            }
        });
    }

    // 调用注册的回调函数
    for (var i = 0, len = self._deferreds.length; i < len; i++) {
        handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
}

/**
 * Handle 构造函数
 * @param onFulfilled resolve 回调函数
 * @param onRejected reject 回调函数
 * @param promise 下一个 promise 实例对象
 * @constructor
 */
function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
/**
 * 执行当前 Promise 传入的函数
 * fn 传入的函数
 * self 对应的 promise
 *
 */
function doResolve(fn, self) {
    // done变量保护 resolve 和 reject 只执行一次
    var done = false;
    // 立即执行 Promise 传入的 fn(resolve,reject)
    // 闭包提供了 self 参数，即当前的 promise 对象
    try {
        fn(
            // 包装了 done 信息的resolve 回调
            function(value) {
                if (done) return;
                done = true;
                resolve(self, value);
            },
            // 包装了 done 信息的reject 回调
            function(reason) {
                if (done) return;
                done = true;
                reject(self, reason);
            }
        );
    } catch (ex) {
        //执行时抛出异常，以该异常 reject 该 promise
        if (done) return;
        done = true;
        reject(self, ex);
    }
}

Promise.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
};

Promise.prototype.then = function(onFulfilled, onRejected) {
    // 构造一个新 promise
    // @ts-ignore
    var prom = new this.constructor(noop);

    // 构造一个新的延迟处理对象 Handler
    // 处理该延迟处理对象
    handle(this, new Handler(onFulfilled, onRejected, prom));

    // 返回新的 promise 对象，以支持链式调用
    return prom;
};

Promise.prototype['finally'] = promiseFinally;

Promise.all = function(arr) {
    return new Promise(function(resolve, reject) {
        if (!arr || typeof arr.length === 'undefined')
            throw new TypeError('Promise.all accepts an array');
        var args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        var remaining = args.length;

        function res(i, val) {
            try {
                if (
                    val &&
                    (typeof val === 'object' || typeof val === 'function')
                ) {
                    var then = val.then;
                    if (typeof then === 'function') {
                        then.call(
                            val,
                            function(val) {
                                res(i, val);
                            },
                            reject
                        );
                        return;
                    }
                }
                args[i] = val;
                if (--remaining === 0) {
                    resolve(args);
                }
            } catch (ex) {
                reject(ex);
            }
        }

        for (var i = 0; i < args.length; i++) {
            res(i, args[i]);
        }
    });
};

Promise.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
    }

    return new Promise(function(resolve) {
        resolve(value);
    });
};

Promise.reject = function(value) {
    return new Promise(function(resolve, reject) {
        reject(value);
    });
};

Promise.race = function(values) {
    return new Promise(function(resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
        }
    });
};

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
    (typeof setImmediate === 'function' &&
        function(fn) {
            setImmediate(fn);
        }) ||
    function(fn) {
        setTimeoutFunc(fn, 0);
    };

Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
};

export default Promise;
