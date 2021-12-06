let firstBootstrap: boolean = false;

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

    function DemoConstant(): string[] {
        console.log('[constant] DemoConstant created');
        return [
            'World',
            'Another world',
        ];
    }

    function DemoServise(demoData: string[]): IDataService {
        console.log('[service] DemoServise created');
        return {
            get: () => {
                return demoData;
            }
        }
    }

    function DemoController(
        this: IDemoController,
        dataService: IDataService,
        $rootScope: ng.IRootScopeService
    ): void {
        console.log('[controller] DemoController created');

        const vm: IDemoController = this;
        setTimeout(() => {
            vm.messages = dataService.get().map((message: string) => `Hello, ${message}` );
            $rootScope.$apply();
        }, 2000)
    }

    function DemoConfig(demoConstant: string[]) {
        console.log('[config] DemoConfig created');
        demoConstant.push('3d world');
    }

    function DemoValue(): string {
        console.log('[value] DemoValue created');
        return '12345';
    }

    function RunDemo($rootScope: ng.IRootScopeService, $window: ng.IWindowService) {
        console.log('[run] RunDemo created');
    }


    angular.module(moduleName, [])
    .config(['demoConstant', DemoConfig])
    .controller('demoController', ['demoService', '$rootScope', DemoController])
    .value('demoValue', DemoValue())
    .constant('demoConstant', DemoConstant())
    .run(['$rootScope', '$window', RunDemo])
    .service('demoService', ['demoConstant', DemoServise]);

    const element: HTMLElement | null = document.querySelector(`[data-ng-app="${moduleName}"]`);
    if (element && firstBootstrap) {
        angular.bootstrap(element, [moduleName]);
    } else {
        firstBootstrap = true;
    }
}('mySecondApp'));
