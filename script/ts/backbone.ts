interface IClickableItem {
    itemId: number;
    itemName: string;
}

interface IItemCollectionViewModel {
    title: string;
    selectedItem: IClickableItem;
    inputName: string;
    inputPlaceholder: string;
}

function logger<T>(
    target: any,
    methodName: string,
    prop: TypedPropertyDescriptor<T>
): void | TypedPropertyDescriptor<T> {
    const method: (...args: any[]) => any = target[methodName];

    const loggerFunc = function(this: any, ...args: any[]): any {
        console.log(`${methodName} in ${target.constructor.name}`);
        return method.apply(this, args);
    }

    // target[methodName] = loggerFunc;
    console.log(target);
}

class EventBus {
    public static Bus: Backbone.Events = _.extend({}, Backbone.Events);
    public static trigger(eventName: string, ...args: any[]): void {
        this.Bus.trigger(eventName, ...args);
    }
}

class ItemModel extends Backbone.Model<IClickableItem> implements IClickableItem {
    public itemId!: number;
    public itemName!: string;
}

class ItemCollection extends Backbone.Collection<ItemModel> {
    public override model = ItemModel;
}

class ItemCollectionModel extends Backbone.Model<IItemCollectionViewModel> implements IItemCollectionViewModel {
    public title!: string;

    public get selectedItem(): IClickableItem {
        return this.get('selectedItem') ?? {itemId: 0, itemName: 'None selected'};
    };

    public set selectedItem(value: IClickableItem) {
        this.attributes.selectedItem = value;
    };

    public inputName!: string;
    public inputPlaceholder!: string;

}

abstract class AbstractTemplateView<T extends Backbone.Model> extends Backbone.View<T> {

    public template: (json: any, option?: any) => string;

    constructor(
        options: Backbone.ViewOptions<T>,
        templateHtml: string,
    ) {
        super(options);
        this.template = _.template(templateHtml);
    }

    public override render(): this {
        this.$el.html(
            this.template(this.model.attributes),
        );

        return this;
    }
}

class ItemModelView extends AbstractTemplateView<ItemModel> {

    constructor(
        options: Backbone.ViewOptions<ItemModel> = {},
    ) {
        options.events = {'click': 'onClicked'};
        const templateHtml: string = $('#itemViewTemplate').html();

        super(options, templateHtml);
    }

    public onClicked(): void {
        EventBus.trigger('item_clicked', this.model.attributes);
    }

}

class ItemCollectionModelView extends AbstractTemplateView<ItemCollectionModel> {
    public itemCollection: ItemCollection;

    constructor(
        options: Backbone.ViewOptions<ItemCollectionModel> = {},
        itemCollection: ItemCollection,
    ) {
        options.events = {'click #submit-button-button': 'submitClick'}
        const templateHtml: string = $('#itemCollectionViewTemplate').html();

        super(options, templateHtml);

        this.itemCollection = itemCollection;
        this.listenTo(EventBus.Bus, 'item_clicked', this.handleEvent);
    }

    public override render(): this {
        super.render();

        this.itemCollection.each((item: ItemModel) => {
            const itemView: ItemModelView= new ItemModelView({
                model: item,
            });
            this.$el.find('#ulRegions').append(itemView.render().$el);
        });

        return this;
    }

    public submitClick(): void {
        const name = this.$el.find('#inputName');
        if (name.length > 0) {
            console.log('name: ' + name.val());
        }
    }

    public handleEvent(item: IClickableItem) {
        this.model.selectedItem = item;
        this.render();
    }
}

class ScreenViewApp {
    public static start(): void {
        const itemModels: ItemModel[] = clickableItems.map((item: IClickableItem) => {
            return new ItemModel(item);
        });
        const itemCollection: ItemCollection = new ItemCollection(itemModels);

        const itemCollectionModel: ItemCollectionModel = new ItemCollectionModel({
            title: 'Title',
            selectedItem: {
                itemId: 0,
                itemName: 'None selected',
            },
            inputName: '',
            inputPlaceholder: 'Your name'
        });

        const itemCollectionView: ItemCollectionModelView = new ItemCollectionModelView(
            {model: itemCollectionModel},
            itemCollection,
        );

        $('#pageLayoutRegion').html(
            itemCollectionView.render().el,
        );
    }

    // @logger
    public finish(): void {
        console.log('finish');

    }
}

const clickableItems: IClickableItem[] = [
    {itemId: 1, itemName: '1st item'},
    {itemId: 2, itemName: '2nd item'},
    {itemId: 3, itemName: '3d item'},
]


