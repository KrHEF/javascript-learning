import {
    ChangeDetectionStrategy,
    Component,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
} from '@angular/forms';

interface IClickableItem {
    itemId: number;
    itemName: string;
}

const clickableItems: IClickableItem[] = [
    { itemId: 1, itemName: '1st item' },
    { itemId: 2, itemName: '2nd item' },
    { itemId: 3, itemName: '3d item' },
];


@Component({
    selector: '[app-root]',
    templateUrl: './app.component.html',
    styleUrls: [
        './app.component.scss',
        '../../node_modules/bootstrap/dist/css/bootstrap.css'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public title = 'Press button';
    public items: IClickableItem[] = clickableItems;
    public selectedItem: IClickableItem = {
        itemId: 0, itemName: 'None selected',
    };

    public inputName: string = '';
    public inputPlaceholder = 'Your name';

    public reactiveFormGroup!: FormGroup;

    constructor(
        protected formBilder: FormBuilder,
    ) {}

    public ngOnInit(): void {
        this.reactiveFormGroup = this.formBilder.group({
            nameInput: new FormControl(),
        });
        this.reactiveFormGroup.reset({
            nameInput: '',
        });
    }

    public onItemClick(item: IClickableItem): void {
        this.selectedItem = item;
    }

    public onSubmit(): void {
        console.log('name: ' + this.inputName);
    }

    public onSubmitRF(): void {
        console.log(`onSubmitRf: nameInput: ${this.reactiveFormGroup.value.nameInput}`);
    }
}
