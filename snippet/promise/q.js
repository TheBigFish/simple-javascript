// var defer0 = function() {
//     var pending = [],
//         value;

//     return {
//         resolve: function(_value) {
//             value = _value;
//             for (var i = 0, len = pending.length; i < len; i++) {
//                 var callback = pending[i];
//                 callback(value);
//             }
//             pending = undefined;
//         },

//         then: function(callback) {
//             if (pending) {
//                 pending.push(callback);
//             } else {
//                 callback(value);
//             }
//         }
//     };
// };

// var p = defer0();

// setTimeout(() => p.resolve(1), 1000);

// p.then(data => console.log(`resolve with ${data}`));


var Promise = function () {
};

var isPromise = function (value) {
    return value instanceof Promise;
};

var defer1 = function () {
    var pending = [], value;
    var promise = new Promise();
    promise.then = function (callback) {
        if (pending) {
            pending.push(callback);
        } else {
            callback(value);
        }
    };
    return {
        resolve: function (_value) {
            if (pending) {
                value = _value;
                for (var i = 0, ii = pending.length; i < ii; i++) {
                    var callback = pending[i];
                    callback(value);
                }
                pending = undefined;
            }
        },
        promise: promise
    };
};

var p = defer1();

setTimeout(() => p.resolve(1), 1000);

p.promise.then(data => console.log(`resolve with ${data}`));