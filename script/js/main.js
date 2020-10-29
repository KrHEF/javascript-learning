'use strict';
var funcsMeta = [];
// Манипулирование DOM
if (0) {
    addFunctionMeta({ title: "Доступ к DOM через document", func: function () { return document; },
    });
    addFunctionMeta({ title: "Доступ к <head>", func: function () { return document.head; },
    });
    addFunctionMeta({ title: "Доступ к <html>", func: function () { return document.documentElement; },
    });
    addFunctionMeta({ title: "Доступ к <body>", func: function () { return document.body; },
    });
    addFunctionMeta({ title: "Все дети (в том числе и текстовые узла)", func: function () { return document.body.childNodes; },
    });
    addFunctionMeta({ title: "Все дети_только_элементы", func: function () { return document.body.children; },
    });
    addFunctionMeta({ title: "Первый дочерний элемент", func: function () { return document.body.firstElementChild; },
    });
    addFunctionMeta({ title: "Проверка на дочерний узел", func: function () { return document.body.firstElementChild.hasChildNodes(); },
    });
    addFunctionMeta({ title: "Сосед справа", func: function () { return document.head.nextElementSibling; },
    });
    addFunctionMeta({ title: "Обращение к элементу через document.getElementById('id')", func: function () { return document.getElementById("code-wrapper"); },
    });
    addFunctionMeta({ title: "Обращение к элементу по его id (если id имеет дефис, то через window['id'])",
        warning: "Так можно, но не нужно!", func: function () { return window["code-wrapper"]; },
    });
    addFunctionMeta({ title: "Поиск элементов по селектору document.querySelectorAll(css selectors)",
        warning: "Псеводклассы тоже работают :hover, :active. Возвращает статическую коллекцию.", func: function () { return document.querySelectorAll('body #code-wrapper'); },
    });
    addFunctionMeta({ title: "Первый элемент по селектору ", func: function () { return document.querySelector("html *"); },
    });
    addFunctionMeta({ title: "Проверка на удовлетворению css селекторам", func: function () { return document.body.firstElementChild.matches("#code-wrapper"); },
    });
    addFunctionMeta({ title: "Ближайший родитель, который соответсвует css селекторам (если нет, то просто ближайший)", func: function () { return document.getElementById("code-wrapper").closest("body"); },
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по тегу",
        warning: "Возвращает динамическую коллекцию (коллекцию указателей): document.getElementsByTagName('tag or *')", func: function () { return document.getElementsByTagName("div"); },
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по тегу: document.getElementsByClassName('classname')", func: function () { return document.getElementsByClassName("wrapper"); },
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по имени: document.getElementsByName('name')", func: function () { return document.getElementsByName("code"); },
    });
    addFunctionMeta({ title: "Проверка вхождения одного элемента в другой", func: function () { return document.body.contains(document.documentElement); },
    });
}
// Изменение DOM
if (1) {
    var codeWrapper_1 = document.getElementById("code-wrapper");
    addFunctionMeta({ title: "nodeType",
        warning: "Depricated", func: function () { return codeWrapper_1.nodeType; },
    });
    addFunctionMeta({ title: "nodeName", func: function () { return codeWrapper_1.nextSibling.nodeName; },
    });
    addFunctionMeta({ title: "tagName", func: function () { return codeWrapper_1.tagName; },
    });
    addFunctionMeta({ title: "innerHtml", func: function () { return codeWrapper_1.innerHTML = "<b>Привет, мир!</b>"; },
    });
    addFunctionMeta({ title: "outerHtml",
        warning: "Не меняет элемент!", func: function () {
            var bb = codeWrapper_1.getElementsByTagName("b");
            if (bb && bb.length) {
                bb[0].outerHTML = "<i>" + bb[0].textContent + "</i>";
            }
            return bb;
        },
    });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
}
function addFunctionMeta(funcMeta) {
    funcsMeta.push(funcMeta);
}
(function showFunctionsMeta() {
    var codeWrapper = document.getElementById('code-wrapper');
    funcsMeta.forEach(function (funcMeta) {
        // let nodeDList = new HTMLDListElement();
        // let name = ''
        // if ( 'name' in f ) {
        //     // name = f.name;
        //     name = 'name';
        // }
        // codeWrapper.append(nodeDList);
        // nodeDList.innerHTML = '<dl><dt>' + funcMeta.title + '</dt><dd>' + funcMeta.func + '</dd>';
        if (funcMeta.title) {
            console.info(funcMeta.title);
        }
        if (funcMeta.warning) {
            console.error(funcMeta.warning);
        }
        console.log(funcMeta.func);
        // funcMeta.func(...(funcMeta.args));
        var result = funcMeta.func();
        if (result instanceof EventTarget) {
            console.dir(result);
        }
        else if (result.length && result[0] instanceof EventTarget) {
            console.dir(result);
        }
        else {
            console.log(result);
        }
        console.log("=================================");
    });
})();
//# sourceMappingURL=main.js.map