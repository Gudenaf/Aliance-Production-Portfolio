(() => {
    "use strict";

    // File Logging Sistem
    const flsModules = {};

    // Добавление loaded для HTML после полной загрузки страницы
    function addLoadedClass() {
        window.addEventListener("load", (function() {
            setTimeout((function() {
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }

    // Получение хеша в адресе сайта
    function getHash() {
        if (location.hash) return location.hash.replace("#", "");
    }

    // Добавление класса lock к body
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };

    // Burger menu
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }

    // FLS (Full Logging System)
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }

    // Уникализация массива
    function uniqArray(array) {
        return array.filter((function(item, index, self) {
            return self.indexOf(item) === index;
        }));
    }

    // Класс Popup
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                // Для кнопок
                attributeOpenButton: "data-popup", // Атрибут для кнопки, которая вызывает попап
                attributeCloseButton: "data-close", // Атрибут для кнопки, которая закрывает попап
                // Изменение классов
                classes: {
                    popup: "popup",
                    popupWrapper: "popup__wrapper",
                    popupContent: "popup__content",
                    popupActive: "popup_show", // Добавляется для попапа, когда он открывается
                    bodyActive: "popup-show" // Добавляется для боди, когда попап открыт
                },
                focusCatch: true, // Фокус внутри попапа зациклен
                closeEsc: true, // Закрытие по ESC
                bodyLock: true, // Блокировка скролла
                hashSettings: {
                    location: true, // Хэш в адресной строке
                    goHash: true // Переход по наличию в адресной строке
                },
                on: { // События
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.isOpen = false;
            // Текущее окно
            this.targetOpen = {
                selector: false,
                element: false
            };
            // Предыдущее открытое
            this.previousOpen = {
                selector: false,
                element: false
            };
            // Последнее закрытое
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = Object.assign(config, options);
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.eventsPopup();
        }
        eventsPopup() {
            // Клик на всем документе
            document.addEventListener("click", function(e) {
                // Клик по кнопке "открыть"
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    if ("error" !== this._dataValue) {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    }
                    return;
                }
                // Закрытие на пустом месте (popup__wrapper) и кнопки закрытия (popup__close) для закрытия
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            // Закрытие по ESC
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && 27 == e.which && "Escape" === e.code && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && 9 == e.which && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            // Открытие по хешу
            if (this.options.hashSettings.goHash) {
                // Проверка изменения адресной строки
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                // Если перед открытием попапа был режим lock
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                // Если ввести значение селектора (селектор настраивается в options)
                if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.options.hashSettings.location) {
                        // Получение хэша и его выставление
                        this._getHash();
                        this._setHash();
                    }
                    // До открытия
                    this.options.on.beforeOpen(this);
                    // Создаем свое событие после открытия попапа
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    // Запоминаю это открытое окно. Оно будет последним открытым
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    // После открытия
                    this.options.on.afterOpen(this);
                    // Создаем свое событие после открытия попапа
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                }
            }
        }
        close(selectorValue) {
            if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            // До закрытия
            this.options.on.beforeClose(this);
            // Создаем свое событие перед закрытием попапа
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            // aria-hidden
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            // Очищение адресной строки
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            // После закрытия
            this.options.on.afterClose(this);
            // Создаем свое событие после закрытия попапа
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
        }
        // Получение хэша
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            if (buttons && classInHash) this.open(classInHash);
        }
        // Установка хэша
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && 0 === focusedIndex) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
    }
    // Запускаем и добавляем в объект модулей
    flsModules.popup = new Popup({});

    // Модуль плавной прокрутки к блоку
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options);
        }
    };

    // Валидация форм
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if ("email" === formRequiredItem.dataset.required) {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };

    // Отправка форм
    function formSubmit() {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (0 === error) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) { // Если режим ajax
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        let responseResult = await response.json();
                        form.classList.remove("_sending");
                        formSent(form, responseResult);
                    } else {
                        alert("Ошибка");
                        form.classList.remove("_sending");
                    }
                } else if (form.hasAttribute("data-dev")) { // Если режим разработки
                    e.preventDefault();
                    formSent(form);
                }
            } else {
                e.preventDefault();
                const formError = form.querySelector("._form-error");
                if (formError && form.hasAttribute("data-goto-error")) gotoBlock(formError, true, 1e3);
            }
        }
        // Действия после отправки формы
        function formSent(form, responseResult = ``) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            // Показываем попап, если подключен модуль попапов
            // и для формы указана настройка
            setTimeout((() => {
                if (flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? flsModules.popup.open(popup) : null;
                }
            }), 0);
            // Очищаем форму
            formValidate.formClean(form);
            // Сообщаем в консоль
            formLogging(`Форма отправлена!`);
        }
        function formLogging(message) {
            FLS(`[Формы]: ${message}`);
        }
    }

    // Swiper slider
    // Инициализация слайдеров
    function initSliders() {
        if (document.querySelector(".swiper")) {
            new Swiper(".quality", {
                observer: true,
                observeParents: true,
                slidesPerView: "auto",
                spaceBetween: 0,
                speed: 800,
                // Кнопки "влево/вправо"
                navigation: {
                    prevEl: ".quality-btn-prev",
                    nextEl: ".quality-btn-next"
                }
            });
            new Swiper(".step", {
                observer: true,
                observeParents: true,
                slidesPerView: "auto",
                spaceBetween: 30,
                speed: 800,
                // Кнопки "влево/вправо"
                navigation: {
                    prevEl: ".step-btn-prev",
                    nextEl: ".step-btn-next"
                }
            });
            new Swiper(".blog__slider", {
                observer: true,
                observeParents: true,
                speed: 800,
                // Брейкпоинты
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 30
                    },
                    1469.98: {
                        slidesPerView: 2,
                        spaceBetween: 30
                    }
                },
                // Кнопки "влево/вправо"
                navigation: {
                    prevEl: ".blog-btn-prev",
                    nextEl: ".blog-btn-next"
                }
            });
            new Swiper(".center__slider", {
                observer: true,
                observeParents: true,
                speed: 500,
                loop: true,
                noSwiping: true,
                noSwipingClass: "center__slide",
                // Брейкпоинты
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 10
                    },
                    991.98: {
                        slidesPerView: 2,
                        spaceBetween: 20
                    },
                    1469.98: {
                        slidesPerView: 2,
                        spaceBetween: 30
                    }
                },
                // Кнопки "влево/вправо"
                navigation: {
                    prevEl: ".center-btn-prev",
                    nextEl: ".center-btn-next"
                }
            });
        }
    }
    window.addEventListener("load", (function(e) {
        // Запуск инициализации слайдеров
        initSliders();
    }));

    // Наблюдатель объектов на базе Intersection Observed API
    class ScrollWatcher {
        constructor(props) {
            let defaultConfig = {
                logging: true
            };
            this.config = Object.assign(defaultConfig, props);
            this.observer;
            !document.documentElement.classList.contains("watcher") ? this.scrollWatcherRun() : null;
        }
        // Обновляем конструктор
        scrollWatcherUpdate() {
            this.scrollWatcherRun();
        }
        // Запускаем конструктор
        scrollWatcherRun() {
            document.documentElement.classList.add("watcher");
            this.scrollWatcherConstructor(document.querySelectorAll("[data-watch]"));
        }
        // Конструктор наблюдателей
        scrollWatcherConstructor(items) {
            if (items.length) {
                // Уникализируем параметры
                let uniqParams = uniqArray(Array.from(items).map((function(item) {
                    return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : "0px"}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
                })));
                // Получаем группы объектов с одинаковыми параметрами,
                // создаем настройки, инициализируем наблюдатель
                uniqParams.forEach((uniqParam => {
                    let uniqParamArray = uniqParam.split("|");
                    let paramsWatch = {
                        root: uniqParamArray[0],
                        margin: uniqParamArray[1],
                        threshold: uniqParamArray[2]
                    };
                    let groupItems = Array.from(items).filter((function(item) {
                        let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                        let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : "0px";
                        let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                        if (String(watchRoot) === paramsWatch.root && String(watchMargin) === paramsWatch.margin && String(watchThreshold) === paramsWatch.threshold) return item;
                    }));
                    let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                    // Инициализация наблюдателя со своими настройками
                    this.scrollWatcherInit(groupItems, configWatcher);
                }));
            }
        }
        // Функция создания настроек
        getScrollWatcherConfig(paramsWatch) {
            // Создаем настройки
            let configWatcher = {};
            // Родитель, внутри которого ведется наблюдение
            if (document.querySelector(paramsWatch.root)) configWatcher.root = document.querySelector(paramsWatch.root);
            // Отступ срабатывания
            configWatcher.rootMargin = paramsWatch.margin;
            if (paramsWatch.margin.indexOf("px") < 0 && paramsWatch.margin.indexOf("%") < 0) return;
            // Точки срабатывания
            if ("prx" === paramsWatch.threshold) ; else paramsWatch.threshold = paramsWatch.threshold.split(",");
            configWatcher.threshold = paramsWatch.threshold;
            return configWatcher;
        }
        // Функция создания нового наблюдателя со своими настройками
        scrollWatcherCreate(configWatcher) {
            this.observer = new IntersectionObserver(((entries, observer) => {
                entries.forEach((entry => {
                    this.scrollWatcherCallback(entry, observer);
                }));
            }), configWatcher);
        }
        // Функция инициализации наблюдателя со своими настройками
        scrollWatcherInit(items, configWatcher) {
            // Создание нового наблюдателя со своими настройками
            this.scrollWatcherCreate(configWatcher);
            // Передача наблюдателю элементов
            items.forEach((item => this.observer.observe(item)));
        }
        // Функция обработки базовых действий точек срабатывания
        scrollWatcherIntersecting(entry, targetElement) {
            // Видим объект
            // Добавляем класс
            if (entry.isIntersecting) !targetElement.classList.contains("_watcher-view") ? targetElement.classList.add("_watcher-view") : null;
                // Не видим объект
            // Убираем класс
            else targetElement.classList.contains("_watcher-view") ? targetElement.classList.remove("_watcher-view") : null;
        }
        // Функция отключения слежения за объектом
        scrollWatcherOff(targetElement, observer) {
            observer.unobserve(targetElement);
        }
        // Функция обработки наблюдения
        scrollWatcherCallback(entry, observer) {
            const targetElement = entry.target;
            // Обработка базовых действий точек срабатывания
            this.scrollWatcherIntersecting(entry, targetElement);
            // Если есть атрибут data-watch-once, то убираем слежку
            targetElement.hasAttribute("data-watch-once") && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
            // Создаем свое событие обратной связи
            document.dispatchEvent(new CustomEvent("watcherCallback", {
                detail: {
                    entry
                }
            }));
        }
    }
    // Запускаем и добавляем в объект модулей
    flsModules.watcher = new ScrollWatcher({});

    // Переменная контроля добавления события window scroll.
    let addWindowScrollEvent = false;

    // Работа с шапкой при скроле
    function headerScroll() {
        addWindowScrollEvent = true;
        const header = document.querySelector("header.header");
        const headerShow = header.hasAttribute("data-scroll-show");
        const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
        const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
        let scrollDirection = 0;
        let timer;
        document.addEventListener("windowScroll", (function(e) {
            const scrollTop = window.scrollY;
            clearTimeout(timer);
            if (scrollTop >= startPoint) {
                !header.classList.contains("_header-scroll") ? header.classList.add("_header-scroll") : null;
                if (headerShow) {
                    // downscroll code
                    if (scrollTop > scrollDirection) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
                    // upscroll code
                    else !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    timer = setTimeout((() => {
                        !header.classList.contains("_header-show") ? header.classList.add("_header-show") : null;
                    }), headerShowTimer);
                }
            } else {
                header.classList.contains("_header-scroll") ? header.classList.remove("_header-scroll") : null;
                if (headerShow) header.classList.contains("_header-show") ? header.classList.remove("_header-show") : null;
            }
            scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
        }));
    }
    // При подключении модуля обработчик события запустится автоматически
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);

    // Маска для телефона
    function InputMask(options) {
        this.el = this.getElement(options.selector);
        if (!this.el) return console.log("Что-то не так с селектором");
        this.layout = options.layout || "+_ (___) ___-__-__";
        this.maskreg = this.getRegexp();
        this.setListeners();
    }
    InputMask.prototype.getRegexp = function() {
        var str = this.layout.replace(/_/g, "\\d");
        str = str.replace(/\(/g, "\\(");
        str = str.replace(/\)/g, "\\)");
        str = str.replace(/\+/g, "\\+");
        str = str.replace(/\s/g, "\\s");
        return str;
    };
    InputMask.prototype.mask = function(e) {
        var _this = e.target, matrix = this.layout, i = 0, def = matrix.replace(/\D/g, ""), val = _this.value.replace(/\D/g, "");
        if (def.length >= val.length) val = def;
        _this.value = matrix.replace(/./g, (function(a) {
            return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
        }));
        if ("blur" == e.type) {
            var regexp = new RegExp(this.maskreg);
            if (!regexp.test(_this.value)) _this.value = "";
        } else this.setCursorPosition(_this.value.length, _this);
    };
    InputMask.prototype.setCursorPosition = function(pos, elem) {
        elem.focus();
        if (elem.setSelectionRange) elem.setSelectionRange(pos, pos); else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd("character", pos);
            range.moveStart("character", pos);
            range.select();
        }
    };
    InputMask.prototype.setListeners = function() {
        this.el.addEventListener("input", this.mask.bind(this), false);
        this.el.addEventListener("focus", this.mask.bind(this), false);
        this.el.addEventListener("blur", this.mask.bind(this), false);
    };
    InputMask.prototype.getElement = function(selector) {
        if (void 0 === selector) return false;
        if (this.isElement(selector)) return selector;
        if ("string" == typeof selector) {
            var el = document.querySelector(selector);
            if (this.isElement(el)) return el;
        }
        return false;
    };
    InputMask.prototype.isElement = function(element) {
        return element instanceof Element || element instanceof HTMLDocument;
    };


    window["FLS"] = true;
    addLoadedClass();
    menuInit();
    formSubmit();
    headerScroll();
})();