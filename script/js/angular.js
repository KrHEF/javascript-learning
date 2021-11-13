"use strict";
(function (moduleName, run = true) {
    console.log(moduleName + ' started');
    function DemoDataConstant() {
        console.log('[constant]');
        return [
            'World',
            'Another world',
        ];
    }
    function DataServise(demoData) {
        console.log('[service] DataServise created');
        return {
            get: () => {
                return demoData;
            }
        };
    }
    function DemoController(dataService, $rootScope) {
        console.log('[controller] DemoController created');
        const vm = this;
        setTimeout(() => {
            vm.messages = dataService.get().map((message) => `Hello, ${message}`);
            $rootScope.$apply();
        }, 2000);
    }
    function DemoConfig(demoData) {
        console.log('[config] DemoConfig created');
        demoData.push('3d world');
    }
    function RunDemo($rootScope, $window) {
        console.log('[run] RunDemo created');
    }
    if (!run) {
        return;
    }
    angular.module(moduleName, [])
        .config(['demoData', DemoConfig])
        .controller('demoController', ['dataService', '$rootScope', DemoController])
        .constant('demoData', DemoDataConstant())
        .run(['$rootScope', '$window', RunDemo])
        .service('dataService', ['demoData', DataServise]);
}('myDemoApp'));
//# sourceMappingURL=angular.js.map