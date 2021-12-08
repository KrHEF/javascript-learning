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

    interface   IDemoController {
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

    function DemoServise(demoData: string[], demoProvider: TestProvider): IDataService {
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
        demoFactory: string,
        $rootScope: ng.IRootScopeService
    ): void {
        console.log('[controller] DemoController created');

        const vm: IDemoController = this;
        setTimeout(() => {
            vm.messages = dataService.get().map((message: string) => `Hello, ${message}` );
            $rootScope.$apply();
        }, 2000)
    }

    function DemoConfig(demoConstant: string[], demoProvider: DemoProvider) {
        console.log('[config] DemoConfig created');
        demoConstant.push('3d world');

        demoProvider.setConfig(true);
    }

    function DemoValue(): string {
        console.log('[value] DemoValue created');
        return '12345';
    }

    function RunDemo($rootScope: ng.IRootScopeService, $window: ng.IWindowService) {
        console.log('[run] RunDemo created');
    }

    function DemoFactory(): string {
        console.log('[factory] DemoFactory created');
        return 'factory';
    }

    class TestProvider {
        protected config = false;

        constructor(config: boolean) {
            console.log('[provider] TestProvider created');
            this.config = config;
        }

        log(): void {
            console.log('config:', this.config);
        }
    }

    class DemoProvider {
        protected config = false;

        constructor() {
            console.log('[provider] DemoProvider created');
        }

        setConfig(value: boolean): void {
            this.config = !!value;
        }

        $get = (): TestProvider => {
            console.log('[provider] get TestProvider from DemoProvider');
            return new TestProvider(this.config);
        };
    }

    function DemoDirective() {
        console.log('[directive] DemoDirective created');

        return {
            restrict: 'E',
            scope: {},
            link: ($scope: angular.IScope, $element: JQLite) => {
                console.log('[directive] DemoDirective linked');
                $element.text('test');
            },
        };
    }

    angular.module(moduleName, [])
    .config(['demoConstant', 'demoProvider', DemoConfig])
    .controller('demoController', ['demoService', 'demoFactory', '$rootScope', 'demo', DemoController])
    .value('demoValue', DemoValue())
    .constant('demoConstant', DemoConstant())
    .run(['$rootScope', '$window', RunDemo])
    .service('demoService', ['demoConstant', 'demo', DemoServise])
    .factory('demoFactory', [DemoFactory])
    .provider('demo', DemoProvider)
    .directive('myDemo', [DemoDirective])
    ;

    const element: HTMLElement | null = document.querySelector(`[data-ng-app="${moduleName}"]`);
    if (element && firstBootstrap) {
        angular.bootstrap(element, [moduleName]);
    } else {
        firstBootstrap = true;
    }
}('mySecondApp'));


(function(moduleName: string, run: boolean = true) {
    interface ITestService {
        a: number;
        go(): void;
    }

    if (!run) { return; }
    console.warn('[module] ' + moduleName + ' started');

    class TestService {
        a = 0;
        go() {
            this.a++;
            console.log('a: ' + this.a);
        }
    }

    function DemoController1(this: any, testService: ITestService) {
        console.log('DemoController1 created');
        console.log('testService', testService);
        testService.go();
        this.a = testService.a;
    }

    function DemoController2(this: any, testService: ITestService) {
        testService.go();
        this.a = testService.a;
    }


    angular.module(moduleName, [])
    // .factory('TestService', () => {
    //     return new TestService();
    // })
    .service('TestService', TestService)
    .controller('demoController1', ['TestService', DemoController1])
    .controller('demoController2', ['TestService', DemoController2])
    ;

    const element: HTMLElement | null = document.querySelector(`[data-ng-app="${moduleName}"]`);
    if (element && firstBootstrap) {
        angular.bootstrap(element, [moduleName]);
    } else {
        firstBootstrap = true;
    }

}('my3dApp', false));
