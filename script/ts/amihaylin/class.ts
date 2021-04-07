/*
Есть два класса, User и Employee. Необходимо написать эти классы максимально оптимально и аргументировать своё решение.
Класс User принимает в конструкторе 4 строковых значения firstName, lastName, country, city. Данный класс должен иметь строковые публичные свойства (своего рода API): firstName, lastName, country, city, fullName (firstName и lastName), address (country и city), а также метод getInfo, возвращающий строку вида “FullName: Mike Pirce. Address: USA New-York”, где Mike - firstName, Pirce - lastName, USA - country и New-York - city.
Класс Employee принимает в конструкторе 3 строковых значения firstName, lastName, branch. Данный класс должен иметь строковые публичные свойства (своего рода API): firstName, lastName, branch, fullName (firstName и lastName), а также метод getInfo, возвращающий строку вида “FullName: Mike Pirce. Branch: New-York department”, где Mike - firstName, Pirce - lastName и New-York - branch.
*/

abstract class Persone {
    public firstName: string;
    public lastName: string;
    constructor(firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
    public get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    public abstract getInfo(): string;
}

class User extends Persone {
    public country: string;
    public city: string;
    constructor(
        firstName: string,
        lastName: string,
        country: string,
        city: string
    ) {
        super(firstName, lastName);
        this.country = country;
        this.city = city;
    }
    public get address() {
        return `${this.country} ${this.city}`;
    }
    public getInfo() {
        return `Fullname: ${this.fullName}. Adress: ${this.address}.`;
    }
}
class Employee extends Persone {
    public branch: string;
    constructor(firstName: string, lastName: string, branch: string) {
        super(firstName, lastName);
        this.branch = branch;
    }
    public getInfo() {
        return `FullName: ${this.fullName}. Branch: ${this.branch} department`;
    }
}
