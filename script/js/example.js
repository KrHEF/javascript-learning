/**
 * Created by ef on 21.09.2020.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var log = function (obj) {
    if (obj === void 0) { obj = ''; }
    return console.log(obj);
};
{
    // Использовать название типов примитивов с маленькой буквы!
    {
        var b1 = false;
        if (b1)
            log('' + b1);
    } // Boolean
    {
        var x1 = 6, x2 = 11, x3 = 14778, x4 = 0x34afd;
        if (!x1 || !x2 || !x3 || !x4)
            // Вывод в другой системе счисления
            log('0o' + x1.toString(8));
    } // Number
    {
        var str1 = 'Hello, TypeScript!';
        if (!str1) {
        }
    } // String
    {
        //Массив чисел, троку не добавить
        var list1 = [1, 2, 3];
        list1.push(123);
        // Массив строк через Array<string>
        var list2 = ['1', '2', '3'];
        list2.push('4');
        // Массив строк, чисел или логического типа
        var list3 = ["str", 1, false];
        list3.push(true);
        list3[list3.length] = null; // null это же объект, почему он проходит?
        if (list3.length === 0) {
            log('list1: ' + list1.map(function (item) { return typeof (item); }));
            log('list2: ' + list2.map(function (item) { return typeof (item); }));
            log('list3: ' + list3.map(function (item) { return typeof (item); }));
        }
    } // Array => [1, 2, 3, 4], Array<T>
    {
        var arr0 = [1, 2, '3', 4];
        // arr0.push(1);           // Error
        // arr0.length = 0;        // Error
        // let arr1: Array<number | string> = arr0;    // Error
        var arr2 = arr0; // Здесь потенциальная ошибка, т. к. arr0 может содержать
        // и число, но об этом мы не узнаем при присваивании.
        // log(arr2);
    } // ReadonlyArray<T> - полностью иммутабельный
    {
        var t1 = void 0;
        t1 = ['1', 2];
        t1.push('false', '4'); // на самом деле должен быть баг
        t1.push(null);
        if (t1[1] === 5)
            log('tuple:' + t1.map(function (item) { return typeof (item); }));
    } // Tuple (array) - в переводе Кортеж, заданный типами массив и кол-во элементов.
    {
        // Числовые и строковые перечисления
        // Элемент перечисления можно задавать функцией, но она должна стоять в конце, либо все элементы после него
        // должны быть инициированы значением или функцией.
        // Enum - тип для перечислений
        var Color = void 0;
        (function (Color) {
            Color[Color["Red"] = 1] = "Red";
            Color[Color["Green"] = 2] = "Green";
            Color[Color["Blue"] = 3] = "Blue";
        })(Color || (Color = {}));
        var c = Color.Red;
        if (Color.Green === 1) {
            //log(Color[0]);      // Empty
            log(Color[c]); // Red
            log(Color[2]); // Green
            log(Color.Blue); // 3
        }
        // Строковые перечисления
        // Каждый член должен быть инициирован. Т. к. это константы, то с большой буквы.
        var Direction = void 0;
        (function (Direction) {
            Direction["Up"] = "UP";
            Direction["Down"] = "DOWN";
            Direction["Left"] = "LEFT";
            Direction["Right"] = "RIGHT";
        })(Direction || (Direction = {}));
        // Смешанные пересчиталения (странное поведение, стоит использовать обдуманно)
        var FalseTypes = void 0;
        (function (FalseTypes) {
            FalseTypes[FalseTypes["Number"] = 0] = "Number";
            FalseTypes["String"] = "";
            FalseTypes["Boolean"] = "FALSE";
        })(FalseTypes || (FalseTypes = {}));
    } // Enum (object) - Именнованные константы. enum - это не тип, это вместо let.
    {
        var u1 = 4;
        if (typeof (u1) === "number") {
            u1 = "something";
        }
        if (typeof (u1) === 'string') {
            var str1 = u1;
            //log(str1);
        }
    } // Unknown - неизвестный тип. Присваивание другим переменным только через проверку типов.
    {
        var a1 = 555;
        //log(a1.substring(1)); // это ошибка, но компилятор не проверяет
    } // Any - любой тип, в отличие от Unknown можно присваивать другим переменным, отключает проверку типов!
    {
        function func(str) {
            log(str);
            // И ничего не возвращаем.
            // Если указать тип, то компилятор будет ругаться на отсутсвие return.
        }
        var v1 = null;
        var v2 = undefined;
        var v3 = void 0;
        //let v4: void = 5;     // Error
        if (v1 !== null)
            log('' + v1 + ', ' + v2 + ', ' + v3);
    } // Void - для функций в основном, для переменных странно.
    {
        var n0 = undefined;
        var n1 = null;
        var n2 = void 0;
        var n3 = null;
        var n4 = undefined;
        var n5 = void 0;
        // больше ничего не присовить
        // n1 = '';     // Error
        // n2 = 12;     // Error
    } // Null, Undefined - странные типы, кроме этих значений больше им ничего не происвоить.
    {
        function funcError() {
            throw "Error";
        }
        //log(funcError);
    } // Never - функция с never не должна закончиться (исключение или бесконечный цикл)
    {
        var o1 = void 0;
        // o1 = 1;         // Error
        // o1 = 'str';     // Error
        o1 = null;
        o1 = {};
        o1 = [];
        var Color = void 0;
        (function (Color) {
            Color[Color["Red"] = 0] = "Red";
            Color[Color["Green"] = 1] = "Green";
            Color[Color["Blue"] = 2] = "Blue";
        })(Color || (Color = {}));
        ;
        o1 = Color;
    } // Object - непримитив (объекты, масссивы)
    {
        var Fish = /** @class */ (function () {
            function Fish() {
                this.fly = 0;
            }
            Fish.prototype.swim = function () {
                // log('swim');
            };
            ;
            return Fish;
        }());
        var Bird = /** @class */ (function () {
            function Bird() {
                this.swim = "";
            }
            Bird.prototype.fly = function () {
                // log( "fly" );
            };
            ;
            return Bird;
        }());
        var pet = (Math.random() > 0.5) ? new Bird() : new Fish();
        // if (pet.fly) pet.fly();     // Error
        // Проверка оператором ... in ...
        if ("fly" in pet && typeof (pet.fly) == 'function')
            pet.fly();
        if ("swim" in pet && typeof (pet.swim) == 'function')
            pet.swim();
        // Проверка оператором ... in ..., через сужение false
        // Это бы работало, если бы мы не усложнили классы, добавив поля
        // if ( "fly" in pet && typeof(pet.fly) == 'function' ) pet.fly()
        // else pet.swim();
        // Предикат типа (pet is Fish) - специальный логический тип,
        // котороый подтверждает или опроворгает это утверждение.
        function isFish(pet) {
            return pet.swim != undefined && typeof (pet.swim) == 'function';
        }
        if (isFish(pet))
            pet.swim();
        else
            pet.fly();
        // instanceof, через prototype
    } // Защитники типов - сужение через проверку на существования члена экземпляра класса
    {
        function func3(param) {
            return param !== null && param !== void 0 ? param : "default";
        }
        // log( func3(null) );         // default
        // log( func3(undefined) );    // default
        // log( func3("undefined") );  // undefined - it is string
    } // Проверка на null (?? - оператор терсер)
    {
        // Не получислось придумать пример
        var arr = (Math.random() > 0.9) ? [1, 2, 3, 4] : undefined;
        // log(arr.length);
    } // prop! - отключение проверки на null и undefined, на совети разработчика
    // Приведение к типу (без преобразования)
    // на самом деле ничего не приводится, просто мы говоим компилятору "Отвали, я сам разберусь!"
    {
        var x1 = 1;
        //    log((x1 as string).length);       // Empty string;
    } // через "x as type"
    {
        var x1 = 1;
        // log((<string>x1).length);        // Empty string;
    } // через "<type>x"
} // Типы TypeScript:
{
    // Инстрефейсы работают по принципу "утиной типизации" или "стрктурнго подтипирования".
    // Компилятор проверяет, что переданный объект удовлетворяет описанной структуре
    //  name? - опциональное св-во
    //  readnonly - свойство только для чтения
    // Не могут содержать реализацию, в отличие от абстрактных классов
    {
        var porche = {
            wheelsCount: 5,
            doorsCount: 3,
            clearence: 10,
            prop1: 15,
            start: function () {
                // log("Start.")
                return this;
            },
            go: function () {
                // log("Go!")
                return this;
            },
        };
        function Go(vehicle) {
            // log( vehicle.wheelsCount );
        }
        function GoAgain(vehicle) {
            // log( vehicle.wheelsCount );
            if (vehicle.wheelsCount) {
                // log( vehicle.doorsCount );
                vehicle.start().go();
            }
        }
        Go(porche);
        GoAgain(porche);
    } // Пример 1
    {
        function createSquare(config) {
            return { color: config.color || "red", area: config.width ? config.width * config.width : 0 };
        }
        // Только через добавление к Интерфейсу [propName: string]: any;
        var mySquare1 = createSquare({ colour: "red", width: 100 });
        // Обход через приведение к типу
        var mySquare2 = createSquare({ colour: "red", width: 100 });
        // Через присваивание переменной
        var mySquare3 = { colour: "red", width: 100 };
        var mySquare4 = createSquare(mySquare3);
        var mySquare5 = createSquare({ width: 100 });
    } // Избыточные свойства и способы обхода
    {
        var arr2 = {};
        arr2.name = '123';
        arr2['Hi'] = 'Hi';
        var arr3 = ['0', '1']; // Массив задается при объявлении
        // arr3[2] = '2';           // и всё
    } // типы для индексов
    {
        var Clock = /** @class */ (function () {
            function Clock(hour, minute) {
                this.currentTime = new Date;
            }
            Clock.prototype.setTime = function (date) {
                this.currentTime = date;
            };
            return Clock;
        }());
    } // Классы реализующие интерфейс (ClassName implemets InterfaceName)
    {
        var square = {};
        square.color = "Blue";
        // square.sideLength = 15;
        // square.app = 1; // Error, нет такого поля
        // log(square);
    } // Наследование интерфейсов (InterfaceName extends InterfaceName1, InterfaceName2 ...)
    {
        // Ой чего-тот непросто!
    } // Гибридные типы
    {
        var Control = /** @class */ (function () {
            function Control() {
            }
            return Control;
        }());
        var Button = /** @class */ (function (_super) {
            __extends(Button, _super);
            function Button() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Button.prototype.select = function () { };
            return Button;
        }(Control));
        var TextBox = /** @class */ (function (_super) {
            __extends(TextBox, _super);
            function TextBox() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return TextBox;
        }(Control));
        // class ImageControl implements SelectableControl {
        //     private state: any;      // не может наследовать приватные поля
        //     select() {}
        // }
    } // Интерфейсы, расширяющие классы, для наследования защищенных и приватных полей
} // Интерфейсы TrueScript
{
    {
        // Named function
        function add(x, y) {
            return x + y;
        }
        // Anonymous function
        var myAdd = function (x, y) {
            return x + y;
        };
    } // Именованные функции и анонимные
    {
        var z_1 = 100;
        function addToZ(x, y) {
            return x + y + z_1;
        }
        // log(addToZ(1, 2));      // 103
        z_1 = 200;
        // log(addToZ(1, 2));      // 203
    } // Замыкания
    {
        // Необязательные парамтеры могут следовать только после обязательных.
    } // Необязательные параметры name?, если не задан, то  undefined.
    {
        // Параметры по умолчнию могут предшедствовать обязательным, но тогда надо завдать явно undefined, что неудобно.
        function sum(x, y, z) {
            if (y === void 0) { y = 0; }
            if (!z)
                z = 0;
            return x + y + z;
        }
        // log( sum(1, 2, 3) );    // 6
        // log( sum(1,2) );    // 3
        // log( sum(1) );  1
        // log( sum(1, undefined, NaN) );  // 1
    } // Параметры по умолчанию, как в JS. Можно не задавать, или передать undefined.
    {
        function getNumberArray(x) {
            var others = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                others[_i - 1] = arguments[_i];
            }
            var result = [x];
            var othersNumber = others.map(function (item, index, arr) { return Number(item); });
            result.push.apply(result, othersNumber);
            return result;
        }
        //log(getNumberArray(1, 2, '3', 4, '0xFF'));
    } // Остаточные параметры  ...param: string[]
    {
        // this идут первыми в списке параметров и по сути парамтером не являются, только указывают тип.
        // по умолчанию this типа any.
    } // Указение типа this в параметра
    {
        var suits_1 = ["hearts", "spades", "clubs", "diamonds"];
        function pickCard(x) {
            // Check to see if we're working with an object/array
            // if so, they gave us the deck and we'll pick the card
            if (typeof x == "object") {
                var pickedCard = Math.floor(Math.random() * x.length);
                return pickedCard;
            }
            // Otherwise just let them pick the card
            else if (typeof x == "number") {
                var pickedSuit = Math.floor(x / 13);
                return { suit: suits_1[pickedSuit], card: x % 13 };
            }
        }
    } // Перегрузки функнкций - задание возможных типов принимаемых параметров и возвращаемых значений.
} // Функции
{
    {
        var a1 = 'str';
        var a2 = 'str';
    } // Сужение, задание переменной через const, которая может иметь 1 значение, вместо бесконечно возможных.
    {
        function move(dx, dy, easingType) { }
        move(1, 2, 'ease-in');
        // ... more overloads ...
        function createElement(tagName) {
            // ... code goes here ...
            return new Element();
        }
    } // Задание типа через возможноые значений примитивов
} // Литеральные типы: String, Number, Boolean и задание типов
{
    { // Union Объединение типов number | string
        var func_1 = function (x) {
            return x.toString();
        };
        // Значение с типом Union имеют доступ к свойствам и методам, которые реализуют все типы объединения
        var x = void 0;
        //x = func(15);         // Тип станет string из-за функции.
        // x.substring(1);     // Error, метод substring не реализует массив
        // log( x.length );    // Св-во length реализуют оба типа
        // Для сужения  типов можно использовать Дискриминационные союзы, это несколько типов,
        // объединенных в 1 тип, у которых есть 1 общее свойства с литеральным типом,
        // при проверки на значение этого типа TypeScript точно поймет какой тип перед ним.
        // https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions
        // Также можно в проверке сделать проверку на полноту, если указать возвращаемое значение
        // или вызов ошибки в случае default
        // https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-exhaustiveness-checking
    } // Union / Объединение (через |)
    {
        var handleArtistsResponse = function (response) {
            if (response.error) {
                console.error(response.error.message);
                return;
            }
            console.log(response.artists);
        };
    } // Intersection / Пересечение (через &)
} // Intersection и Union для создание типов
{
    {
        // public - публичное поле, видно снаружи и следовательно в подклассах
        // protected - защищенные поля, не видны снаружи, но видны в подклассах
        // private - частные поля, видны только базовому классу
        // readonly - только для чтения, должен быть инициализирован при объявлении или в конструкторе.
        // static - статичные свойства и методы
        var Animal_1 = /** @class */ (function () {
            // Защищенный конструктор, нельзя вызвать, но можно переопределить.
            function Animal(name, hasTail) {
                if (hasTail === void 0) { hasTail = false; }
                this.name = name;
                this.hasTail = hasTail;
                this.id = ++Animal.ids;
            }
            Animal.prototype.move = function (distanceInMeters) {
                if (distanceInMeters === void 0) { distanceInMeters = 0; }
                log(this.name + " moved " + distanceInMeters + " m.");
            };
            Animal.ids = 0;
            return Animal;
        }());
        var Dog = /** @class */ (function (_super) {
            __extends(Dog, _super);
            function Dog(name) {
                return _super.call(this, name, true) || this;
            }
            Dog.prototype.voice = function () {
                log(this.name + " says: \"Woof-woof\"");
            };
            return Dog;
        }(Animal_1));
        var dog = new Dog("Tuzik");
        // dog.move(10);
        // dog.voice();
        // log(dog);
    } // Наследование и модификаторы
    {
        var Animal = /** @class */ (function () {
            function Animal(name, hasTail) {
                if (hasTail === void 0) { hasTail = false; }
                this.name = name;
                this.hasTail = hasTail;
                // Объявили защищенное поле name и приветное часнтное поле hasTail без присваивания и this
            }
            Object.defineProperty(Animal.prototype, "Name", {
                get: function () { return this.name; },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Animal.prototype, "HasTail", {
                set: function (value) { this.hasTail = value; },
                enumerable: false,
                configurable: true
            });
            return Animal;
        }());
        var dog = new Animal("Tuzik", true);
        //log(dog);
    } // Объявление и инициализция на месте // Геттеры и сеттеры
    {
        // На сколько я помню, асбтрактным является класс, который содержит хотя бы одно асбтрактное поле или метод.
        var Animal = /** @class */ (function () {
            function Animal(name, hasTail) {
                if (hasTail === void 0) { hasTail = false; }
                this.name = name;
                this.hasTail = hasTail;
            }
            Animal.prototype.move = function (distanceInMeters) {
                if (distanceInMeters === void 0) { distanceInMeters = 0; }
                log(this.name + " moved " + distanceInMeters + " m.");
            };
            return Animal;
        }());
        var Cat = /** @class */ (function (_super) {
            __extends(Cat, _super);
            function Cat() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Cat.prototype.voice = function () {
                log(this.name + " says \"Myauu\"");
            };
            Cat.prototype.drink = function (whatDrink) {
                log(this.name + " drink a " + whatDrink);
            };
            return Cat;
        }(Animal));
        // let cat: Animal = new Animal("Barsik", true);   // Error, абстрактный класс
        var cat = new Cat("Barsik", true);
        // cat.drink("milk");      // Error, Animal не содержит метод drink
        // (cat as Cat).drink("milk");  // Ok
    } // Абстрактные классы
    {
        var Point = /** @class */ (function () {
            function Point() {
            }
            return Point;
        }());
        var point3d = { x: 1, y: 2, z: 3 };
    } // Использование класса в качестве Интерфейса
} // Классы
{
    function identity(args) {
        return args;
    }
    // log( identity<number>(5) );     // Явное задание типа
    // log( identity([1, 2, 3]) );     // Автоматическое определение типа по параметру
} // Generics / Шаблоны
//# sourceMappingURL=example.js.map