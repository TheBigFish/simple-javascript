
// 模拟实现 new
var create = function ()  {
    // 创建一个空对象， 此时 __proto__ 指向Object.prototype
    var obj = new Object();       
    // 获得构造函数，arguments中去除第一个参数       
    var Constructor = [].shift.call(arguments);
    // 链接到原型，obj 可以访问到构造函数原型中的属性
    // 使用 new 创造出来的对象的 __proto__ 指向构造函数的 prototype
    obj.__proto__ = Constructor.prototype;
    // 绑定 this 实现继承，obj 可以访问到构造函数中的属性
    // 以 obj 为 this 运行构造函数
    var ret = Constructor.apply(obj, arguments);  
    // 如果构造函数返回的是原始值，忽略，如果返回对象，覆盖构造的实例
    return typeof ret === 'object' ? ret : obj;
};
 
function Person (name) {
    this.name = name;
}
 
Person.prototype.getName = function () {
    return this.name;
};
 
var a = create(Person, 'nancy');
console.log(a.name);  // nancy
console.log(a.getName); //nancy
console.log(Object.getPrototypeOf(a)  === Person.protoType); //true

