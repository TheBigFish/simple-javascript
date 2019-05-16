// 使用 Object.create 实现继承

function Person(first, last, age, gender, interests) {
    this.name = {
        first,
        last
    };
    this.age = age;
    this.gender = gender;
    this.interests = interests;
}

Person.prototype.greeting = function() {
    alert('Hi! I\'m ' + this.name.first + '.');
};

function Teacher(first, last, age, gender, interests, subject) {
    Person.call(this, first, last, age, gender, interests);

    this.subject = subject;
}

// Teacher 的 prototype 是一个对象，
// 这个对象继承自 Person.prototype
// 也就是 Teacher.prototype.__proto__ == Person.prototype
// 也就是实现了继承链：
// teacher -> Teacher -> Person -> Function -> Object

Teacher.prototype = Object.create(Person.prototype);
Teacher.prototype.constructor = Teacher;

let person = new Person('a', 'b', 12, 'male');
let teacher = new Teacher('a', 'b', 12, 'male', 'read', 'football');
