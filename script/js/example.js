"use strict";
let log = (obj = '') => console.log(obj);
{
    {
        let b1 = false;
        if (b1)
            log('' + b1);
    }
    {
        let x1 = 6, x2 = 0b01011, x3 = 0o34672, x4 = 0x34afd;
        if (!x1 || !x2 || !x3 || !x4)
            log('0o' + x1.toString(8));
    }
    {
        let str1 = 'Hello, TypeScript!';
        if (!str1) {
        }
    }
    {
        let list1 = [1, 2, 3];
        list1.push(123);
        let list2 = ['1', '2', '3'];
        list2.push('4');
        let list3 = ["str", 1, false];
        list3.push(true);
        if (list3.length === 0) {
            log('list1: ' + list1.map((item) => typeof (item)));
            log('list2: ' + list2.map((item) => typeof (item)));
            log('list3: ' + list3.map((item) => typeof (item)));
        }
    }
    {
        let arr0 = [1, 2, '3', 4];
        let arr2 = arr0;
    }
    {
        let t1;
        t1 = ['1', 2];
        t1.push('false', '4');
        if (t1[1] === 5)
            log('tuple:' + t1.map((item) => typeof (item)));
    }
    {
        let Color;
        (function (Color) {
            Color[Color["Red"] = 1] = "Red";
            Color[Color["Green"] = 2] = "Green";
            Color[Color["Blue"] = 3] = "Blue";
        })(Color || (Color = {}));
        let c = Color.Red;
        if (Color.Green === 1) {
            log(Color[c]);
            log(Color[2]);
            log(Color.Blue);
        }
        let Direction;
        (function (Direction) {
            Direction["Up"] = "UP";
            Direction["Down"] = "DOWN";
            Direction["Left"] = "LEFT";
            Direction["Right"] = "RIGHT";
        })(Direction || (Direction = {}));
        let FalseTypes;
        (function (FalseTypes) {
            FalseTypes[FalseTypes["Number"] = 0] = "Number";
            FalseTypes["String"] = "";
            FalseTypes["Boolean"] = "FALSE";
        })(FalseTypes || (FalseTypes = {}));
    }
    {
        let u1 = 4;
        if (typeof (u1) === "number") {
            u1 = "something";
        }
        if (typeof (u1) === 'string') {
            let str1 = u1;
        }
    }
    {
        let a1 = 555;
    }
    {
        function func(str) {
            log(str);
        }
        let v1;
        let v2 = undefined;
        let v3 = void 0;
        if (v1 !== null)
            log('' + v1 + ', ' + v2 + ', ' + v3);
    }
    {
        let n1 = null;
        let n4 = undefined;
        let n5 = void 0;
    }
    {
        function funcError() {
            throw "Error";
        }
    }
    {
        let o1;
        o1 = {};
        o1 = [];
        let Color;
        (function (Color) {
            Color[Color["Red"] = 0] = "Red";
            Color[Color["Green"] = 1] = "Green";
            Color[Color["Blue"] = 2] = "Blue";
        })(Color || (Color = {}));
        ;
        o1 = Color;
    }
    {
        class Fish {
            constructor() {
                this.fly = 0;
            }
            swim() {
            }
            ;
        }
        class Bird {
            constructor() {
                this.swim = "";
            }
            fly() {
            }
            ;
        }
        let pet = (Math.random() > 0.5) ? new Bird() : new Fish();
        if ("fly" in pet && typeof (pet.fly) == 'function')
            pet.fly();
        if ("swim" in pet && typeof (pet.swim) == 'function')
            pet.swim();
        function isFish(pet) {
            return pet.swim != undefined && typeof (pet.swim) == 'function';
        }
        if (isFish(pet))
            pet.swim();
        else
            pet.fly();
    }
    {
        function func3(param) {
            return param ?? "default";
        }
    }
    {
        let arr = (Math.random() > 0.9) ? [1, 2, 3, 4] : undefined;
    }
    {
        let x1 = 1;
    }
    {
        let x1 = 1;
    }
}
{
    {
        let porche = {
            wheelsCount: 5,
            doorsCount: 3,
            clearence: 10,
            prop1: 15,
            start: function () {
                return this;
            },
            go() {
                return this;
            },
        };
        function Go(vehicle) {
        }
        function GoAgain(vehicle) {
            if (vehicle.wheelsCount) {
                vehicle.start().go();
            }
        }
        Go(porche);
        GoAgain(porche);
    }
    {
        function createSquare(config) {
            return { color: config.color || "red", area: config.width ? config.width * config.width : 0 };
        }
        let mySquare1 = createSquare({ colour: "red", width: 100 });
        let mySquare2 = createSquare({ colour: "red", width: 100 });
        let mySquare3 = { colour: "red", width: 100 };
        let mySquare4 = createSquare(mySquare3);
        let mySquare5 = createSquare({ width: 100 });
    }
    {
        let arr2 = {};
        arr2.name = '123';
        arr2['Hi'] = 'Hi';
        let arr3 = ['0', '1'];
    }
    {
        class Clock {
            constructor(hour, minute) {
                this.currentTime = new Date;
            }
            setTime(date) {
                this.currentTime = date;
            }
        }
    }
    {
        let square = {};
        square.color = "Blue";
    }
    {
    }
    {
        class Control {
        }
        class Button extends Control {
            select() { }
        }
        class TextBox extends Control {
        }
    }
}
{
    {
        function add(x, y) {
            return x + y;
        }
        let myAdd = function (x, y) {
            return x + y;
        };
    }
    {
        let z = 100;
        function addToZ(x, y) {
            return x + y + z;
        }
        z = 200;
    }
    {
    }
    {
        function sum(x, y = 0, z) {
            if (!z)
                z = 0;
            return x + y + z;
        }
    }
    {
        function getNumberArray(x, ...others) {
            let result = [x];
            let othersNumber = others.map((item, index, arr) => Number(item));
            result.push(...othersNumber);
            return result;
        }
    }
    {
    }
    {
        let suits = ["hearts", "spades", "clubs", "diamonds"];
        function pickCard(x) {
            if (typeof x == "object") {
                let pickedCard = Math.floor(Math.random() * x.length);
                return pickedCard;
            }
            else if (typeof x == "number") {
                let pickedSuit = Math.floor(x / 13);
                return { suit: suits[pickedSuit], card: x % 13 };
            }
        }
    }
}
{
    {
        let a1 = 'str';
        const a2 = 'str';
    }
    {
        function move(dx, dy, easingType) { }
        move(1, 2, 'ease-in');
        function createElement(tagName) {
            return new Element();
        }
    }
}
{
    {
        let func = (x) => {
            return x.toString();
        };
        let x;
    }
    {
        const handleArtistsResponse = (response) => {
            if (response.error) {
                console.error(response.error.message);
                return;
            }
            console.log(response.artists);
        };
    }
}
{
    {
        class Animal {
            constructor(name, hasTail = false) {
                this.name = name;
                this.hasTail = hasTail;
                this.id = ++Animal.ids;
            }
            move(distanceInMeters = 0) {
                log(`${this.name} moved ${distanceInMeters} m.`);
            }
        }
        Animal.ids = 0;
        class Dog extends Animal {
            constructor(name) {
                super(name, true);
            }
            voice() {
                log(`${this.name} says: "Woof-woof"`);
            }
        }
        let dog = new Dog("Tuzik");
    }
    {
        class Animal {
            constructor(name, hasTail = false) {
                this.name = name;
                this.hasTail = hasTail;
            }
            get Name() { return this.name; }
            set HasTail(value) { this.hasTail = value; }
        }
        let dog = new Animal("Tuzik", true);
    }
    {
        class Animal {
            constructor(name, hasTail = false) {
                this.name = name;
                this.hasTail = hasTail;
            }
            move(distanceInMeters = 0) {
                log(`${this.name} moved ${distanceInMeters} m.`);
            }
        }
        class Cat extends Animal {
            voice() {
                log(`${this.name} says "Myauu"`);
            }
            drink(whatDrink) {
                log(`${this.name} drink a ${whatDrink}`);
            }
        }
        let cat = new Cat("Barsik", true);
    }
    {
        class Point {
            constructor() {
                this.x = 0;
                this.y = 0;
            }
        }
        let point3d = { x: 1, y: 2, z: 3 };
    }
}
{
    function identity(args) {
        return args;
    }
}
{
    {
        function getAnimal(animal) {
            return animal;
        }
        const animal = getAnimal({ name: 'Vaska' });
    }
    {
        const animalRequired = { name: 'Vaska', legsCount: 4, volumeStomach: 2 }, animal = { name: 'Sharik' };
    }
    {
        function getAnimal(animal) {
            return animal;
        }
    }
    {
        const animal = {
            ignat: { name: 'Ignat' },
            pirat: { name: 'Pirat', legsCount: 3 },
            boris: { name: 'Boris' }
        };
        animal.ignat;
    }
    {
        const animal = {
            name: "Shurik",
            legsCount: 4,
        };
    }
    {
    }
    {
    }
    {
    }
    {
    }
    {
        function f1(a, b, c) {
            console.log(a + b.toString);
        }
        function f2(arg) {
            return arg.c;
        }
        ;
        const t1 = ['abc', 123, true];
        const t2 = [{ a: '2', b: 124, c: true }];
    }
    {
    }
    {
    }
    {
        class C {
            constructor() {
                this.b = 2;
                this.c = false;
                this.a = '1';
            }
        }
        const t1 = { a: '123', b: 123, c: true };
        const c1 = { a: '123', b: 123, c: false };
    }
    {
        class C {
            constructor() {
                this.name = 'Boris';
            }
        }
        function showName() {
            log(this.name);
        }
        showName.call(new C());
    }
    {
    }
    {
    }
    {
        const t1 = 'a', t2 = 'A';
    }
}
//# sourceMappingURL=example.js.map