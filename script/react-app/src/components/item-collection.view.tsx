import * as React from 'react';
import { IItem } from '../models/item.model';
import { ItemView } from './item.view';

export interface IItemCollection {
    title: string;
    items: IItem[];
    selectedItem: IItem;
}

export interface IInputName {
    value: string;
}

export class ItemCollectionView extends React.Component<IItemCollection, IInputName> {

    constructor(collection: IItemCollection) {
        super(collection);
        this.onSelectItem = this.onSelectItem.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.state = {value: ''};
    }

    public render(): JSX.Element {
        const _this = this;

        const buttonElements: JSX.Element[] = this.props.items.map((item: IItem): JSX.Element => {
            return (
                <ItemView
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        onClick={_this.onSelectItem}
                />
            )
        });

        const formElement: JSX.Element = (
            <form onSubmit={_this.onSubmitForm}>
                <div className='form-group'>
                    <label htmlFor='inputName'>Name:</label>
                    <input id='inputName'
                            className='form-control'
                            value={_this.state.value}
                            placeholder='Your name'
                            onChange={_this.onChange}
                     />
                     <button type='submit'
                            className='submit-button'
                            value='Submit'>
                        Submit
                     </button>
                </div>
            </form>
        );

        return (
            <div>
                <h1>{_this.props.title}</h1>
                <div>
                    {buttonElements}
                </div>
                <div>
                    Selected item: {_this.props.selectedItem.id} - {_this.props.selectedItem.name}
                </div>
                {formElement}
            </div>
        )
    }

    public onSelectItem(item: IItem): void {
        this.props.selectedItem.id = item.id;
        this.props.selectedItem.name = item.name;
        this.setState({});
    }

    public onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const valueName: string = event.target.name;
        this.setState({value: event.target.value});
    }

    public onSubmitForm(event: React.FormEvent) {
        console.log(event);
        event.preventDefault();
    }

}