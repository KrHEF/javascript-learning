// 2nd app: myDemoApp
(function(moduleName: string, run: boolean = true) {
    interface IDataService {
        get: () => string[];
    }

    interface IDemoController {
        messages: string[];
    }

    console.log(moduleName + ' started');

    function DemoDataConstant(): string[] {
        console.log('[constant]');
        return [
            'World',
            'Another world',
        ];
    }

    function DataServise(demoData: string[]): IDataService {
        console.log('[service] DataServise created');
        return {
            get: () => {
                return demoData;
            }
        }
    }

    function DemoController(this: any, dataService: IDataService, $rootScope: ng.IRootScopeService): void {
        console.log('[controller] DemoController created');
        const vm: IDemoController = this as IDemoController;
        setTimeout(() => {
            vm.messages = dataService.get().map((message: string) => `Hello, ${message}` );
            $rootScope.$apply();
        }, 2000)
    }

    function DemoConfig(demoData: string[]) {
        console.log('[config] DemoConfig created');
        demoData.push('3d world');
    }

    function RunDemo($rootScope: ng.IRootScopeService, $window: ng.IWindowService) {
        console.log('[run] RunDemo created');
    }

    if (!run) { return; }

    angular.module(moduleName, [])
        .config(['demoData', DemoConfig])
        .controller('demoController', ['dataService', '$rootScope', DemoController])
        .constant('demoData', DemoDataConstant())
        .run(['$rootScope', '$window', RunDemo])
        .service('dataService', ['demoData', DataServise]);

    }('myDemoApp'));

