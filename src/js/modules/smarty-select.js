class SmartySelect {
  constructor(initSelector, config) {
    const _this = this;

    this.initSelector = initSelector;
    this.userConfig = config || {};
    this.configSelect = {
      initialState: false,
      currentState: false,
      createdSelect: undefined,
      events: {},
      set state(state) {
        this.currentState = state;
        _this.updateState();
      },
      get state() {
        return this.currentState;
      },
    };

    this.init();
  }

  static each(array, callback) {
    for (let i = 0; i < array.length; i++) {
      callback(array[i], i);
    }
  }

  static el(selector, all) {
    try {
      const element = document.querySelector(selector);
      const elements = document.querySelectorAll(selector);

      if (!element) {
        throw new SyntaxError(`Your selector, ${selector}, was undefined`);
      } else {
        return all ? elements : element;
      }
    } catch (error) {
      console.error(error);
    }
  }

  static config() {
    const blockName = 'smarty-select';
    const defaultClass = {
      button: `${blockName}__button`,
      dropdown: `${blockName}__dropdown`,
      dropdownMenu: `${blockName}__dropdown-menu`,
      option: `${blockName}__option`,
    };

    return { blockName, defaultClass };
  }

  updateState() {
    const configSelect = this.configSelect;

    const dataState = configSelect.state ? 'open' : 'close';
    configSelect.container.setAttribute('data-state', dataState);
  }

  init() {
    const configSelect = this.configSelect;

    if (!configSelect.initialState) {
      configSelect.initialState = true;
      this.createSelect();
      this.outsideAction();
    }
  }

  toggleState() {
    const configSelect = this.configSelect;

    configSelect.state = !configSelect.state;
  }

  createElement(tagName, config = {}) {
    const element = document.createElement(tagName);

    if (config.classes && config.classes.length) {
      SmartySelect.each(config.classes, (className) => {
        if (className) {
          element.classList.add(className);
        }
      });
    }

    if (config.index) {
      element.setAttribute('data-index', config.index);
    }

    if (config.html) {
      element.innerHTML = config.html;
    }

    if (config.attrs) {
      const keys = Object.keys(config.attrs);

      SmartySelect.each(keys, (key) => {
        element.setAttribute(key, config.attrs[key]);
      });
    }

    if (config.appendTo) {
      config.appendTo.appendChild(element);
    }

    return element;
  }

  setActiveOption(optionEvent) {
    const configSelect = this.configSelect;
    const options = configSelect.options;
    const activeOptionIndex = options.indexOf(optionEvent);
    const activeOption = options[activeOptionIndex];

    SmartySelect.each(options, (option) => {
      option.classList.remove('active');
    });

    activeOption.classList.add('active');
  }

  createSelect() {
    const _this = this;
    const userConfig = this.userConfig;
    const configSelect = this.configSelect;

    configSelect.mainParent = (typeof this.initSelector === 'object')
        ? this.initSelector
        : SmartySelect.el(this.initSelector);
    configSelect.mainSelect = configSelect.mainParent.querySelector('select');
    configSelect.mainOptions = configSelect.mainSelect.options;

    const startIndex = configSelect.mainOptions.selectedIndex;
    const selectedOption = configSelect.mainOptions[startIndex];

    const { blockName, defaultClass } = SmartySelect.config();

    function getUserClass(fieldName) {
      const userClasses = userConfig.classes || {};

      return userClasses.hasOwnProperty(fieldName)
          ? userClasses[fieldName] : '';
    }

    function createOption(html) {
      return _this.createElement('li', {
        classes: [
          defaultClass.option,
          getUserClass('option'),
        ],
        html,
      });
    }

    configSelect.container = this.createElement('div', {
      classes: [
        blockName,
        getUserClass('container'),
      ],
      attrs: {
        'data-state': 'close',
      },
    });

    configSelect.button = this.createElement('button', {
      classes: [
        defaultClass.button,
        getUserClass('button'),
      ],
      html: selectedOption.innerHTML,
      appendTo: configSelect.container,
    });

    configSelect.dropdown = this.createElement('div', {
      classes: [
        defaultClass.dropdown,
        getUserClass('dropdown'),
      ],
      appendTo: configSelect.container,
    });

    configSelect.dropdownMenu = this.createElement('ul', {
      classes: [
        defaultClass.dropdownMenu,
        getUserClass('dropdownMenu'),
      ],
      appendTo: configSelect.dropdown,
    });

    configSelect.options = [];

    SmartySelect.each(configSelect.mainOptions, (mainOption, index) => {
      const mainHTML = mainOption.innerHTML;

      const optionContent = userConfig.hasOwnProperty('optionHTML')
          ? userConfig.optionHTML(mainHTML, index)
          : mainHTML;

      const option = createOption(optionContent);

      if (index === startIndex) {
        option.classList.add('active');
      }

      option.setAttribute('data-value', mainHTML);
      option.setAttribute('data-index', index);
      option.addEventListener('click', this.optionAction());

      configSelect.options.push(option);
      configSelect.dropdownMenu.appendChild(option);
    });

    configSelect.createdSelect = configSelect.container;
    configSelect.createdSelect = configSelect.createdSelect
        ? configSelect.createdSelect
        : configSelect.container;

    configSelect.mainParent.appendChild(configSelect.createdSelect);

    configSelect.button.addEventListener('click', this.buttonAction());
  }

  buttonAction() {
    const _this = this;
    const eventsList = this.configSelect.events;

    function buttonEvent() {
      _this.toggleState();
    }

    return eventsList.hasOwnProperty('buttonAction')
        ? eventsList.buttonAction
        : eventsList.buttonAction = buttonEvent;
  }

  optionAction() {
    const _this = this;
    const configSelect = this.configSelect;
    const eventsList = this.configSelect.events;

    const customChange = new CustomEvent('custom.change', {
      bubbles: true,
      cancelable: true,
    });

    function optionEvent(event) {
      const option = event.currentTarget;
      const value = option.getAttribute('data-value');
      const index = option.getAttribute('data-index');

      if (configSelect.state) {
        _this.setActiveOption(option);
        configSelect.button.innerHTML = value;
        configSelect.mainOptions.selectedIndex = parseInt(index, 10);
      }

      if (configSelect.mainSelect.onchange && configSelect.state) {
        configSelect.mainSelect.onchange();
      }

      option.dispatchEvent(customChange);
      configSelect.state = false;
    }

    return eventsList.hasOwnProperty('optionAction')
        ? eventsList.optionAction
        : eventsList.optionAction = optionEvent;
  }

  changeAction(callback) {
    const configSelect = this.configSelect;
    const eventsList = this.configSelect.events;

    function changeEvent(event) {
      const option = event.target;

      if (configSelect.state) {
        callback(option);
      }
    }

    return eventsList.hasOwnProperty('changeAction')
        ? eventsList.changeAction
        : eventsList.changeAction = changeEvent;
  }

  outsideAction() {
    const configSelect = this.configSelect;
    const eventsList = configSelect.events;

    function oustideEvent(event) {
      const element = event.target;
      const isContain = configSelect.container.contains(element);

      if (!isContain && configSelect.state) {
        configSelect.state = false;
      } else {
        return false;
      }
    }

    const eventFunc = eventsList.hasOwnProperty('outsideAction')
        ? eventsList.outsideAction
        : eventsList.outsideAction = oustideEvent;

    document.addEventListener('click', eventFunc);
  }

  change(callback) {
    const configSelect = this.configSelect;

    configSelect.container.addEventListener('custom.change', this.changeAction(callback));
  }

  destroy() {
    const configSelect = this.configSelect;

    const {
      mainParent,
      createdSelect,
      button,
      options,
    } = configSelect;

    const {
      buttonAction,
      optionAction,
      changeAction,
      outsideAction,
    } = configSelect.events;

    if (configSelect.initialState) {
      document.removeEventListener('click', outsideAction);
      button.removeEventListener('click', buttonAction);

      SmartySelect.each(options, (option) => {
        option.removeEventListener('click', optionAction);
        option.removeEventListener('custom.change', changeAction);
      });

      configSelect.createdSelect = mainParent.removeChild(createdSelect);

      configSelect.initialState = false;
    }
  }
}

export default function (selector, config) {
  return new SmartySelect(selector, config);
}