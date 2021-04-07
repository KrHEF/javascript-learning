/**
 * Created by ef on 21.09.2020.
 */

let log = (obj: any = '') => console.log(obj);

// Типы TypeScript
{
    // Использовать название типов примитивов с маленькой буквы!

    {
        let b1: boolean = false;
        if (b1)
            log('' + b1);
    } // Boolean
    {
        let x1: number = 6,
            x2: number = 0b01011,
            x3: number = 0o34672,
            x4: number = 0x34afd;
        if (!x1 || !x2 || !x3 || !x4)
            // Вывод в другой системе счисления
            log('0o' + x1.toString(8));
    } // Number
    {
        let str1: string = 'Hello, TypeScript!';
        if (!str1) {
        }
    } // String
    {
        //Массив чисел, троку не добавить
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
    } // Array => [1, 2, 3, 4], Array<T>
    {
        let arr0: ReadonlyArray<number | string> = [1, 2, '3', 4];
        // arr0.push(1);           // Error
        // arr0.length = 0;        // Error
        // let arr1: Array<number | string> = arr0;    // Error
        let arr2: Array<number> = arr0 as number[];     // Здесь потенциальная ошибка, т. к. arr0 может содержать
                                                        // и число, но об этом мы не узнаем при присваивании.
        // log(arr2);

    } // ReadonlyArray<T> - полностью иммутабельный
    {
        let t1: [string, number];
        t1 = ['1', 2];
        t1.push('false', '4');      // на самом деле должен быть баг
        // t1.push(null);

        if (t1[1] === 5)
            log('tuple:' + t1.map((item) => typeof (item)));
    } // Tuple (array) - в переводе Кортеж, заданный типами массив и кол-во элементов.
    {
        // Числовые и строковые перечисления
        // Элемент перечисления можно задавать функцией, но она должна стоять в конце, либо все элементы после него
        // должны быть инициированы значением или функцией.

        // Enum - тип для перечислений
        enum Color {Red = 1, Green, Blue}

        let c: Color = Color.Red;

        if (Color.Green === 1) {
            //log(Color[0]);      // Empty
            log(Color[c]);      // Red
            log(Color[2]);      // Green
            log(Color.Blue);    // 3
        }

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



    } // Enum (object) - Именнованные константы. enum - это не тип, это вместо let.
    {
        let u1: unknown = 4;

        if (typeof (u1) === "number") {
            u1 = "something";
        }

        if (typeof (u1) === 'string') {
            let str1: string = u1;
            //log(str1);
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
    {
        // let n0: null = undefined;
        let n1: null = null;
        // let n2: null = void 0;
        // let n3: undefined = null;
        let n4: undefined = undefined;
        let n5: undefined = void 0;
        // больше ничего не присовить
        // n1 = '';     // Error
        // n2 = 12;     // Error
    } // Null, Undefined - странные типы, кроме этих значений больше им ничего не происвоить.
    {
        function funcError(): never {
            throw "Error";
        }

        //log(funcError);
    } // Never - функция с never не должна закончиться (исключение или бесконечный цикл)
    {
        let o1: object;
        // o1 = 1;         // Error
        // o1 = 'str';     // Error
        // o1 = null;      // Error in strict mode of TS
        o1 = {};
        o1 = [];

        enum Color { Red, Green, Blue};
        o1 = Color;

    } // Object - непримитив (объекты, масссивы)
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

        // if (pet.fly) pet.fly();     // Error

        // Проверка оператором ... in ...
        if ( "fly" in pet && typeof(pet.fly) == 'function' ) pet.fly();
        if ( "swim" in pet && typeof(pet.swim) == 'function' ) pet.swim();

        // Проверка оператором ... in ..., через сужение false
        // Это бы работало, если бы мы не усложнили классы, добавив поля
        // if ( "fly" in pet && typeof(pet.fly) == 'function' ) pet.fly()
        // else pet.swim();


        // Предикат типа (pet is Fish) - специальный логический тип,
        // котороый подтверждает или опроворгает это утверждение.
        function isFish(pet: any): pet is Fish {
            return (pet as Fish).swim != undefined && typeof(pet.swim) == 'function';
        }
        if (isFish(pet)) pet.swim()
        else pet.fly();

        // instanceof, через prototype


    } // Защитники типов - сужение через проверку на существования члена экземпляра класса
    {
        function func3(param: string): string {
            return  param ?? "default";
        }

        // log( func3(null) );         // default
        // log( func3(undefined) );    // default
        // log( func3("undefined") );  // undefined - it is string

    } // Проверка на null (?? - оператор терсер)
    {
        // Не получислось придумать пример
        let arr: number[] | undefined = (Math.random() > 0.9) ? [1, 2, 3, 4] : undefined;

        // log(arr.length);

    } // prop! - отключение проверки на null и undefined, на совети разработчика

    // Приведение к типу (без преобразования)
    // на самом деле ничего не приводится, просто мы говоим компилятору "Отвали, я сам разберусь!"
    {
        let x1: unknown = 1;
//    log((x1 as string).length);       // Empty string;
    } // через "x as type"
    {
        let x1: unknown = 1;
        // log((<string>x1).length);        // Empty string;
    } // через "<type>x"
}

// Интерфейсы TrueScript
{
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
            select() {}
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
{
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

// Литеральные типы: String, Number, Boolean и задание типов
{
    {
        let a1 = 'str';
        const a2 = 'str';
    } // Сужение, задание переменной через const, которая может иметь 1 значение, вместо бесконечно возможных.
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

    } // Задание типа через возможноые значений примитивов
}

// Intersection и Union для создание типов
{
    {    // Union Объединение типов number | string
        let func: (x: string | number) => string = (x) => {
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
    } // Union / Объединение (через |)
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

    } // Intersection / Пересечение (через &)
}

// Классы
{
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

// Generics / Шаблоны
{
    function identity<T>(args: T): T {
        return args;
    }

    // log( identity<number>(5) );     // Явное задание типа
    // log( identity([1, 2, 3]) );     // Автоматическое определение типа по параметру

}

// Служебные типы
{
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
        // без примера
    } // NotNulleble - извлекает из типа undefined и null
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

    } // ConstructorParameter<Type> - задает тип, как кортеж или массив из фукнции-конструктора
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
        const t1: T1= {a: '123', b: 123, c: true};
        const c1: C = {a: '123', b: 123, c: false};

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
    {

    }
}

// Декораторы
{
    {
        function color(value: string): Function {
            return (target: any) => {
                target['color'] = value;
            }
        }

        @color('green')
        class Test {
            a = 0;
        }

        // log(new Test());
    } // Моя поделка
    {
        function first() {
            log('first decorator was called');
            return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
                console.log('first decorator', target, propertyKey, descriptor);
            }
        }

        function test(name: string) {
            log('test decorator was called for ' + name);
            return (...args: any[]) => {
                log('test decorator for ' + name);
                log(args);
            }
        }

        @test('class')
        class C {
            @test('static field')
            static Sum: number;

            @test('field')
            private readonly x;

            // @test('ctor')
            constructor (x: number) {
                this.x = x;
            }

            // @first()
            @test('method')
            show() {
                log(this.x);
            }

            @test('prop')
            get X() {
                return this.x;
            }
        }
    } // Порядок вызовов
}


// Задания всякие
{
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
            private _city: string
        ) {
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

        public getInfo(): string {
            return super.getInfo() + ` Address: ${this.address}`;
        }

    }

    class Employee extends People {

        constructor(
            _firstName: string,
            _lastName: string,
            private _branch: string
        ) {
            super(_firstName, _lastName);
        }

        public get branch() : string {
            return this._branch;
        }

        public getInfo(): string {
            return super.getInfo() + ` Branch: ${this.branch} department`;
        }
    }
}
