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
if (0) {
    var codeWrapper_1 = document.getElementById("code-wrapper");
    addFunctionMeta({ title: "nodeType",
        warning: "Depricated", func: function () { return codeWrapper_1.nodeType; },
    });
    addFunctionMeta({ title: "nodeName", func: function () { return codeWrapper_1.nextSibling.nodeName; },
    });
    addFunctionMeta({ title: "tagName", func: function () { return codeWrapper_1.tagName; },
    });
    addFunctionMeta({ title: "innerHtml",
        warning: "Есть только у элементов", func: function () { return codeWrapper_1.innerHTML = "<b>Привет, мир!</b>"; },
    });
    addFunctionMeta({ title: "outerHtml",
        warning: "Не меняет элемент!", func: function () {
            var bb = codeWrapper_1.getElementsByTagName("b"); // Динамическая коллекция
            if (bb && bb.length) {
                bb[0].outerHTML = "<i>" + bb[0].textContent + "</i>";
                return bb[0];
            }
            return bb;
        },
    });
    addFunctionMeta({ title: "nodeValue", func: function () { return codeWrapper_1.previousSibling.previousSibling.nodeValue; },
    });
    addFunctionMeta({ title: "data",
        warning: "Почти тоже самое, что nodeValue", func: function () { return codeWrapper_1.previousSibling.previousSibling["data"]; },
    });
    addFunctionMeta({ title: "textContent", func: function () { return codeWrapper_1.textContent; },
    });
    addFunctionMeta({ title: "hidden", func: function () { return setInterval(function () { return codeWrapper_1.hidden = !codeWrapper_1.hidden; }, 5e2); },
    });
}
// Атрибуты и свойства
if (0) {
    var codeWrapper_2 = document.getElementById("code-wrapper");
    addFunctionMeta({ title: "attribute id as property elem.id", func: function () { return codeWrapper_2.id; },
    });
    addFunctionMeta({ title: "hasAttribute",
        warning: "Имена атрибутов регистронезависимые", func: function () { return codeWrapper_2.hasAttribute('name'); },
    });
    addFunctionMeta({ title: "setAttribute and attributes",
        warning: "attributes возвращает динамическую коллекцию, и т. к. дальше атрибут удаляется, то он отсутствует", func: function () {
            codeWrapper_2.setAttribute('myAttr', '123');
            return codeWrapper_2.attributes;
        },
    });
    addFunctionMeta({ title: "removeAttribute and getAttribute", func: function () {
            codeWrapper_2.removeAttribute('myAttr');
            return codeWrapper_2.getAttribute('myAttr');
        },
    });
    addFunctionMeta({ title: "Атрибут style - строка, свойство style - объект", func: function () {
            codeWrapper_2.setAttribute('style', 'color: red');
            return "\u0410\u0442\u0440\u0438\u0431\u0443\u0442 style - " + typeof codeWrapper_2.getAttribute("style") + ", \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E style - " + typeof codeWrapper_2.style;
        },
    });
    addFunctionMeta({ title: "data- атрибуты доступны через свойство dataset",
        warning: "Атрибуты, состоящие из нескольких слов становятся свойствами, записанными с помощью верблюжьей нотации:", func: function () {
            codeWrapper_2.setAttribute('data-my-attr', '123');
            return codeWrapper_2.dataset.myAttr;
        },
    });
    addFunctionMeta({ title: "outerHtml выводит все установленные атрибуты элемента", func: function () { return codeWrapper_2.outerHTML; },
    });
}
// Добавление в DOM и удаление из DOM
if (0) {
    var codeWrapper_3 = document.getElementById("code-wrapper");
    var codeWrapperClone_1;
    var span_1, text_1;
    addFunctionMeta({ title: "document.createElement", func: function () {
            span_1 = document.createElement('span');
            return span_1;
        },
    });
    addFunctionMeta({ title: "document.createTextNode", func: function () {
            text_1 = document.createTextNode("Привет, Мир!");
            return text_1;
        },
    });
    addFunctionMeta({ title: "append - вставка элемента в родительский элемент с конца",
        warning: "Один элемент можно вставить всего 1 раз, затем он перемещаются", func: function () {
            codeWrapper_3.append(span_1);
            span_1.append(text_1);
        },
    });
    addFunctionMeta({ title: "prepend - вставка элемента в родительский элемент с начала", func: function () {
            var div2 = document.createElement('div');
            div2.innerHTML = "My message:";
            codeWrapper_3.prepend(div2);
        },
    });
    addFunctionMeta({ title: "before - вставка элемента слева", func: function () {
            var spanLeft = document.createElement('span');
            spanLeft.innerHTML = '"';
            span_1.before(spanLeft);
        },
    });
    addFunctionMeta({ title: "after - вставка элемента справа", func: function () {
            var spanRight = document.createElement('span');
            spanRight.innerHTML = '"';
            span_1.after(spanRight);
        },
    });
    addFunctionMeta({ title: "replaceWith - замена node", func: function () {
            var spanReplace = document.createElement('span');
            spanReplace.innerHTML = 'Hello, World!';
            span_1.replaceWith(spanReplace);
        },
    });
    addFunctionMeta({ title: "insertAdjacentHTML - вставка html текста",
        warning: "beforebegin - вставка перед элементом, afterbegin - вставка в начало элемента, beforeend - вставка в конец элемента, afterend - вставка после элемента ", func: function () { return codeWrapper_3.insertAdjacentHTML("beforeend", "<p> Абзац </p>"); },
    });
    addFunctionMeta({ title: "insertAdjacentText - вставка текста", func: function () { return codeWrapper_3.insertAdjacentText("beforeend", "<p> Вставка текста.</p>"); },
    });
    addFunctionMeta({ title: "insertAdjacentElement - вставка элемента", func: function () {
            var divElem = document.createElement('div');
            divElem.innerHTML = 'Другой текст';
            codeWrapper_3.insertAdjacentElement("afterbegin", divElem);
        },
    });
    addFunctionMeta({ title: "cloneNode - клонирование элемента", func: function () {
            codeWrapperClone_1 = codeWrapper_3.cloneNode(false);
            return codeWrapperClone_1;
        },
    });
    addFunctionMeta({ title: "remove - удаление из DOM",
        warning: "Элемент удаляется только из DOM, если была ссылка на него, то он остается в памяти", func: function () { return codeWrapper_3.remove(); },
    });
    addFunctionMeta({ title: "DocumentFragment - обертка, которая удаляется при вставке, т. е. не имеет тега, а используется как контейнер", func: function () {
            var fragment = new DocumentFragment();
            fragment.append(codeWrapperClone_1);
            document.body.append(fragment);
        },
    });
    addFunctionMeta({ title: "appendChild - как append, но возвращает вставленный элемент",
        warning: "аналогично appendChild работают: prepandChild, insertBefore, insertAfter, replaceChild, removeChild", func: function () { return codeWrapperClone_1.appendChild(span_1); },
    });
}
// Стили и классы 
if (1) {
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
    // addFunctionMeta({ title: "",
    //     func: () => ,
    // });
}
// interface IHostedField {
//     name: string; 
// };
// function _get<T>(obj: any, path: string, defaultValue: T): T {
//     return _.get<any, string, T>(obj, path, defaultValue);
// }
// // let hostedFields0: IHostedField[] = this.hostedFields.fields; // Возможна ошибка - см. 1)
// let hostedFields1: IHostedField[] = ('hostedFields' in this && 'fields' in this.hostedFields) ? this.hostedFields.fields : {}; // Возможна ошибка, см. 2)
// let hostedFields2: IHostedField[] = _.get(this, 'hostedFields.fields', {}); // Возможна ошибка, см. 2)
// let hostedFields3: IHostedField[] = _.get(this, 'hostedFields.fields', [{}]);  // Возможна ошибка, см. 3)
// let hostedFields4: IHostedField[] = _.get<any, string, IHostedField[]>(this, 'hostedFields.fields', []); // Вроде бы все хорошо, решены  проблемы 1,2,3))), но см. следующий пример
// let hostedFields5: IHostedField[] = _.get<any, string, IHostedField>(this, 'hostedFields.fields', {name: ""}); // Возможна ошибка, см. 4)
// let hostedFields6: IHostedField[] = _get<IHostedField[]>(this, 'code-wrapper', [{name: ''}]); // Решены все проблемыЖ 1,2,3,4)))).
// // console.log(hostedFields0);   
// console.log(hostedFields1);
// console.log(hostedFields2);
// console.log(hostedFields6);
// 1) нет проверки на существования поля this.hostedFields - м/б undefined.
// 2) Пустой объект {} не соответствует типу переменной IHostedField[]
// 3) Пустой объект на соответствует интерфейсу IHostedField. 
// 4) Тип значения по умолчанию IHostedField не соответствует типу переменной IHostedField[]. 
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
            console.warn(funcMeta.title);
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
        else if ((result === null || result === void 0 ? void 0 : result.length) && result[0] instanceof EventTarget) {
            console.dir(result);
        }
        else {
            console.log(result);
        }
    });
})();
//# sourceMappingURL=main.js.map