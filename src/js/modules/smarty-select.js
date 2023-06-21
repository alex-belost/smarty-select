import _ from "lodash";

class SmartySelect {
  constructor(initSelector, config) {
    const self = this;
    self.initSelector = initSelector;
    self.userConfig = config || {};

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
        if (selectedOption) {
          const [index, value] = selectedOption;

          if (!this.selectedOptions) {
            this.selectedOptions = {};
          }

          self._updateSelectedItem(index, value, this);
        } else {
          self._removeSelectedItem(this.selectedOptions);
        }
      },
      get selectedState() {
        return this.selectedOptions
          ? this.selectedOptions
          : (this.selectedOptions = {});
      },
    };

    this.init();
  }

  static getEl(selector, getAll, getIn) {
    try {
      const element = !getIn
        ? document.querySelector(selector)
        : getIn.querySelector(selector);
      const elements = !getIn
        ? document.querySelectorAll(selector)
        : getIn.querySelectorAll(selector);

      if (!element) {
        throw new TypeError(`Your selector, ${selector}, was undefined`);
      } else {
        return getAll ? elements : element;
      }
    } catch (error) {
      console.error(error);
    }
  }

  static defaultParameters() {
    const placeholderText = "Select options...";
    const defaultContainer = "smarty-select";
    const defaultClass = {
      button: `${defaultContainer}__button`,
      placeholder: `${defaultContainer}__placeholder`,
      dropdown: `${defaultContainer}__dropdown`,
      dropdownMenu: `${defaultContainer}__dropdown-menu`,
      option: `${defaultContainer}__option`,
      selectedItem: `${defaultContainer}__selected-item`,
      selectedButton: `${defaultContainer}__selected-button`,
      selectedValue: `${defaultContainer}__selected-value`,
    };

    return {
      defaultContainer,
      defaultClass,
      placeholderText,
    };
  }

  _createElement(tagName, config) {
    const element = document.createElement(tagName);
    const parameters = config || {};

    if (!_.isEmpty(parameters.classes)) {
      _.forEach(parameters.classes, (value) => {
        if (value) {
          element.classList.add(value);
        }
      });
    }

    if (parameters.index) {
      element.setAttribute("data-index", parameters.index);
    }

    if (parameters.html) {
      element.innerHTML = parameters.html;
    }

    if (!_.isEmpty(parameters.attrs)) {
      _.forEach(parameters.attrs, (value, key) => {
        element.setAttribute(key, value);
      });
    }

    if (_.isElement(parameters.appendTo)) {
      parameters.appendTo.appendChild(element);
    }

    return element;
  }

  _createSelectedItem(value) {
    const self = this;
    const { userConfig } = self;
    const defaultParameters = SmartySelect.defaultParameters();
    const { defaultClass } = defaultParameters;

    const container = self._createElement("div", {
      classes: [defaultClass.selectedItem, userConfig.selectedItem],
      html: value,
    });

    container.addEventListener("click", self._closeSelectedAction());

    return container;
  }

  _createSelect() {
    const self = this;
    const { userConfig, configSelect } = self;
    const defaultParameters = SmartySelect.defaultParameters();
    const { defaultContainer, defaultClass } = defaultParameters;

    configSelect.mainParent = _.isElement(self.initSelector)
      ? self.initSelector
      : SmartySelect.getEl(self.initSelector);

    configSelect.mainSelect = SmartySelect.getEl(
      "select",
      false,
      configSelect.mainParent
    );
    configSelect.mainOptions = configSelect.mainSelect.options;
    configSelect.options = [];

    const isMultiple = configSelect.mainSelect.multiple;
    const startIndex = configSelect.mainOptions.selectedIndex;

    function getUserClass(fieldName) {
      const userClasses = userConfig.classes || {};

      return userClasses[fieldName];
    }

    function createOption(html) {
      return self._createElement("li", {
        classes: [defaultClass.option, getUserClass("option")],
        html,
      });
    }

    configSelect.container = self._createElement("div", {
      classes: [defaultContainer, getUserClass("container")],
      attrs: {
        "data-state": "close",
      },
    });

    configSelect.button = self._createElement("div", {
      classes: [defaultClass.button, getUserClass("button")],
      appendTo: configSelect.container,
    });

    configSelect.dropdown = self._createElement("div", {
      classes: [defaultClass.dropdown, getUserClass("dropdown")],
      appendTo: configSelect.container,
    });

    configSelect.dropdownMenu = self._createElement("ul", {
      classes: [defaultClass.dropdownMenu, getUserClass("dropdownMenu")],
      appendTo: configSelect.dropdown,
    });

    _.forEach(configSelect.mainOptions, (mainOption, index) => {
      const mainHTML = mainOption.innerHTML;

      const optionContent = userConfig.hasOwnProperty("optionHTML")
        ? userConfig.optionHTML(mainHTML, index)
        : mainHTML;

      const option = createOption(optionContent);

      if (index === startIndex) {
        option.classList.add("active");
      }

      option.setAttribute("data-value", mainHTML);
      option.setAttribute("data-index", index);

      configSelect.options.push(option);
      configSelect.dropdownMenu.appendChild(option);
    });

    if (isMultiple) {
      configSelect.placeholder = self._createElement("span", {
        classes: [defaultClass.placeholder, getUserClass("placeholder")],
        html: userConfig.placeholderText || defaultParameters.placeholderText,
        appendTo: configSelect.button,
      });
    } else {
      const selectedOption = configSelect.mainOptions[startIndex];

      configSelect.button.innerHTML = selectedOption.innerHTML;
    }

    return configSelect.container;
  }

  _updateSelectedItem(index, value, context) {
    const self = this;
    const { configSelect } = self;
    const hasProperty = context.selectedOptions.hasOwnProperty(index);

    if (hasProperty) {
      const item = context.selectedOptions[index];

      configSelect.button.removeChild(item);
      delete context.selectedOptions[index];
    } else {
      if (_.isEmpty(context.selectedOptions)) {
        configSelect.button.innerHTML = "";
      }

      context.selectedOptions[index] = self._createSelectedItem(value);
      configSelect.button.appendChild(context.selectedOptions[index]);
    }

    if (_.isEmpty(configSelect.selectedState)) {
      configSelect.button.appendChild(configSelect.placeholder);
    }
  }

  _removeSelectedItem(obj) {
    const self = this;
    const { configSelect } = self;

    _.forIn(obj, (value) => {
      value.removeEventListener("click", self._closeSelectedAction());
      configSelect.button.removeChild(value);
    });

    configSelect.button.appendChild(configSelect.placeholder);
  }

  _updateState() {
    const { configSelect } = this;

    const dataState = configSelect.state ? "open" : "close";
    configSelect.container.setAttribute("data-state", dataState);
  }

  _updateActiveOption(optionEvent) {
    const { configSelect } = this;
    const activeOptionIndex = configSelect.options.indexOf(optionEvent);
    const activeOption = configSelect.options[activeOptionIndex];
    const isMultiple = configSelect.mainSelect.multiple;

    if (!isMultiple) {
      _.forEach(configSelect.options, (option) => {
        option.classList.remove("active");
      });
    }

    activeOption.classList.toggle("active");
  }

  _buttonAction() {
    const self = this;
    const { configSelect } = self;

    function buttonEvent() {
      self.configSelect.state = !self.configSelect.state;
    }

    return configSelect.events.hasOwnProperty("buttonAction")
      ? configSelect.events.buttonAction
      : (configSelect.events.buttonAction = buttonEvent);
  }

  _optionAction() {
    const self = this;
    const { configSelect } = self;
    const isMultiple = configSelect.mainSelect.multiple;

    const customChange = new CustomEvent("custom.change", {
      bubbles: true,
      cancelable: true,
    });

    function optionEvent(event) {
      const option = event.currentTarget;
      const value = option.getAttribute("data-value");
      const index = +option.getAttribute("data-index");

      if (configSelect.state) {
        self._updateActiveOption(option);

        if (!isMultiple) {
          configSelect.button.innerHTML = value;
          configSelect.mainOptions.selectedIndex = index;
        } else {
          const mainOption = configSelect.mainOptions[index];

          configSelect.selectedState = [index, value];
          mainOption.selected = !mainOption.selected;
        }
      }

      if (configSelect.mainSelect.onchange && configSelect.state) {
        configSelect.mainSelect.onchange();
      }

      option.dispatchEvent(customChange);
      configSelect.state = false;
    }

    return configSelect.events.hasOwnProperty("optionAction")
      ? configSelect.events.optionAction
      : (configSelect.events.optionAction = optionEvent);
  }

  _changeAction(callback) {
    const { configSelect } = this;

    function changeEvent(event) {
      const option = event.target;

      if (configSelect.state && !configSelect.mainSelect.multiple) {
        callback(option);
      } else {
        const options = Object.values(configSelect.selectedOptions);
        callback(options);
      }
    }

    return configSelect.events.hasOwnProperty("changeAction")
      ? configSelect.events.changeAction
      : (configSelect.events.changeAction = changeEvent);
  }

  _closeSelectedAction() {
    const self = this;
    const { configSelect } = self;

    function closeSelectedEvent(event) {
      const option = event.currentTarget;

      _.forIn(configSelect.selectedOptions, (value, key) => {
        if (option === value) {
          configSelect.mainOptions[key].selected = false;
          configSelect.options[key].classList.remove("active");
          configSelect.selectedState = [key, value];
        }
      });
    }

    return configSelect.events.hasOwnProperty("closeSelectedAction")
      ? configSelect.events.closeSelectedAction
      : (configSelect.events.closeSelectedAction = closeSelectedEvent);
  }

  _outsideAction() {
    const { configSelect } = this;

    function outsideEvent(event) {
      const { target } = event;
      const isContain = configSelect.container.contains(target);

      if (!isContain && configSelect.state) {
        configSelect.state = false;
      } else {
        return false;
      }
    }

    const eventFunc = configSelect.events.hasOwnProperty("outsideAction")
      ? configSelect.events.outsideAction
      : (configSelect.events.outsideAction = outsideEvent);

    document.addEventListener("click", eventFunc);
  }

  init() {
    const self = this;
    const { configSelect } = self;

    if (!configSelect.initialState) {
      configSelect.initialState = true;

      configSelect.createdSelect = configSelect.createdSelect
        ? configSelect.createdSelect
        : (configSelect.createdSelect = self._createSelect());

      configSelect.button.addEventListener("click", self._buttonAction());

      _.forEach(configSelect.options, (option) => {
        option.addEventListener("click", self._optionAction());
      });

      configSelect.mainParent.appendChild(configSelect.createdSelect);

      self._outsideAction();
    }
  }

  destroy() {
    const { configSelect } = this;
    const { buttonAction, optionAction, changeAction, outsideAction } =
      configSelect.events;

    if (configSelect.initialState) {
      document.removeEventListener("click", outsideAction);
      configSelect.button.removeEventListener("click", buttonAction);

      _.forEach(configSelect.options, (option) => {
        option.removeEventListener("click", optionAction);
        option.removeEventListener("custom.change", changeAction);
      });

      configSelect.createdSelect = configSelect.mainParent.removeChild(
        configSelect.createdSelect
      );

      configSelect.initialState = false;
      configSelect.selectedState = false;
    }
  }

  change(callback) {
    const { configSelect } = this;

    configSelect.container.addEventListener(
      "custom.change",
      this._changeAction(callback)
    );
  }
}

export default function(selector, config) {
  return new SmartySelect(selector, config);
}
