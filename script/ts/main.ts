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
if ( 1 ) {
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
        func: () => codeWrapper.innerHTML = "<b>Привет, мир!</b>",
    });
    addFunctionMeta({ title: "outerHtml",
        warning: "Не меняет элемент!",
        func: () => {
            let bb = codeWrapper.getElementsByTagName("b");
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
            console.info( funcMeta.title );
        }
        if (funcMeta.warning) {
            console.error( funcMeta.warning );
        }
        console.log( funcMeta.func );

        // funcMeta.func(...(funcMeta.args));
        let result = funcMeta.func();
        if ( result instanceof EventTarget ) {
            console.dir(result);
        } else if ( result.length && result[0] instanceof EventTarget) {
            console.dir(result);
        } else {
            console.log(result);
        }

        console.log("=================================");
    });   
})();





