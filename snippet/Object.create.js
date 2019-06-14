
/*
 Object.create()方法创建一个新对象，
 使用现有的对象来提供新创建的对象的__proto__。 
*/

Object.myCreate = function (obj, properties)  {
    var F = function ()  {};
    F.prototype = obj;

    var ret = new F();
    if (properties) {
        Object.defineProperties(ret, properties);
    }
    return ret;
};
  
var test = Object.myCreate({}, {a: {value: 1}});     // {a: 1}

console.log(test.a);
var o;

// 创建一个原型为null的空对象
o = Object.create(null);


o = {};
// 以字面量方式创建的空对象就相当于:
o = Object.create(Object.prototype);


o = Object.create(Object.prototype, {
    // foo会成为所创建对象的数据属性
    foo: { 
        writable:true,
        configurable:true,
        value: 'hello' 
    },
    // bar会成为所创建对象的访问器属性
    bar: {
        configurable: false,
        get: function() { return 10; },
        set: function(value) {
            console.log('Setting `o.bar` to', value);
        }
    }
});

const person = {
    isHuman: false,
    printIntroduction: function () {
        console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
    }
};
  
const me = Object.create(person);
  
me.name = 'Matthew'; // "name" is a property set on "me", but not on "person"

// 对新对象赋值时，不会改动继承链上的属性
// 直接添加到继承对象
me.isHuman = true; // inherited properties can be overwritten
  
me.printIntroduction();

delete me.isHuman;

console.log(me.__proto__=== person);
me.printIntroduction();
person.isHuman = true;
me.printIntroduction();



// Shape - 父类(superclass)
function Shape() {
    this.x = 0;
    this.y = 0;
}


// 父类的方法
Shape.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    console.info('Shape moved.');
};
  
// Rectangle - 子类(subclass)
function Rectangle() {
    Shape.call(this); // call super constructor.
}
  
// 子类续承父类

Rectangle.prototype = Object.create(Shape.prototype);
console.log(Rectangle.prototype.__proto__ === Shape.prototype);
Rectangle.prototype.constructor = Rectangle;
  
var rect = new Rectangle();
  
console.log('Is rect an instance of Rectangle?',
    rect instanceof Rectangle); // true
console.log('Is rect an instance of Shape?',
    rect instanceof Shape); // true
rect.move(1, 1); // Outputs, 'Shape moved.'