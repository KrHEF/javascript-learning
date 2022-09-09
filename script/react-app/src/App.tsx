import * as React from 'react';
import { hot } from "react-hot-loader/root";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IItem } from './models/item.model';
import { ItemCollectionView } from './components/item-collection.view';

const items: IItem[] = [
    {id: 1, name: '1st item'},
    {id: 2, name: '2nd item'},
    {id: 3, name: '3d item'},
];

class App extends React.Component {
    render() {
        return (
            <>
                <ItemCollectionView
                        title="Press Button"
                        items={items}
                        selectedItem={ {id: 0, name: 'None selected'} }
                />
            </>
        );
    }
}

export default hot(App);