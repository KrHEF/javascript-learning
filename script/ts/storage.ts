import {ClassInstance, Constructor} from './global-types';

export namespace storage {

    export const storableTypeSymbol: symbol = Symbol('StorableType');
    export const storableFieldsSymbol: symbol = Symbol('StorableFields');

    interface ITarget {
        constructor: Function;
    }

    type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';

    type StorageClassDecorator = (ctor: Constructor) => void;
    type StorageFieldDecorator = (target: ITarget, name: string) => void;


    function StorableClass(storage: StorageType): StorageClassDecorator {
        return (ctor: Constructor) => {
            ctor.prototype[storableTypeSymbol] = storage;
        };
    }

    function StorableField(target: ITarget, fieldName: string): void {
        const className = target.constructor.name;
        let storableFields: string [] = [];

        if (target.constructor.prototype[storableFieldsSymbol]) {
            if (target.constructor.prototype.hasOwnProperty(storableFieldsSymbol)) {
                storableFields = target.constructor.prototype[storableFieldsSymbol];
            } else {
                storableFields = [...target.constructor.prototype[storableFieldsSymbol]];
            }
        }
        storableFields.push(fieldName);

        target.constructor.prototype[storableFieldsSymbol] = storableFields;
    }

    export function Storable(storage: StorageType): StorageClassDecorator;
    export function Storable(target: ITarget, name: string): void;
    export function Storable(param0: StorageType | ITarget, param1?: string): StorageClassDecorator | void {
        if (typeof param0 === 'object') {
            if (typeof param1 === 'string') {
                return StorableField(param0, param1);
            }

            throw new Error('Unreachable value');
        }

        return StorableClass(param0);
    }

    // Save
    function StoreObject(obj: ClassInstance) {
        if (!obj.constructor.prototype[storableFieldsSymbol]) { return; }

        const storageType: StorageType = obj.constructor.prototype[storableTypeSymbol];
        let storage: IStorage = storageFactory(storageType);

        storage.save(obj);
    }

    // function RestoreObject(ctor: Constructor): object {
    //     const result: object = new ctor();
    //     return result;
    // }

    export interface IStorage {
        save(obj: object): void;
        load<T extends ClassInstance<Constructor>>(ctor: Constructor): T
    }

    abstract class AbstractStorage implements IStorage {

        public save(obj: ClassInstance): void {
            const fieldsForStorage: string[] = this.getFields(<Constructor>obj.constructor);
            const name: string = this.getName(<Constructor>obj.constructor);
            this.store();
        }

        public load<T extends ClassInstance<Constructor>>(ctor: Constructor): T {
            let result: T = new ctor();
            const fieldsForStorage: string[] = this.getFields(ctor);
            const name: string = this.getName(ctor);

            return result;
        }

        protected getName(ctor: Constructor): string {
            return ctor.name;
        }

        protected getFields(ctor: Constructor): string[] {
            return ctor.prototype[storableFieldsSymbol] ?? [];
        }

        protected abstract store(): void;
    }

    class LocalStorage extends AbstractStorage {

        protected store(): void {
            throw new Error('Method not implemented.');
        }

    }

    class SessionStorage extends AbstractStorage {

        protected store(): void {
            throw new Error('Method not implemented.');
        }

    }

    class CookieStorage extends AbstractStorage {

        protected store(): void {
            throw new Error('Method not implemented.');
        }

    }

    export function storageFactory(storageType: StorageType): IStorage {
        switch (storageType) {
            case 'cookie':
                return new CookieStorage();
            case 'sessionStorage':
                return new SessionStorage();
            case 'localStorage':
                return new LocalStorage();
        }

        const returnValue: never = storageType;
    }

}