
function objectPlus(o, stuff) {
    var n;
    function F() {}
    F.prototype = o;
    n = new F();
    n.uber = o;
    
    for (var i in stuff) {
        n[i] = stuff[i];
    }

    return n;
}

var shape = {
    name: 'shape',
    toString: function () {
        return this.name;
    }
};

var twoDee = objectPlus(shape, {
    name: '2D shape',
    toString: function() {
        return this.uber.toString + ', ' + this.name;
    }
});


var triangle = objectPlus(twoDee, {
    name: 'Triangle',
    getArea: function () { 
        return this.side * this.height / 2;
    },
    side: 0,
    height: 0
});