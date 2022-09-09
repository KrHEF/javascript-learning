// import * as React from 'react';

export interface IItem {
    id: number;
    name: string;
}

export class ItemModel implements IItem {
    public id: number = 0;
    public name: string = '';

    public onClick!: (item: IItem) => void;
}