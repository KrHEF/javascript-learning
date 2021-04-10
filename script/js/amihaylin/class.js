"use strict";
class Persone {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
class User extends Persone {
    constructor(firstName, lastName, country, city) {
        super(firstName, lastName);
        this.country = country;
        this.city = city;
    }
    get address() {
        return `${this.country} ${this.city}`;
    }
    getInfo() {
        return `Fullname: ${this.fullName}. Adress: ${this.address}.`;
    }
}
class Employee extends Persone {
    constructor(firstName, lastName, branch) {
        super(firstName, lastName);
        this.branch = branch;
    }
    getInfo() {
        return `FullName: ${this.fullName}. Branch: ${this.branch} department`;
    }
}
//# sourceMappingURL=class.js.map