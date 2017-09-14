class SmartySelect {
  constructor(initSelector, config) {
    const self = this;
    self.initSelector = initSelector;
    self.userConfig = config || {};

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

  static defaultParameters() {
    const blockName = 'smarty-select';
    const defaultClass = {
      button: `${blockName}__button`,
      dropdown: `${blockName}__dropdown`,
      dropdownMenu: `${blockName}__dropdown-menu`,
      option: `${blockName}__option`,
      selectedItem: `${blockName}__selected-item`,
      selectedButton: `${blockName}__selected-button`,
      selectedValue: `${blockName}__selected--value`,
    };

    return {
      blockName,
      defaultClass,
      placeholder: 'Select options...',
    };
  }

  _createElement(tagName, config) {
    const element = document.createElement(tagName);
    const parameters = config || {};

    if (parameters.classes && parameters.classes.length) {
      SmartySelect.each(config.classes, (className) => {
        if (className) {
          element.classList.add(className);
        }
      });
    }

    if (parameters.index) {
      element.setAttribute('data-index', parameters.index);
    }

    if (parameters.html) {
      element.innerHTML = parameters.html;
    }

    if (parameters.attrs) {
      const keys = Object.keys(parameters.attrs);

      SmartySelect.each(keys, (key) => {
        element.setAttribute(key, parameters.attrs[key]);
      });
    }

    if (parameters.appendTo) {
      parameters.appendTo.appendChild(element);
    }

    return element;
  }

  _createSelectedItem(value) {
    const self = this;
    const defaultParameters = SmartySelect.defaultParameters();
    const {defaultClass} = defaultParameters;

    const container = self._createElement('div', {
      classes: [
        defaultClass.selectedItem,
      ]
    })
  }

  _createSelect() {
    const self = this;
    const userConfig = self.userConfig;
    const configSelect = self.configSelect;

    const defaultParameters = SmartySelect.defaultParameters();
    const { blockName, defaultClass } = defaultParameters;
    const placeholder = userConfig.placeholder || defaultParameters.placeholder;

    configSelect.mainParent = (typeof self.initSelector === 'object')
        ? self.initSelector
        : SmartySelect.el(self.initSelector);

    configSelect.mainSelect = configSelect.mainParent.querySelector('select');
    configSelect.mainOptions = configSelect.mainSelect.options;

    const isMultiple = configSelect.mainSelect.multiple;
    const startIndex = configSelect.mainOptions.selectedIndex;
    const selectedOption = configSelect.mainOptions[startIndex];

    function getUserClass(fieldName) {
      const userClasses = userConfig.classes || {};

      return userClasses.hasOwnProperty(fieldName)
          ? userClasses[fieldName] : '';
    }

    function createOption(html) {
      return self._createElement('li', {
        classes: [
          defaultClass.option,
          getUserClass('option'),
        ],
        html,
      });
    }

    configSelect.container = self._createElement('div', {
      classes: [
        blockName,
        getUserClass('container'),
      ],
      attrs: {
        'data-state': 'close',
      },
    });

    configSelect.button = self._createElement('div', {
      classes: [
        defaultClass.button,
        getUserClass('button'),
      ],
      html: !isMultiple ? selectedOption.innerHTML : placeholder,
      appendTo: configSelect.container,
    });

    configSelect.dropdown = self._createElement('div', {
      classes: [
        defaultClass.dropdown,
        getUserClass('dropdown'),
      ],
      appendTo: configSelect.container,
    });

    configSelect.dropdownMenu = self._createElement('ul', {
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
      option.addEventListener('click', self._optionAction());

      configSelect.options.push(option);
      configSelect.dropdownMenu.appendChild(option);
    });

    configSelect.createdSelect = configSelect.container;
    configSelect.createdSelect = configSelect.createdSelect
        ? configSelect.createdSelect
        : configSelect.container;

    configSelect.mainParent.appendChild(configSelect.createdSelect);

    configSelect.button.addEventListener('click', self._buttonAction());
  }

  _updateState() {
    const configSelect = this.configSelect;

    const dataState = configSelect.state ? 'open' : 'close';
    configSelect.container.setAttribute('data-state', dataState);
  }

  _toggleState() {
    const configSelect = this.configSelect;

    configSelect.state = !configSelect.state;
  }

  _setActiveOption(optionEvent) {
    const configSelect = this.configSelect;
    const options = configSelect.options;
    const activeOptionIndex = options.indexOf(optionEvent);
    const activeOption = options[activeOptionIndex];
    const isMultiple = configSelect.mainSelect.multiple;

    if (!isMultiple) {
      SmartySelect.each(options, (option) => {
        option.classList.remove('active');
      });
    }

    activeOption.classList.toggle('active');
  }

  _setMultipleValue(value, index, isSelected) {
    const self = this;
    const configSelect = self.configSelect;
    const userConfig = self.userConfig;
    const defaultParameters = SmartySelect.defaultParameters();

    const placeholder = userConfig.placeholder || defaultParameters.placeholder;
    const isEmpty = configSelect.selectedState.keys().length < 0;

    if (isEmpty) {
      configSelect.button.innerHTML = placeholder;
    } else {

    }

    console.log(configSelect.selectedState);

  }

  _buttonAction() {
    const self = this;
    const eventsList = self.configSelect.events;

    function buttonEvent() {
      self._toggleState();
    }

    return eventsList.hasOwnProperty('buttonAction')
        ? eventsList.buttonAction
        : eventsList.buttonAction = buttonEvent;
  }

  _optionAction() {
    const self = this;
    const configSelect = self.configSelect;
    const eventsList = self.configSelect.events;
    const isMultiple = self.configSelect.mainSelect.multiple;

    const customChange = new CustomEvent('custom.change', {
      bubbles: true,
      cancelable: true,
    });

    function optionEvent(event) {
      const option = event.currentTarget;
      const value = option.getAttribute('data-value');
      const index = +option.getAttribute('data-index');

      if (configSelect.state) {
        self._setActiveOption(option);

        if (!isMultiple) {
          configSelect.button.innerHTML = value;
          configSelect.mainOptions.selectedIndex = index;
        } else {
          const mainOption = configSelect.mainOptions[index];

          mainOption.selected = !mainOption.selected;
          self._setMultipleValue(value, index, mainOption.selected);
        }
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

  _changeAction(callback) {
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

  _outsideAction() {
    const configSelect = this.configSelect;
    const eventsList = configSelect.events;

    function outsideEvent(event) {
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
        : eventsList.outsideAction = outsideEvent;

    document.addEventListener('click', eventFunc);
  }

  init() {
    const self = this;

    self.configSelect = {
      initialState: false,
      currentState: false,
      events: {},

      set state(state) {
        this.currentState = state;
        self._updateState();
      },
      get state() {
        return this.currentState;
      },

      set selectedState(selectedOption) {
        if (this.selectedOptions) {
          this.selectedOptions = {};
        }

        this.selectedOptions[selectedOption.index] = selectedOption.value;
      },
      get selectedState() {
        return this.selectedOptions || {};
      }
    };

    if (!self.configSelect.initialState) {
      self.configSelect.initialState = true;

      this._createSelect();
      this._outsideAction();
    }
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

  change(callback) {
    const configSelect = this.configSelect;

    configSelect.container.addEventListener('custom.change', this._changeAction(callback));
  }
}

export default function (selector, config) {
  return new SmartySelect(selector, config);
}