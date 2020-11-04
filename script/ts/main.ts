'use strict'

type FunctionMetaType = {
    title?: string,
    warning?: string,
    func: Function,
    args?: any[]
}

const funcsMeta: FunctionMetaType[] = [];

// Манипулирование DOM
if ( 0 ) {
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
    addFunctionMeta({ title: "Проверка на дочерний узел",
        func: () => document.body.firstElementChild.hasChildNodes(),
    });
    addFunctionMeta({ title: "Сосед справа",
        func: () => document.head.nextElementSibling,
    });
    addFunctionMeta({ title: "Обращение к элементу через document.getElementById('id')",
        func: () => document.getElementById("code-wrapper"),
    });
    addFunctionMeta({ title: "Обращение к элементу по его id (если id имеет дефис, то через window['id'])",
        warning: "Так можно, но не нужно!",
        func: () => window["code-wrapper"],
    });
    addFunctionMeta({ title: "Поиск элементов по селектору document.querySelectorAll(css selectors)",
        warning: "Псеводклассы тоже работают :hover, :active. Возвращает статическую коллекцию.",
        func: () => document.querySelectorAll('body #code-wrapper'),
    });
    addFunctionMeta({ title: "Первый элемент по селектору ",
        func: () => document.querySelector("html *") ,
     });
    addFunctionMeta({ title: "Проверка на удовлетворению css селекторам",
        func: () => document.body.firstElementChild.matches("#code-wrapper") ,
    });
    addFunctionMeta({ title: "Ближайший родитель, который соответсвует css селекторам (если нет, то просто ближайший)",
        func: () => document.getElementById("code-wrapper").closest("body"),
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
        func: () => document.body.contains( document.documentElement ),
    });
}

// Изменение DOM
if ( 0 ) {
    let codeWrapper = document.getElementById("code-wrapper");

    addFunctionMeta({ title: "nodeType",
        warning: "Depricated",
        func: () => codeWrapper.nodeType ,
    });
    addFunctionMeta({ title: "nodeName",
        func: () => codeWrapper.nextSibling.nodeName,
    });
    addFunctionMeta({ title: "tagName",
        func: () => codeWrapper.tagName,
    });
    addFunctionMeta({ title: "innerHtml",
        warning: "Есть только у элементов",
        func: () => codeWrapper.innerHTML = "<b>Привет, мир!</b>",
    });
    addFunctionMeta({ title: "outerHtml",
        warning: "Не меняет элемент!",
        func: () => {
            let bb = codeWrapper.getElementsByTagName("b");     // Динамическая коллекция
            if (bb && bb.length) {
                bb[0].outerHTML = "<i>" + bb[0].textContent + "</i>";
                return bb[0];
            }
            return bb; 
        },
    });
    addFunctionMeta({ title: "nodeValue",
        func: () => codeWrapper.previousSibling.previousSibling.nodeValue,
    });
    addFunctionMeta({ title: "data",
        warning: "Почти тоже самое, что nodeValue",
        func: () => codeWrapper.previousSibling.previousSibling["data"] ,
    });
    addFunctionMeta({ title: "textContent",
        func: () => codeWrapper.textContent ,
    });
    addFunctionMeta({ title: "hidden",
        func: () => setInterval(() => codeWrapper.hidden = !codeWrapper.hidden, 5e2),
    });
}

// Атрибуты и свойства
if (0) {
    let codeWrapper = document.getElementById("code-wrapper");

    addFunctionMeta({ title: "attribute id as property elem.id",
        func: () => codeWrapper.id,
    });
    addFunctionMeta({ title: "hasAttribute",
        warning: "Имена атрибутов регистронезависимые",
        func: () => codeWrapper.hasAttribute('name'),
    });
    addFunctionMeta({ title: "setAttribute and attributes",
        warning: "attributes возвращает динамическую коллекцию, и т. к. дальше атрибут удаляется, то он отсутствует",
        func: () => { 
            codeWrapper.setAttribute('myAttr', '123');
            return codeWrapper.attributes;
        },
    });
    addFunctionMeta({ title: "removeAttribute and getAttribute",
        func: () => {
            codeWrapper.removeAttribute('myAttr');
            return codeWrapper.getAttribute('myAttr');
        },
    });
    addFunctionMeta({ title: "Атрибут style - строка, свойство style - объект",
        func: () => {
            codeWrapper.setAttribute('style', 'color: red');
            return `Атрибут style - ${ typeof codeWrapper.getAttribute("style") }, свойство style - ${ typeof codeWrapper.style }`;
        },
    });
    addFunctionMeta({ title: "data- атрибуты доступны через свойство dataset",
        warning: "Атрибуты, состоящие из нескольких слов становятся свойствами, записанными с помощью верблюжьей нотации:",
        func: () => {
            codeWrapper.setAttribute('data-my-attr', '123');
            return codeWrapper.dataset.myAttr;
        },
    });
    addFunctionMeta({ title: "outerHtml выводит все установленные атрибуты элемента",
        func: () => codeWrapper.outerHTML,
    });
}

// Добавление в DOM и удаление из DOM
if (0) {
    let codeWrapper: HTMLElement = document.getElementById("code-wrapper");
    let codeWrapperClone: HTMLElement;
    let span: HTMLSpanElement, text: Node;

    addFunctionMeta({ title: "document.createElement",
        func: () => {
            span = document.createElement<'span'>('span');
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
        warning: "Один элемент можно вставить всего 1 раз, затем он перемещаются",
        func: () => {
            codeWrapper.append(span);
            span.append(text)
        },
    });
    addFunctionMeta({ title: "prepend - вставка элемента в родительский элемент с начала",
        func: () => {
            let div2 = document.createElement('div');
            div2.innerHTML = "My message:";
            codeWrapper.prepend(div2);
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
    addFunctionMeta({ title: "replaceWith - замена node",
        func: () => {
            let spanReplace = document.createElement<'span'>('span');
            spanReplace.innerHTML = 'Hello, World!';
            span.replaceWith(spanReplace);
        },
    });
    addFunctionMeta({ title: "insertAdjacentHTML - вставка html текста",
        warning: "beforebegin - вставка перед элементом, afterbegin - вставка в начало элемента, beforeend - вставка в конец элемента, afterend - вставка после элемента ",
        func: () => codeWrapper.insertAdjacentHTML("beforeend", "<p> Абзац </p>"),
    });
    addFunctionMeta({ title: "insertAdjacentText - вставка текста",
        func: () => codeWrapper.insertAdjacentText("beforeend", "<p> Вставка текста.</p>"),
    });
    addFunctionMeta({ title: "insertAdjacentElement - вставка элемента",
        func: () => {
            let divElem: HTMLDivElement = document.createElement<'div'>('div');
            divElem.innerHTML = 'Другой текст';
            codeWrapper.insertAdjacentElement("afterbegin", divElem);
        },
    });
    addFunctionMeta({ title: "cloneNode - клонирование элемента",
        func: () => {
            codeWrapperClone = ( codeWrapper.cloneNode(false) as HTMLElement);
            return codeWrapperClone;
        },
    });
    addFunctionMeta({ title: "remove - удаление из DOM",
        warning: "Элемент удаляется только из DOM, если была ссылка на него, то он остается в памяти",
        func: () => codeWrapper.remove(),
    });
    addFunctionMeta({ title: "DocumentFragment - обертка, которая удаляется при вставке, т. е. не имеет тега, а используется как контейнер",
        func: () => {
            let fragment: DocumentFragment = new DocumentFragment();
            fragment.append(codeWrapperClone);
            document.body.append(fragment);
        },
    });
    addFunctionMeta({ title: "appendChild - как append, но возвращает вставленный элемент",
        warning: "аналогично appendChild работают: prepandChild, insertBefore, insertAfter, replaceChild, removeChild",
        func: () => codeWrapperClone.appendChild(span),
    });
}

// Стили и классы 
if (0) {
    const codeWrapper: HTMLElement = document.querySelector("#code-wrapper");

    addFunctionMeta({ title: "Вся строка с названиями класса elem.className",
        func: () => codeWrapper.className += " custom" ,
    });
    addFunctionMeta({ title: "Специальный объект с методами доступа к классам elem.classList",
        warning: "Доступные методы: add, remove, toggle, contains",
        func: () => {
            codeWrapper.classList.add("ef");
            return codeWrapper.classList.contains("ef");
        },
    });
    addFunctionMeta({ title: "Задание стиля элемента через объект elem.style",
        warning: "Для свойства из нескольких слов используется camelCase",
        func: () => { 
            codeWrapper.style.backgroundColor = "red";
            codeWrapper.style.height = "1vh";
            return codeWrapper.style;
        },
    });
    addFunctionMeta({ title: "Очистка стиля через elem.style.prop = \"\"",
        func: () => {
            codeWrapper.style.backgroundColor = "";
            return codeWrapper.style;
        },
    });
    addFunctionMeta({ title: "Задание нескольких стилей строкой через elem.style.cssText",
        warning: "Удаляет все существующие стили в атрибуте style",
        func: () => { 
            codeWrapper.style.cssText = "background-color: yellow; width: 25vw; height: 2vh;"
        },
    });
    addFunctionMeta({ title: "Получение наследуемых стилей через elem.getComputedStyle",
        warning: "Функция возвращает окончательные значение в виде вычисленных числовых значений.",
        func: () => getComputedStyle(codeWrapper),
    });
 }

if (1) {
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


// class Class1 {
    
//     constructor (public name: string) {}

//     get Name() {
//         return this.name;
//     }

//     getName() {
//         return this.Name;
//     }
// }

// class Class2 extends Class1 {

//     constructor (name: string, public country: string) {
//         super(name);
//     }
// }

// function factory<T>(): T {
//     return new T();
// }
 
// // let class1 = factory<Class1>("name1");
// let class2 = new Class2("name2", "country1");
// // console.log(class1.Name);
// console.log(class2.Name);

// class Class3 {
    
//     constructor  (private name: string) {
//         this.name = name;
//     }

//     set Name(value: string) {
//         this.name = value;
//     }

//     // get Name() {
//         // throw new Error("Публичный геттер недоступен");
//     // }

// }

// let class3 = new Class3("Name 1");

// console.log(class3.Name);

// let x:number = +('0' + 'x' + 'A');
// // do {
// //     x = + '1' + '0'
// // } while 
// console.log(x--);

 
function addFunctionMeta(funcMeta: FunctionMetaType): void {
    funcsMeta.push(funcMeta);
}

(function showFunctionsMeta(): void {
    
    let codeWrapper: HTMLElement = document.getElementById('code-wrapper');

    funcsMeta.forEach( (funcMeta: FunctionMetaType) => {
        // let nodeDList = new HTMLDListElement();
        // let name = ''
        // if ( 'name' in f ) {
        //     // name = f.name;
        //     name = 'name';
        // }
        // codeWrapper.append(nodeDList);
        // nodeDList.innerHTML = '<dl><dt>' + funcMeta.title + '</dt><dd>' + funcMeta.func + '</dd>';
        
        if (funcMeta.title) {
            console.warn( funcMeta.title );
        }
        if (funcMeta.warning) {
            console.error( funcMeta.warning );
        }
        console.log( funcMeta.func );

        // funcMeta.func(...(funcMeta.args));
        let result = funcMeta.func();
        if ( result instanceof EventTarget ) {
            console.dir(result);
        } else if ( result?.length && result[0] instanceof EventTarget) {
            console.dir(result);
        } else {
            console.log(result);
        }
    });   
})();





