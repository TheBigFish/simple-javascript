function dotpath (str) {
    var parts = str.toString().split('.');
    var len = parts.length;
  
    return function parse (obj) {
        var testKey;
  
        for (var i = 0; i < len; ++i) {
            testKey = parts[i];
  
            if (!obj) return;
  
            obj = obj[testKey];
        }
  
        return obj;
    };
}

var lookup = dotpath('whatever.route.you.want1');

var result = lookup({whatever: {route: {you: {want: 'bingo'}}}});
console.log(result);



var isArray = Array.isArray;

/**
 * Check if `obj` is empty.
 *
 * @param  {object} obj
 * @return {boolean}
 *
 * @api public
 */

function isEmptyObject(obj) {
    if (!obj || typeof obj !== 'object' || isArray(obj))
        return false;
    return !Object.keys(obj).length;
}

console.log(isEmptyObject([]));