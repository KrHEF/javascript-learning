/**
 * Created by ef on 21.09.2020.
 */

function log<T> (result: T, ...params: any[]): T {
    return result;
 };

// Типы TypeScript
function types() {
    console.log('Использовать название типов примитивов с маленькой буквы!');

    // boolean
    {
        const b1: boolean = false;
        console.log('Boolean тип', b1);
    }

    // number
    {
        const x1: number = 66,
            x2: number = 0b01011,
            x3: number = 0o34672,
            x4: number = 0x34afd,
            x5: number = 1_000_000;

        console.log('Вывод числа в другой системе счисления:', x5 + ' = 0o' + x5.toString(8));
    }

    // string
    {
        const str1: string = 'Hello, TypeScript!';
    }

    // bigint (1n)
    {
        const b1: bigint = 1n,
            b2 = BigInt(2);

        console.log('BigInt', b1 + b2);
    }

    // Array => [1, 2, 3, 4], Array<T>
    {
        //Массив чисел, строку не добавить
        let list1: number[] = [1, 2, 3];
        list1.push(123);

        // Массив строк через Array<string>
        let list2: Array<string> = ['1', '2', '3'];
        list2.push('4');

        // Массив строк, чисел или логического типа
        let list3: Array<string | number | boolean> = ["str", 1, false];
        list3.push(true);
        // list3[list3.length] = null;     // null это же объект, почему он проходит?

        if (list3.length === 0) {
            log('list1: ' + list1.map((item) => typeof (item)));
            log('list2: ' + list2.map((item) => typeof (item)));
            log('list3: ' + list3.map((item) => typeof (item)));
        }

        // Перебор по индексам
        for (const key in list1) {
            if (Object.prototype.hasOwnProperty.call(list1, key)) {
                const element = list1[key];
            }
        }

        // Перебор по значениям
        for (const value of list2) {
            // console.log(value);
        }
    }

    // ReadonlyArray<T> - полностью иммутабельный
    {
        let arr0: ReadonlyArray<number | string> = [1, 2, '3', 4];
        // arr0.push(1);           // Error
        // arr0.length = 0;        // Error
        // let arr1: Array<number | string> = arr0;    // Error
        let arr2: Array<number> = arr0 as number[];     // Здесь потенциальная ошибка, т. к. arr0 может содержать
                                                        // и число, но об этом мы не узнаем при присваивании.
        // log(arr2);
    }

    // Tuple (array) - в переводе Кортеж, заданный типами массив и кол-во элементов.
    {
        let t1: [string, number];
        t1 = ['1', 2];
        t1.push('false', '4');      // на самом деле должен быть баг
        // t1.push(null);

        console.log('Типы кортежа [string, number]: ' + t1.map((item) => typeof (item)));
    }

    // Enum (object) - Именнованные константы.
    // Enum - это не тип, это вместо let.
    {
        // Числовые и строковые перечисления
        // Элемент перечисления можно задавать функцией, но она должна стоять в конце, либо все элементы после него
        // должны быть инициированы значением или функцией.

        // Enum - тип для перечислений
        enum Color {Red = 1, Green, Blue}

        let c: Color = Color.Red;

        console.log('Перечисление', 'Color[0] = ' + Color[0], ', Color[c] = ' + Color[c], ', Color[2] = ' + Color[2]);      // [Empty, Red, Green]
        console.log('Перечисление', 'Color.Blue = ' + Color.Blue);    // 3

        // Строковые перечисления
        // Каждый член должен быть инициирован. Т. к. это константы, то с большой буквы.
        enum Direction {
            Up = "UP",
            Down = "DOWN",
            Left = "LEFT",
            Right = "RIGHT",
        }

        // Смешанные пересчиталения (странное поведение, стоит использовать обдуманно)
        enum FalseTypes {
            Number = 0,
            String = "",
            Boolean = "FALSE",
        }
    }

    // const enum
    // При компиляции enum не создаётся.
    {
        const enum Error {
            Unknown = 0,
            Small = 1,
            Normal = 2,
            Critical = 3,
        }

        const a: number = Error.Critical;
    }

    {
        let u1: unknown = 4;

        if (typeof u1 === 'number') {
            const num: number = u1;
            log(num);
        }

        if (typeof u1 === 'string') {
            let str1: string = u1;
            log(str1);
        }
    } // Unknown - неизвестный тип. Присваивание другим переменным только через проверку типов.
    {
        let a1: any = 555;
        //log(a1.substring(1)); // это ошибка, но компилятор не проверяет
    } // Any - любой тип, в отличие от Unknown можно присваивать другим переменным, отключает проверку типов!
    {
        function func(str: string): void {
            log(str);
            // И ничего не возвращаем.
            // Если указать тип, то компилятор будет ругаться на отсутсвие return.
        }

        // let v1: void = null;
        let v1: void;
        let v2: void = undefined;
        let v3: void = void 0;
        //let v4: void = 5;     // Error
        if (v1 !== null)
            log('' + v1 + ', ' + v2 + ', ' + v3);
    } // Void - для функций в основном, для переменных странно.

    // null и undefined
    {
        // let n0: null = undefined;        // Error
        let n1: null = null;
        // void 0 - это undefined
        // let n2: null = void 0;           // Error
        // let n3: undefined = null;        // Error
        let n4: undefined = undefined;
        let n5: undefined = void 0;
        // больше ничего не присовить
        // n1 = '';     // Error
        // n2 = 12;     // Error
    }

    // Never - функция с never не должна закончиться (исключение или бесконечный цикл)
    {
        function funcError(): never {
            throw "Error";
        }

        //log(funcError);
    }

    // Object - непримитив (объекты, масссивы)
    {
        let o1: object;
        // o1 = 1;         // Error
        // o1 = 'str';     // Error
        // o1 = null;      // Error in strict mode of TS
        o1 = {};
        o1 = [];

        enum Color { Red, Green, Blue};
        o1 = Color;

    }

    // Защитники типов - сужение через проверку на существования члена экземпляра класса
    {
        class Fish {
            swim(): void {
                // log('swim');
            };
            fly: number = 0;
        }
        class Bird {
            fly(): void {
                // log( "fly" );
            };
            swim: string = "";
        }

        let pet: Bird | Fish = (Math.random() > 0.5) ? new Bird() : new Fish();

        // if (pet.fly) pet.fly();     // Ошибка, т. к. fly есть в обоих типах
        if (pet.fly && typeof(pet.fly) == 'function') { pet.fly() };

        // Проверка оператором ... in ...
        if ( 'fly' in pet && typeof(pet.fly) == 'function' ) { pet.fly() };
        if ( 'swim' in pet && typeof(pet.swim) == 'function' ) { pet.swim() };

        // Проверка оператором ... is ..., через сужение false
        // Это бы работало, если бы мы не усложнили классы, добавив поля
        // if ( "fly" in pet && typeof(pet.fly) == 'function' ) pet.fly()
        // else pet.swim();


        // Предикат типа (pet is Fish) - специальный логический тип,
        // котороый подтверждает или опроворгает это утверждение.
        function isFish(pet: any): pet is Fish {
            return (pet as Fish).swim != undefined && typeof(pet.swim) == 'function';
        }

        if (isFish(pet)) {
            pet.swim()
        } else {
            pet.fly();
        }

        // instanceof, через prototype


    }

    // Проверка на null (?? - оператор терсер)
    {
        function func3(param: string): string {
            return  param ?? "default";
        }

        // log( func3(null) );         // default
        // log( func3(undefined) );    // default
        // log( func3("undefined") );  // undefined - it is string

    }

    // prop! - отключение проверки на null и undefined, на совести разработчика
    {
        // Тут он "хитрец", сразу понял, что это строка.
        let str1: string | null = "value";

        // А тут не понял, т. к. мы указади сами тип.
        let str2: string | null = log<string | null>(str1, str1.length)

        // Поэтому тут нужен !
        log(str2!.length);

        class A {}

        class B {
            // a: A;        // Ошибка, поле не инициаизовано
            a!: A;
        }
    }

    // Приведение к типу (без преобразования)
    {
        // на самом деле ничего не приводится, просто мы говоим компилятору "Отвали, я сам разберусь!"

        let str: unknown = "1";
        // log(str.length);                    // Ошибка

        // через "x as type"
        log((str as string).length);

        // через "<type>x"
        log((<string>str).length);
    }
}
// types();

// Интерфейсы TrueScript
const interfaces = () => {
    // Инстрефейсы работают по принципу "утиной типизации" или "стрктурнго подтипирования".
    // Компилятор проверяет, что переданный объект удовлетворяет описанной структуре
    //  name? - опциональное св-во
    //  readnonly - свойство только для чтения
    // Не могут содержать реализацию, в отличие от абстрактных классов

    {
        interface IVehilce {
            wheelsCount: number;
            doorsCount?: number;     // Опциональное свой-во, его может не быть, если оно нужно сделай проверку
            clearence: number;
            readonly model?: string;    // Свойство только для чтения
            start(): IVehilce;          // Метод
            go(): IVehilce;
        }

        let porche = {
            wheelsCount: 5,
            doorsCount: 3,
            clearence: 10,
            prop1: 15,
            start: function(): IVehilce {
                // log("Start.")
                return this;
                },
            go(): IVehilce {
                // log("Go!")
                return this;
                },
        }

        function Go(vehicle: { wheelsCount: number }) {
            // log( vehicle.wheelsCount );
        }

        function GoAgain(vehicle: IVehilce): void {
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
        interface SquareConfig {
            color?: string;
            width?: number;
            [propName: string]: any;    // любое кол-во любых полей
        }

        function createSquare(config: SquareConfig): { color: string; area: number } {
            return { color: config.color || "red", area: config.width ? config.width*config.width : 0 };
        }

        // Только через добавление к Интерфейсу [propName: string]: any;
        let mySquare1 = createSquare({ colour: "red", width: 100 });

        // Обход через приведение к типу
        let mySquare2 = createSquare({ colour: "red", width: 100 } as SquareConfig);

        // Через присваивание переменной
        let mySquare3 = { colour: "red", width: 100 };
        let mySquare4 = createSquare(mySquare3);

        let mySquare5 = createSquare({ width: 100 });


    } // Избыточные свойства и способы обхода
    {
        interface StringArray {
            [index: string]: string;
        }

        let arr2: StringArray = {};
        arr2.name = '123';
        arr2['Hi'] = 'Hi';
        //(arr2 as Map).set("1", 1);

        // let arr1: StringArray = [];
        //arr.add();
        // arr1['Hi'] = '1';
        // log(arr1);
        // let str = arr1['Hi'];
        interface Animal {
            name: string;
        }

        interface Dog extends Animal {
            breed: string;
        }

        // Тип. который возвращает числовой индекс, должен быть подтипом типа, который возвращает строковый индекс.
        // Наоброт будет ошибка.
        interface NotOkay {
            [x: number]: Dog;
            [x: string]: Animal;
        }

        // Массив только для чтения
        interface MyReadOnlyArray {
            readonly [index: number]: string;
        }

        let arr3: MyReadOnlyArray = ['0', '1'];     // Массив задается при объявлении
        // arr3[2] = '2';           // и всё

    } // типы для индексов
    {
        interface IClock {
            currentTime: Date;
            setTime(date: Date): void;
        }
        class Clock implements IClock {
            currentTime: Date = new Date;

            constructor(hour: number, minute: number) {

            }

            setTime(date: Date): void {
                this.currentTime = date;
            }
        }

    } // Классы реализующие интерфейс (ClassName implemets InterfaceName)
    {
        interface Shape {
            color: string;
        }
        interface Square extends Shape {
            sideLength: number;
        }

        let square = {} as Square;
        square.color = "Blue";
        // square.sideLength = 15;
        // square.app = 1; // Error, нет такого поля
        // log(square);

    } // Наследование интерфейсов (InterfaceName extends InterfaceName1, InterfaceName2 ...)
    {
        // Ой чего-тот непросто!
    } // Гибридные типы
    {
        class Control {
            private state: any;
        }

        interface SelectableControl extends Control {
            select(): void;
        }

        class Button extends Control implements SelectableControl {
            select() {
            }
        }

        class TextBox extends Control {
            //select() {}
        }

        // class ImageControl implements SelectableControl {
        //     private state: any;      // не может наследовать приватные поля
        //     select() {}
        // }
    } // Интерфейсы, расширяющие классы, для наследования защищенных и приватных полей

}

// Функции
const functions = () => {
    {
        // Named function
        function add(x: number, y: number) {
            return x + y;
        }

        // Anonymous function
        let myAdd = function (x: number, y: number) {
            return x + y;
        };
    } // Именованные функции и анонимные
    {
        let z = 100;

        function addToZ(x: number, y: number) {
            return x + y + z;
        }

        // log(addToZ(1, 2));      // 103
        z = 200;
        // log(addToZ(1, 2));      // 203
    } // Замыкания
    {
        // Необязательные парамтеры могут следовать только после обязательных.
    } // Необязательные параметры name?, если не задан, то  undefined.
    {
        // Параметры по умолчнию могут предшедствовать обязательным, но тогда надо завдать явно undefined, что неудобно.

        function sum(x: number, y: number = 0, z?: number) : number {
            if (!z) z = 0;
            return x + y + z;
        }
        // log( sum(1, 2, 3) );    // 6
        // log( sum(1,2) );    // 3
        // log( sum(1) );  1
        // log( sum(1, undefined, NaN) );  // 1

    } // Параметры по умолчанию, как в JS. Можно не задавать, или передать undefined.
    {
        function getNumberArray(x: number, ...others: (number | string)[]): number[] {
            let result: number[] = [x];
            let othersNumber: number[] = others.map( (item, index, arr) => Number(item) );
            result.push(...othersNumber);
            return result;
        }
        //log(getNumberArray(1, 2, '3', 4, '0xFF'));

    } // Остаточные параметры  ...param: string[]
    {
        // this идут первыми в списке параметров и по сути парамтером не являются, только указывают тип.
        // по умолчанию this типа any.
    } // Указение типа this в параметра
    {
        let suits = ["hearts", "spades", "clubs", "diamonds"];

        function pickCard(x: { suit: string; card: number }[]): number; // 1 вид
        function pickCard(x: number): { suit: string; card: number };   // 2 вид
        function pickCard(x: any): any {                                // реализация
            // Check to see if we're working with an object/array
            // if so, they gave us the deck and we'll pick the card
            if (typeof x == "object") {
                let pickedCard = Math.floor(Math.random() * x.length);
                return pickedCard;
            }
            // Otherwise just let them pick the card
            else if (typeof x == "number") {
                let pickedSuit = Math.floor(x / 13);
                return { suit: suits[pickedSuit], card: x % 13 };
            }

        }
    } // Перегрузки функнкций - задание возможных типов принимаемых параметров и возвращаемых значений.
}

// Литеральные типы: String, Number, Boolean
// Задание типов
function literalTypes() {
    console.group('Задание типов');

    // Сужение, задание переменной через const, которая может иметь 1 значение, вместо бесконечно возможных.
    {
        let a1 = 'str';
        const a2 = 'str';
    }

    // Задание типа через возможноые значений примитивов
    {
        type Easing = 'ease-in' | 'ease-out' | 'ease-in-out';
        type LuckyNumbers = 7 | 77 | 777;

        function move( dx: number, dy: number, easingType: Easing ) {}
        move(1, 2, 'ease-in');
        // move(1, 2, 'ease');     // Error

        // Перегрузка
        function createElement(tagName: "img"): HTMLImageElement;
        function createElement(tagName: "input"): HTMLInputElement;
        // ... more overloads ...
        function createElement(tagName: string): Element {
            // ... code goes here ...
            return new Element();
        }

    }

    // Задание типов через keyof
    // получение название из полей объекта
    {
        interface A {
            a: string;
            b: number;
            c: boolean;
            '1': string;
            [2]: number;
        }

        type KeysA = keyof A;
        const name1: KeysA = 'a';       // 'a' | 'b' | 'c' | '1' | 2
        // const name2: KeysA = 'd';    // Error
    }

    // keyof для перечеслений
    {
        enum Currency {
            RUB = 99,
            USD = 19,
            EUR = 20,
        }

        const currencyName = {          // С типом тут сложно, стоит указать, н-р, Record<number, string> и ошибка ниже исчезнет.
            [Currency.RUB]: 'Russian Rouble',
            [Currency.EUR]: 'Euro',
        }

        function getCurrencyName<M, K extends keyof M>(key: K, map: M): M[K] {
            return map[key];
        }

        console.log('RUB: ' + getCurrencyName(Currency.RUB, currencyName));
        // console.log('USD: ' + getCurrencyName(Currency.USD, currencyName));      // Error
        console.log('EUR: ' + getCurrencyName(Currency.EUR, currencyName));
    }

    console.groupEnd();
}
// literalTypes();

// Intersection и Union для создание типов
if (false) {

    // Union / Объединение (через |)
    {
        // Union Объединение типов number | string
        let func = (x: string | number): string => {
            return x.toString()
        };

        // Значение с типом Union имеют доступ к свойствам и методам, которые реализуют все типы объединения
        let x: string | string[];
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
    }

    // Intersection / Пересечение (через &)
    {
        // Это объвление типов через &, которые содержат все члены всех типов.
        // видимо надо проверять, что этот тип имеет это свойтво
        // let x: string[] & string = (Math.random() > 0.5) ? '123' : ['1', '2', '3'];

        interface ErrorHandling {
            success: boolean;
            error?: { message: string };
        }

        interface ArtworksData {
            artworks: { title: string }[];
        }

        interface ArtistsData {
            artists: { name: string }[];
        }

        // These interfaces are composed to have
        // consistent error handling, and their own data.

        type ArtworksResponse = ArtworksData & ErrorHandling;
        type ArtistsResponse = ArtistsData & ErrorHandling;

        const handleArtistsResponse = (response: ArtistsResponse) => {
            if (response.error) {
                console.error(response.error.message);
                return;
            }

            console.log(response.artists);
        };

    }
}

// Классы
if (false) {
    {
        // public - публичное поле, видно снаружи и следовательно в подклассах
        // protected - защищенные поля, не видны снаружи, но видны в подклассах
        // private - частные поля, видны только базовому классу
        // readonly - только для чтения, должен быть инициализирован при объявлении или в конструкторе.
        // static - статичные свойства и методы

        class Animal {
            public readonly name: string;            // Нельзя менять имя
            protected readonly hasTail: boolean;     // Нельзя отрастить или отрубить хвост (просто жестоко)
            private readonly id: number;             // Идентификтаор животного, тоже меняться нельзя
            private static ids: number = 0;

            // Защищенный конструктор, нельзя вызвать, но можно переопределить.
            protected constructor(name: string, hasTail: boolean = false) {
                this.name = name;
                this.hasTail = hasTail;
                this.id = ++Animal.ids;
            }

            public move(distanceInMeters: number = 0): void {
                log(`${this.name} moved ${distanceInMeters} m.`);
            }
        }

        class Dog extends Animal {
            constructor(name: string) {
                super(name, true);
            }

            public voice(): void {
                log(`${this.name} says: "Woof-woof"`);
            }
        }

        let dog: Dog = new Dog("Tuzik");
        // dog.move(10);
        // dog.voice();
        // log(dog);

    } // Наследование и модификаторы
    {
        class Animal {
            public constructor(protected readonly name: string,
                               private hasTail: boolean = false) {
                // Объявили защищенное поле name и приветное часнтное поле hasTail без присваивания и this
            }

            public get Name(): string { return this.name; }
            public set HasTail(value: boolean) { this.hasTail = value; }
        }
        let dog = new Animal("Tuzik", true);
        //log(dog);

    } // Объявление и инициализция на месте // Геттеры и сеттеры
    {
        // На сколько я помню, асбтрактным является класс, который содержит хотя бы одно асбтрактное поле или метод.

        abstract class Animal {
            protected readonly name: string;
            private readonly hasTail: boolean;

            public constructor(name: string, hasTail: boolean = false) {
                this.name = name;
                this.hasTail = hasTail;
            }

            public move(distanceInMeters: number = 0): void {
                log(`${this.name} moved ${distanceInMeters} m.`);
            }

            public abstract voice(): void;      // Абстрактный метод
        }

        class Cat extends Animal {
            public voice(): void {
                log(`${this.name} says "Myauu"`);
            }

            public drink(whatDrink: "milk" | "water"): void {
                log(`${this.name} drink a ${whatDrink}`);
            }

        }

        // let cat: Animal = new Animal("Barsik", true);   // Error, абстрактный класс
        let cat: Animal = new Cat("Barsik", true);
        // cat.drink("milk");      // Error, Animal не содержит метод drink
        // (cat as Cat).drink("milk");  // Ok

    } // Абстрактные классы
    {
        class Point {
            x: number = 0;
            y: number = 0;
        }

        interface Point3d extends Point {
            z: number;
        }

        let point3d: Point3d = { x: 1, y: 2, z: 3 };
    } // Использование класса в качестве Интерфейса
}

// Generics / Обобщения
function generics() {

    // Простые примеры
    {
        function identity<T>(args: T): T {
            return args;
        }

        const id:number = identity<number>(5);     // Явное задание типа
        const arr: number[] = identity([1, 2, 3]);     // Автоматическое определение типа по параметру
    }

    // Создание класса через обобщения
    {
        console.groupCollapsed('Создание класса через обобщения');

        type Constructor<T> = new(...args: any[]) => T;
        type ConstructorX = new(value: number) => X;
        type ConstructorY = new() => Y;
        type ConstructorParams<T> =
            T extends X | Z ? ConstructorParameters<ConstructorX> :
            T extends Y ? ConstructorParameters<ConstructorY> :
            never;

        abstract class Letter {
            abstract print(): void;
        }

        class X extends Letter {
            constructor(
                protected value: number,
            ) {
                super();
            }

            override print() {
                console.log('X:' + this.value.toString());
            }
        }

        class Y extends Letter {
            override print() {
                console.log('Y');
            }
        }

        class Z extends X {
            override print() {
                console.log('Z:' + this.value.toString());
            }
        }


        // type ConstructorParams<T> = T extends new(...args: infer R) => any ? R : never;
        // type ConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => any ? P : never;


        class Creator {
            private constructor() {};

            static get<T extends Letter>(ctor: Constructor<T>, ...args: ConstructorParams<T>): T {
                const result: T = new ctor(...args);
                result.print();
                return result;
            }
        }

        const x1: X = Creator.get(X, 3);
        const y1: Y = Creator.get(Y);
        const z1: Z = Creator.get(Z, 1);

        console.groupEnd();
    }

    // Условные типы (Conditional types)
    {
        interface X {
            x: number;
        }

        interface Y {
            y: number;
        }

        type Z<T> =
            T extends X ? X :
            T extends Y ? Y :
            never;

        let a = { x: 1};
        let A: Z<typeof a>; // A: X
        let b = {y: 1};
        let B: Z<typeof b>; // B: Y

        let C: Z<string>;   // C: never
    }

    // Распределённые условные типы (Distributed conditional types)
    {
        //  Это почти тоже самое, что условный тип, но позволяет выводить типы по заданым правилам
        type DistributedValue<T> =
            T extends Date ? Date :
            T extends number ? Date | number :
            T extends string ? Date | number | string :
            never;

        function compare<T>(val1: T, val2: DistributedValue<T>): boolean {
            const result = false;

            return result;
        }

        compare(new Date(), new Date());
        // compare(new Date(), 1);      // Error - number не Date
        // compare(new Date(), '1');    // Error - string не Date
        // compare(new Date(), false);  // Error - тип не разрешен вообще

        compare(1, new Date());
        compare(1, 2);
        // compare(1, '1');             // Error
        // compare(1, false);           // Error

        compare('1', new Date());
        compare('1', 1);
        compare('1', '2');
        // compare('1', false);         // Error

        // compare(true, new Date());   // Error - тип never для 2-го параметра
        // compare(true, 1);            // Error
        // compare(true, '1');          // Error
        // compare(true, false);        // Error
    }

    // Выведение условных типов (извлечение типа)
    {
        type A<T> = T extends {a: infer U, b: infer U} ? U : T;
        type A1 = A<{a: number}>; // A1: {a: number}
        type A2 = A<{a: number, b: number}>; // A2: number
        type A3 = A<{a: number, b: boolean}>; // A3: number | boolean

        // делает тоже самое
        type B<T> = T extends {a: infer U, b: infer V} ? U | V : T;
        type B1 = B<{a: number}>; // A1: {a: number}
        type B2 = B<{a: number, b: number}>; // A2: number
        type B3 = B<{a: number, b: boolean}>; // A3: number | boolean

    }

}
// generics();


// Служебные типы
if (false) {
    {
        interface Animal {
            name: string;
            legsCount: number;
            volumeStomach: number;
        }

        function getAnimal(animal: Partial<Animal>): Partial<Animal> {
            return animal;
        }

        const animal = getAnimal({ name: 'Vaska' });
    } // Partial<Type> - делает все поля необязательными
    {
        interface Animal {
            name: string;
            legsCount?: number;
            volumeStomach?: number;
        }

        const animalRequired: Required<Animal> = { name: 'Vaska', legsCount: 4, volumeStomach: 2 },
            animal: Animal = {name: 'Sharik'};
    } // Required<Type> - делает всае поля обязательными
    {
        interface Animal {
            name: string;
            legsCount: number;
            volumeStomach: number;
        }

        function getAnimal(animal: Readonly<Animal>): Animal{
            // animal.legsCount = 1;    // error
            return animal;
        }
    } // Readonly<Type> - делает все поля readonly
    {
        interface Animal {
            name: string;
            legsCount?: number;
            volumeStomach?: number;
        }

        type AnimalNamesType = 'ignat' | 'pirat' | 'boris';

        const animal: Record<AnimalNamesType, Animal> = {
            ignat: { name: 'Ignat' },
            pirat: { name: 'Pirat', legsCount: 3 },
            boris: { name: 'Boris' }
        }

        animal.ignat;
    } // Record<Keys, Type> - создает тип, где ключи должны быть созданы из типа Keys и иметь тип Type
    {
        interface Animal {
            name: string;
            legsCount: number;
            volumeStomach: number;
        }

        type AnimalPartial = Pick<Animal, "name" | "legsCount">;

        const animal: AnimalPartial = {
            name: "Shurik",
            legsCount: 4,
        }
    } // Pick -  создаёт тип, который содержит только часть полей
    {
        // Инвертируй Pick
    } // Omit - обратный Pick, пропускает указанные поля
    {
        // без примера
    } // Exclude<Type, ExcludedUnion> - извлекает из типа перечисленные значения типов во втором аргументе
    {
        // без примера
    } // Extract<Type, Uniom> - оставляет в типе только те, которые есть в Union
    {
        // let a: boolean;
        // a = null;


        // без примера
    } // NonNullable - извлекает из типа undefined и null
    {
        function f1(a: string, b: number, c: boolean): void {
            console.log(a + b.toString);
        }

        function f2(arg: {a: string, b: number, c: boolean}): boolean {
            return arg.c;
        };

        type T1 = Parameters<typeof f1>;
        const t1: T1 = ['abc', 123, true];

        type T2 = Parameters<(arg: {a: string, b: number, c: boolean}) => boolean>;
        const t2: T2 = [{a: '2', b: 124, c: true}];

    } // Parameters<Type> - задаёт тип как кортеж из параметра функции
    {
    } // ConstructorParameters<Type> - задает тип, как кортеж или массив из фукнции-конструктора
    {
    } // ReturnType<Type> - тип из возвращаемого значения функции
    {
        class C {
            a: string;
            b: number = 2;
            c: boolean = false;

            constructor () {
                this.a = '1';
            }

            // private show(): C {
            //     return this;
            // }
        }

        type T1 = InstanceType<typeof C>;
        type T2 = C;
        const t1: T1= {a: '123', b: 123, c: true};
        const t2: T2= {a: '123', b: 123, c: true};
        const c1: C = {a: '123', b: 123, c: false};

        // const tt1 = new T1();
        // const tt2 = new T2();
        const tt3 = new C();

    } // InstanceType<Type> - создаёт тип из типа класса.
    {
        class C {
            name = 'Boris';
        }

        function showName(this: C) {
            // log(this.name);
        }

        showName.call(new C());

        type T1 = ThisParameterType<typeof showName>;
        // const t1: T1 = 1;

    } // ThisParametrType<Type> - если фукнции передаётся this в параметрах, то извлекает её тип, иначе unknown
    {
    } // OmitThisParametr<Type> - возвращает тип, из которого вырезан this параметр, если там его и не было, то просто тип.
    {
        // https://www.typescriptlang.org/docs/handbook/utility-types.html#thistypetype
    } // ThisType<Type> - сложнаааа
    {
        type T1 = 'a' | 'b' | 'c' | 'd';
        type T2 = Uppercase<T1>;
        type T3 = `${T1 | T2}1`;
        type T4 = `${T2}${T1}`;

        const t1: T1 = 'a',
            t2: T2 = 'A';
        const t3: T3 = 'a1',
            t4: T4 = 'Aa';
    } // Uppercase<StringType> and Sting Unions in Types (ругается компилятор)
}

/** Декораторы
 *
 * Декораторы бывают:
 * - для класса
 * - для метода
 * - аксессоров
 * - свойств
 * - параметров
 *
 *
 * Записть декораторов:
 * @d1 @d2 obj => @d1(@d2(obj))
 *
 *
 * Фабрика декораторов - специальная фнкция, которая возвращает декоратор
 * @df1() obj
 * , где df1 - ф-я, которая возвращает декоратор
 *
 */
function decorators() {

    /**
     * Декораторы для классов
     * Декоратор может вернуть новый класс.
     */
    {
        console.groupCollapsed('Декораторы для классов');

        function classDecorator(BaseClass: typeof A): typeof A {
            console.log('constructor', BaseClass);

            return class extends BaseClass {
                protected override field: string = 'new field';
                private field2: string = 'new field 2';

                constructor(str: string) {
                    super('new ' + str);
                }
            }
        }

        @classDecorator
        class A {

            public publicField: string = 'public field A';
            protected protectedField: string;
            protected field: string = 'old field';

            constructor(protectedField: string) {
                this.protectedField = protectedField;
            }

            public publicMethod(): void {

            }

            protected protectedMethod(param: string): string {
                return param;
            }

        }

        class B extends A {
            public override publicField: string = 'public field B';
        }

        const a = new A('protected field A');
        const b = new B('protected field B')
        console.log(A, a);
        console.log(B, b);
        console.groupEnd();
    }

    /**
     * Декораторы для методов (и аксессоров)
     * Могут вернуть новые свойства метода.
     */
    {
        console.groupCollapsed('Декораторы для методов (и аксессоров)');

        function methodDecorator<T>(target: any, name: string, prop: TypedPropertyDescriptor<T>): void | TypedPropertyDescriptor<T> {
            console.log('target', target);
            console.log('name', name);
            console.log('prop', prop);

            return prop;
        }


        class A {

            public publicField: string = 'public field';
            protected protectedField: string;
            protected newField: string = '';

            constructor(protectedField: string) {
                this.protectedField = protectedField;
            }

            @methodDecorator
            public publicMethod(): void {

            }

            @methodDecorator
            protected protectedMethod(param: string): string {
                return param;
            }

        }

        const a = new A('protected field');
        console.log(A, a);
        a.publicMethod();
        console.groupEnd();
    }

    /**
     * Декораторы для полей
     * Ничего не возвращают, но могут, например, сохранить метаданные
     */
    {
        console.groupCollapsed('Декораторы для полей');

        function fieldDecorator(target: any, name: string): void {
            console.log({target, name});

            // Так можно, но пока не понятно зачем.
            const a1 = new target.constructor();
            a1[name] = '123';
            console.log('a1', a1);
        }

        class A {

            @fieldDecorator
            public publicField: string = 'public field';
            @fieldDecorator
            protected protectedField: string;
            @fieldDecorator
            protected newField: string = '';

            constructor(protectedField: string) {
                this.protectedField = protectedField;
            }

            public publicMethod(): void {

            }

            protected protectedMethod(param: string): string {
                return param;
            }
        }

        const a = new A('protected field');
        console.log(A, a);
        console.groupEnd();
    }

    /**
     * Декораторы для параметров
     * Ничего не возвращает
     */
    {
        console.groupCollapsed('Декораторы для параметров');

        function paramDecorator(target: any, methodName: string, index: number): void {
            console.log({target, 'methodName': methodName || 'constructor', index});
        }


        class A {
            public publicField: string = 'public field';
            protected protectedField: string;
            protected newField: string = '';

            constructor(@paramDecorator protectedField: string) {
                this.protectedField = protectedField;
            }

            public publicMethod(): void {

            }

            protected protectedMethod(@paramDecorator param: string): string {
                return param;
            }
        }

        const a = new A('protected field');
        console.log(A, a);
        console.groupEnd();
    }

    /** Порядок вызовов декораторов:
     * [field] evaluated
     * [field] called (3) [{…}, 'x', undefined]
     * [get accessor] evaluated
     * [get accessor] called (3) [{…}, 'X', {…}]
     * [set accessor] evaluated
     * [set accessor param] evaluated
     * [set accessor param] called (3) [{…}, 'X1', 0]
     * [set accessor] called (3) [{…}, 'X1', {…}]
     * [method] evaluated
     * [method 1st param] evaluated
     * [method 2nd param] evaluated
     * [method 2nd param] called (3) [{…}, 'show', 1]
     * [method 1st param] called (3) [{…}, 'show', 0]
     * [method] called (3) [{…}, 'show', {…}]
     * [static field] evaluated
     * [static field] called (3) [ƒ, 'Sum', undefined]
     * [static method] evaluated
     * [static method param] evaluated
     * [static method param] called (3) [ƒ, 'show', 0]
     * [static method] called (3) [ƒ, 'show', {…}]
     * [class] evaluated
     * [ctor param] evaluated
     * [ctor param] called (3) [ƒ, undefined, 0]
     * [class] called [ƒ]
     */
    {
        console.groupCollapsed('Порядок вызовов декораторов');

        function log(name: string): (...args: any[]) => void {
            console.log(`[${name}] evaluated`);
            return (...args: any[]) => {
                console.log(`[${name}] called`, args);
            }
        }

        // @testDecorator
        @log('class')
        class C {
            @log('static field')
            static Sum: number;

            @log('field')
            private x: number = 1;

            // @test('ctor')
            constructor (@log('ctor param') x: number) {
                this.x = x;
            }

            @log('static method')
            static staticShow(@log('static method param') str: string) {
                log(str);
            }

            @log('get accessor')
            get X(): number {
                return this.x;
            }

            @log('set accessor')
            set X1(@log('set accessor param') value: number) {
                this.x = value;
            }

            @log('method')
            show(@log('method 1st param') str1: string, @log('method 2nd param') str2: string) {
                log(str1 + str2);
            }

        }

        console.groupEnd();
    }

    // Моя поделка
    {
        function color(value: string): Function {
            log('color decorator is created')
            return (constructor: any) => {
                log('color decorator is called')
                log(constructor);
                // constructor.prototype.color = function(color: string) { this.color = color };
            }
        }

        interface IColor {
            color: string;
        }

        type TCtor = {
            new (...args: any[]): {},
            color: string,
            };

        function color2<T extends TCtor>(targetClass: T) {
            log('color2 decorator is created')
            log(targetClass);

            return class extends targetClass {
                color = 'red';
            }
        }

        // @color2
        @color('green')
        class Test {
            // @color('red')
            a = 0;
            color = 'black';
            constructor () {
                this.a++;
                // this.color = 'black'
            }
        }

        const a = new Test();
        // log(Test);
        // log(a);
        // log(a.color);
        // console.log('Reflect', Reflect);

    }

    // Сериализация
    {
            // console.groupCollapsed('Мой пример: Сериализация');
            console.group('Мой пример: Сериализация');

            // @storage.Storable('sessionStorage')
            class A {

                // @storage.Storable
                public publicFieldA: string = 'public field A';

                // @storage.Storable
                protected protectedFieldA: number = 1;

                // @storage.Storable
                private privateFieldA: object = {a: 1};

                constructor() {

                }
            }

            // @storage.Storable('localStorage')
            class B extends A {
                // @storage.Storable
                public publicFieldB: string = 'public field B';

                constructor() {
                    super();
                }
            }

            const a: A = new A();
            const b: B = new B();
            console.log(A);
            console.log(a);
            console.log(B);
            console.log(b);

            console.groupEnd();
    }

}
// decorators();

// Файлы объявлений
function declare() {
    console.group('Файлы объявлений');

    window.onload = () => {
        // ENV задана в HTML файле и описана в global.d.ts
        console.log({ENV});
    };

    console.groupEnd();
}
// declare();

// Задания всякие
if (false) {
    // 1 ---------------------------------------------------
    // Любая попытка выполнить данный метод приводит к ошибке. Необходимо это исправить.
    function createArray(limit: number): number[] {
        let arr: number[] = [];
        for (let i = 0; i < limit; i++) {
            arr.push(i * 10);
        }
        return arr;
    }

    // log( createArray(11) );
    // 2 ---------------------------------------------------
    // Представленный ниже код работает некорректно - он всегда возвращает одно и то же значение. Необходимо пояснить   почему и предложить возможные решения данной проблемы.
    interface IObj {
        type: string;
        branch?: string;
    }

    let defaultObj: IObj = { type: 'Employee' };
    function getUser(type: string): IObj {
        let obj: IObj = {...defaultObj};
        obj.branch = 'Pskov';
        return (type === 'Manager') ? obj : defaultObj;
    }

    // log( getUser("Manager") );
    // log( getUser("No manager") );

    // 3 ---------------------------------------------------
    // Необходимо написать метод, который принимает массив строк (arr: string[])и число (limit: number). Данный метод должен пройтись по массиву arr и ввернуть массив строк, длина которых равна значению переменной limit.
    function filter(arr: string[], limit: number): string[] {
        return arr.filter((str) => str.length === limit);
    }

    // 4 ---------------------------------------------------
    // Ниже представлен метод, возвращающий либо имя, либо фамилию 3-х пользователей. Необходимо модифицировать данный метод для поддержки ещё 5-и пользователей. ib и возвращаемые значения заполнить по аналогии с имеющимися. Конечная реализация должна быть максимально оптимизирована для удобства чтения.
    function getUser2(id: number, type: string): string {
        switch (id) {
            case 101:
                return (type === 'first') ? 'FirstName1' : 'LastName1';
            case 102:
                return (type === 'first') ? 'FirstName2' : 'LastName2';
            case 103:
                return (type === 'first') ? 'FirstName3' : 'LastName3';
            case 104:
                return (type === 'first') ? 'FirstName4' : 'LastName4';
            case 105:
                return (type === 'first') ? 'FirstName5' : 'LastName5';
            case 106:
                return (type === 'first') ? 'FirstName6' : 'LastName6';
            case 107:
                return (type === 'first') ? 'FirstName7' : 'LastName7';
            case 108:
                return (type === 'first') ? 'FirstName8' : 'LastName8';
            default:
                return '';
        }
    }

    interface INames {
        [key: number]: {firstName: string, lastName: string};
    }

    function getUser3(id: number, type: string): string {
        const names: INames = {
            101: {firstName: 'FirstName1', lastName: 'LastName1'},
            102: {firstName: 'FirstName2', lastName: 'LastName2'},
            103: {firstName: 'FirstName3', lastName: 'LastName3'},
            104: {firstName: 'FirstName4', lastName: 'LastName4'},
            105: {firstName: 'FirstName5', lastName: 'LastName5'},
            106: {firstName: 'FirstName6', lastName: 'LastName6'},
            107: {firstName: 'FirstName7', lastName: 'LastName7'},
            108: {firstName: 'FirstName8', lastName: 'LastName8'},
        }

        if (!names[id]) { return ''; }
        return (type === 'first') ? names[id].firstName : names[id].lastName;
    }

    log( getUser3(109, "first") );

    // 5 ---------------------------------------------------
    // Функция makeCounter создает простой счетчик. Однако сейчас он возвращает одно и то же значение 0. Почему и как это исправить?
    function makeCounter() {
        let count = 0;
        return function () {
            return count++;
        }
    }

    let counter: () => void = makeCounter();
    // log(counter());
    // log(counter());
    // log(counter());
    class People {

        constructor(
            private _firstName: string,
            private _lastName: string,
        ) {}

        public get firstName(): string {
            return this._firstName;
        }

        public get lastName(): string {
            return this._lastName;
        }

        public get fullName(): string {
            return this.firstName + ' ' + this.lastName;
        }

        public getInfo(): string {
            return `FullName: ${this.fullName}.`;
        }
    }

    class User extends People {

        constructor(
            _firstName: string,
            _lastName: string,
            private _country: string,
            private _city: string) {
                super(_firstName, _lastName);
        }

        public get country(): string {
            return this._country;
        }

        public get city() : string {
            return this._city;
        }

        public get address(): string {
            return this.country + ' ' + this.address;
        }

        public override getInfo(): string {
            return super.getInfo() + ` Address: ${this.address}`;
        }

    }

    class Employee extends People {

        constructor(
            _firstName: string,
            _lastName: string,
            private _branch: string) {
                super(_firstName, _lastName);
        }

        public get branch() : string {
            return this._branch;
        }

        public override getInfo(): string {
            return super.getInfo() + ` Branch: ${this.branch} department`;
        }
    }

    type T1 = 'a' | 'b' | 'c';
    type ITest = {
        [key in T1]: string;
    };

    console.log('123');
}

if (true) {
    console.group('Поярдок инициализации полей');
    console.group('КАК НЕЛЬЗЯ');
    console.log('Init должен быть отдельно');

    interface IPeopleData {
        name: string;
        name2: string;
        old: number;
    }

    interface IEmployeeData extends IPeopleData {
        work: string;
    }

    abstract class Base<T> {
        constructor(data: T | unknown) {
            this.init(data);
        }

        protected abstract isValidData(data: T | unknown): data is T;
        protected abstract setData(data: T): void;

        protected init(data: T | unknown): void {
            if (this.isValidData(data)) {
                this.setData(data);
            }
        }
    }

    class People<T extends IPeopleData = IPeopleData> extends Base<T> {
        name: string = '';
        name2: string | undefined;
        old: number = 0;

        constructor(data: T | unknown) {
            super(data);
        }

        protected override isValidData(data: unknown): data is T {
            return true;
        }

        protected override setData(data: T): void {
            console.log('People', 'setData', data);

            this.name = data.name;
            this.name2 = data.name2;
            this.old = data.old;
        }
    }

    class Employee extends People<IEmployeeData> {
        work: string = '';

        constructor(data: IEmployeeData | unknown) {
            super(data);
        }

        protected override isValidData(data: unknown): data is IEmployeeData {
            return (!!data && typeof(data) === 'object' && 'work' in data);
        }

        protected override setData(data: IEmployeeData): void {
            console.log('Employee', 'setData', data);

            super.setData(data)
            this.work = data.work;
        }
    }

    const peopleData: IEmployeeData = {
        name: 'Evgenii',
        name2: 'Fishov',
        old: 39,
        work: 'SoftGamings',
    };

    const people: People = new People(peopleData);
    console.log(people);

    const employee: Employee = new Employee(peopleData);
    console.log(employee);

    console.groupEnd();
    console.groupEnd();
}
