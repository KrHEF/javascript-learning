import * as React from 'react';
import { ItemModel } from '../models/item.model';

export class ItemView extends React.Component<ItemModel> {

    constructor(item: ItemModel) {
        super(item);
        this.handleClick = this.handleClick.bind(this);
    }

    public render(): JSX.Element {
        return (
            <div>
                <button className="btn btn-primary"
                        style={ {"marginBottom": "5px"} }
                        onClick={this.handleClick}>
                    {this.props.name}
                </button>
            </div>
        );
    }

    public handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        this.props.onClick(this.props);
    }

}