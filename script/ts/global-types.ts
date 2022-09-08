type AbstractConstructor = new (...args: any[]) => any;
export type ClassInstance<T extends AbstractConstructor = AbstractConstructor> = abstract new (...args: any[]) => T extends abstract new (...args: any[]) => infer R ? R : never;
// export type Constructor<T extends ClassInstance = ClassInstance> = new (...args: any[]) => T;
export type Constructor = new (...args: any[]) => any;