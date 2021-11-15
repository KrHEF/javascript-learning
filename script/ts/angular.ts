let firstBootstrap: boolean = false;

// 2nd app: myDemoApp
(function(moduleName: string, run: boolean = true): void {
    interface IDataService {
        get: () => string[];
    }

    interface IDemoController {
        messages: string[];
    }

    if (!run) { return; }

    console.warn('[module] ' + moduleName + ' started');

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

    function DemoController(this: IDemoController, dataService: IDataService, $rootScope: ng.IRootScopeService): void {
        console.log('[controller] DemoController created');
        const vm: IDemoController = this;
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


    angular.module(moduleName, [])
    .config(['demoData', DemoConfig])
    .controller('demoController', ['dataService', '$rootScope', DemoController])
    .constant('demoData', DemoDataConstant())
    .run(['$rootScope', '$window', RunDemo])
    .service('dataService', ['demoData', DataServise]);

    const element: HTMLElement | null = document.querySelector(`[data-ng-app="${moduleName}"]`);
    if (element && firstBootstrap) {
        angular.bootstrap(element, [moduleName]);
    } else {
        firstBootstrap = true;
    }
}('myDemoApp'));

// 1st app: myFirstApp
(function(moduleName: string, run: boolean = true): void {
    if (!run) { return; }

    console.warn('[module] ' + moduleName + ' started');

    angular.module('myFirstApp', []);

    const element: HTMLElement | null = document.querySelector(`[data-ng-app="${moduleName}"]`);
    if (element && firstBootstrap) {
        angular.bootstrap(element, [moduleName]);
    } else {
        firstBootstrap = true;
    }
})('myFirstApp');
