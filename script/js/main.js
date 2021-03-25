'use strict';
const funcsMeta = [];
if (1) {
    addFunctionMeta({ title: "Доступ к DOM через document",
        func: () => document,
    });
    addFunctionMeta({ title: "Доступ к <head>",
        func: () => document.head,
    });
    addFunctionMeta({ title: "Доступ к <html>",
        func: () => document.documentElement,
    });
    addFunctionMeta({ title: "Доступ к <body>",
        func: () => document.body,
    });
    addFunctionMeta({ title: "Все дети (в том числе и текстовые узла)",
        func: () => document.body.childNodes,
    });
    addFunctionMeta({ title: "Все дети_только_элементы",
        func: () => document.body.children,
    });
    addFunctionMeta({ title: "Первый дочерний элемент",
        func: () => document.body.firstElementChild,
    });
    addFunctionMeta({ title: "Проверка на дочерний узел", func: () => { var _a; return (_a = document.body.firstElementChild) === null || _a === void 0 ? void 0 : _a.hasChildNodes(); },
    });
    addFunctionMeta({ title: "Сосед справа",
        func: () => document.head.nextElementSibling,
    });
    addFunctionMeta({ title: "Обращение к элементу через document.getElementById('id')",
        func: () => document.getElementById("code-wrapper"),
    });
    addFunctionMeta({ title: "Обращение к элементу по его id (если id имеет дефис, то через window['id'])",
        warning: "Так можно, но не нужно!",
        func: () => window['code-wrapper'],
    });
    addFunctionMeta({ title: "Поиск элементов по селектору document.querySelectorAll(css selectors)",
        warning: "Псеводклассы тоже работают :hover, :active. Возвращает статическую коллекцию.",
        func: () => document.querySelectorAll('body #code-wrapper'),
    });
    addFunctionMeta({ title: "Первый элемент по селектору ",
        func: () => document.querySelector("html *"),
    });
    addFunctionMeta({ title: "Проверка на удовлетворению css селекторам", func: () => { var _a; return (_a = document.body.firstElementChild) === null || _a === void 0 ? void 0 : _a.matches("#code-wrapper"); },
    });
    addFunctionMeta({ title: "Ближайший родитель, который соответсвует css селекторам (если нет, то просто ближайший)", func: () => { var _a; return (_a = document.getElementById("code-wrapper")) === null || _a === void 0 ? void 0 : _a.closest("body"); },
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по тегу",
        warning: "Возвращает динамическую коллекцию (коллекцию указателей): document.getElementsByTagName('tag or *')",
        func: () => document.getElementsByTagName("div"),
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по тегу: document.getElementsByClassName('classname')",
        func: () => document.getElementsByClassName("wrapper"),
    });
    addFunctionMeta({ title: "Возвращает коллекцию элементов по имени: document.getElementsByName('name')",
        func: () => document.getElementsByName("code"),
    });
    addFunctionMeta({ title: "Проверка вхождения одного элемента в другой",
        func: () => document.body.contains(document.documentElement),
    });
}
if (0) {
    let codeWrapper = document.getElementById("code-wrapper");
    addFunctionMeta({ title: "nodeType",
        warning: "Depricated", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.nodeType,
    });
    addFunctionMeta({ title: "nodeName", func: () => { var _a; return (_a = codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.nextSibling) === null || _a === void 0 ? void 0 : _a.nodeName; },
    });
    addFunctionMeta({ title: "tagName", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.tagName,
    });
    addFunctionMeta({ title: "innerHtml",
        warning: "Есть только у элементов", func: () => codeWrapper.innerHTML = "<b>Привет, мир!</b>",
    });
    addFunctionMeta({ title: "outerHtml",
        warning: "Не меняет элемент!", func: () => {
            let bb = codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.getElementsByTagName("b");
            if (bb && bb.length) {
                bb[0].outerHTML = "<i>" + bb[0].textContent + "</i>";
                return bb[0];
            }
            return bb;
        },
    });
    addFunctionMeta({ title: "nodeValue", func: () => { var _a, _b; return (_b = (_a = codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.previousSibling) === null || _a === void 0 ? void 0 : _a.previousSibling) === null || _b === void 0 ? void 0 : _b.nodeValue; },
    });
    addFunctionMeta({ title: "data",
        warning: "Почти тоже самое, что nodeValue", func: () => {
            var _a;
            return ((_a = codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.previousSibling) === null || _a === void 0 ? void 0 : _a.previousSibling)
                ? codeWrapper.previousSibling.previousSibling["data"]
                : '';
        },
    });
    addFunctionMeta({ title: "textContent", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.textContent,
    });
    addFunctionMeta({ title: "hidden", func: () => setInterval(() => codeWrapper.hidden = !(codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.hidden), 5e2),
    });
}
if (0) {
    let codeWrapper = document.getElementById("code-wrapper");
    addFunctionMeta({ title: "attribute id as property elem.id", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.id,
    });
    addFunctionMeta({ title: "hasAttribute",
        warning: "Имена атрибутов регистронезависимые", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.hasAttribute('name'),
    });
    addFunctionMeta({ title: "setAttribute and attributes",
        warning: "attributes возвращает динамическую коллекцию, и т. к. дальше атрибут удаляется, то он отсутствует", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.setAttribute('myAttr', '123');
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.attributes;
        },
    });
    addFunctionMeta({ title: "removeAttribute and getAttribute", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.removeAttribute('myAttr');
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.getAttribute('myAttr');
        },
    });
    addFunctionMeta({ title: "Атрибут style - строка, свойство style - объект", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.setAttribute('style', 'color: red');
            return `Атрибут style - ${typeof (codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.getAttribute("style"))}, свойство style - ${typeof (codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.style)}`;
        },
    });
    addFunctionMeta({ title: "data- атрибуты доступны через свойство dataset",
        warning: "Атрибуты, состоящие из нескольких слов становятся свойствами, записанными с помощью верблюжьей нотации:", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.setAttribute('data-my-attr', '123');
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.dataset.myAttr;
        },
    });
    addFunctionMeta({ title: "outerHtml выводит все установленные атрибуты элемента", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.outerHTML,
    });
}
if (0) {
    let codeWrapper = document.getElementById("code-wrapper");
    let codeWrapperClone;
    let span, text;
    addFunctionMeta({ title: "document.createElement", func: () => {
            span = document.createElement('span');
            return span;
        },
    });
    addFunctionMeta({ title: "document.createTextNode",
        func: () => {
            text = document.createTextNode("Привет, Мир!");
            return text;
        },
    });
    addFunctionMeta({ title: "append - вставка элемента в родительский элемент с конца",
        warning: "Один элемент можно вставить всего 1 раз, затем он перемещаются", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.append(span);
            span.append(text);
        },
    });
    addFunctionMeta({ title: "prepend - вставка элемента в родительский элемент с начала", func: () => {
            let div2 = document.createElement('div');
            div2.innerHTML = "My message:";
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.prepend(div2);
        },
    });
    addFunctionMeta({ title: "before - вставка элемента слева",
        func: () => {
            let spanLeft = document.createElement('span');
            spanLeft.innerHTML = '"';
            span.before(spanLeft);
        },
    });
    addFunctionMeta({ title: "after - вставка элемента справа",
        func: () => {
            let spanRight = document.createElement('span');
            spanRight.innerHTML = '"';
            span.after(spanRight);
        },
    });
    addFunctionMeta({ title: "replaceWith - замена node", func: () => {
            let spanReplace = document.createElement('span');
            spanReplace.innerHTML = 'Hello, World!';
            span.replaceWith(spanReplace);
        },
    });
    addFunctionMeta({ title: "insertAdjacentHTML - вставка html текста",
        warning: "beforebegin - вставка перед элементом, afterbegin - вставка в начало элемента, beforeend - вставка в конец элемента, afterend - вставка после элемента ", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.insertAdjacentHTML("beforeend", "<p> Абзац </p>"),
    });
    addFunctionMeta({ title: "insertAdjacentText - вставка текста", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.insertAdjacentText("beforeend", "<p> Вставка текста.</p>"),
    });
    addFunctionMeta({ title: "insertAdjacentElement - вставка элемента", func: () => {
            let divElem = document.createElement('div');
            divElem.innerHTML = 'Другой текст';
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.insertAdjacentElement("afterbegin", divElem);
        },
    });
    addFunctionMeta({ title: "cloneNode - клонирование элемента", func: () => {
            codeWrapperClone = codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.cloneNode(false);
            return codeWrapperClone;
        },
    });
    addFunctionMeta({ title: "remove - удаление из DOM",
        warning: "Элемент удаляется только из DOM, если была ссылка на него, то он остается в памяти", func: () => codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.remove(),
    });
    addFunctionMeta({ title: "DocumentFragment - обертка, которая удаляется при вставке, т. е. не имеет тега, а используется как контейнер", func: () => {
            let fragment = new DocumentFragment();
            fragment.append(codeWrapperClone);
            document.body.append(fragment);
        },
    });
    addFunctionMeta({ title: "appendChild - как append, но возвращает вставленный элемент",
        warning: "аналогично appendChild работают: prepandChild, insertBefore, insertAfter, replaceChild, removeChild",
        func: () => codeWrapperClone.appendChild(span),
    });
}
if (0) {
    const codeWrapper = document.querySelector("#code-wrapper");
    addFunctionMeta({ title: "Вся строка с названиями класса elem.className", func: () => codeWrapper.className += " custom",
    });
    addFunctionMeta({ title: "Специальный объект с методами доступа к классам elem.classList",
        warning: "Доступные методы: add, remove, toggle, contains", func: () => {
            codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.classList.add("ef");
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.classList.contains("ef");
        },
    });
    addFunctionMeta({ title: "Задание стиля элемента через объект elem.style",
        warning: "Для свойства из нескольких слов используется camelCase", func: () => {
            codeWrapper.style.backgroundColor = "red";
            codeWrapper.style.height = "1vh";
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.style;
        },
    });
    addFunctionMeta({ title: "Очистка стиля через elem.style.prop = \"\"", func: () => {
            codeWrapper.style.backgroundColor = "";
            return codeWrapper === null || codeWrapper === void 0 ? void 0 : codeWrapper.style;
        },
    });
    addFunctionMeta({ title: "Задание нескольких стилей строкой через elem.style.cssText",
        warning: "Удаляет все существующие стили в атрибуте style", func: () => {
            codeWrapper.style.cssText = "background-color: yellow; width: 25vw; height: 2vh;";
        },
    });
    addFunctionMeta({ title: "Получение наследуемых стилей через elem.getComputedStyle",
        warning: "Функция возвращает окончательные значение в виде вычисленных числовых значений.",
        func: () => codeWrapper ? getComputedStyle(codeWrapper) : null,
    });
}
if (1) {
}
function addFunctionMeta(funcMeta) {
    funcsMeta.push(funcMeta);
}
(function showFunctionsMeta() {
    let codeWrapper = document.getElementById('code-wrapper');
    funcsMeta.forEach((funcMeta) => {
        if (funcMeta.title) {
            console.warn(funcMeta.title);
        }
        if (funcMeta.warning) {
            console.warn(funcMeta.warning);
        }
        if (funcMeta.error) {
            console.warn(funcMeta.error);
        }
        console.log(funcMeta.func);
        let result = funcMeta.func();
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