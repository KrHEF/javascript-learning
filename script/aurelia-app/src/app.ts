interface IClickableItem {
    itemId: number;
    itemName: string;
}

export class App {
    public title = 'Press button';
    public selectedItem: IClickableItem = {
        itemId: 0, itemName: 'None selected',
    };
    public items: IClickableItem[] = [
        {itemId: 1, itemName: '1st item'},
        {itemId: 2, itemName: '2nd item'},
        {itemId: 3, itemName: '3d item'},
    ];

    public inputName = '';
    public inputPlaceholder = 'Your name';

    public onItemClicked(item: IClickableItem): void {
        this.selectedItem = item;
    }

    public onSubmit(): void {
        console.log('name: ' + this.inputName);
    }
}

