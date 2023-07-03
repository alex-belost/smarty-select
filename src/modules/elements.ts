import { Bool } from "./utilities";

export interface IOption {
  value: string;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
  template?: string;
}

export interface ISelect {
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface ISelectOptions<V> {
  readonly name: string | null;
  placeholder: string | null;
  selected: V | V[] | null;
  isOpen: boolean;
  isRequired: boolean;
  isDisabled: boolean;
  isMultiple: boolean;
}

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

export const select = (selectElement: HTMLSelectElement): HTMLElement => {
  const element = document.createElement("div");

  element.classList.add(defaultContainer);
  element.ariaDisabled = Bool.stringify(selectElement.disabled);
  element.ariaMultiSelectable = Bool.stringify(selectElement.multiple);
  element.role = "select";

  return element;
};

export const useSelect = <V>(
  nativeSelect: HTMLSelectElement,
  options: Partial<ISelectOptions<V>>
): {
  select: HTMLElement;
  control: ISelectOptions<V>;
} => {
  const config: ISelectOptions<V> = {
    isMultiple: options.isMultiple || nativeSelect.multiple || false,
    isDisabled: options.isDisabled || nativeSelect.disabled || false,
    isRequired: options.isRequired || nativeSelect.required || false,
    isOpen: options.isOpen || false,
    placeholder: options.placeholder || null,
    selected: options.selected || null,
    name: nativeSelect.name,
  };

  const select = document.createElement("div");
  const configKeys = Object.keys(config) as Array<keyof ISelectOptions<V>>;

  select.role = "select";

  const setAttributes = (key: any, value: any) => {
    switch (key) {
      case "isMultiple":
        select.ariaMultiSelectable = value.toString();
        nativeSelect.multiple = value;

      case "isDisabled":
        select.ariaDisabled = value.toString();
        nativeSelect.disabled = value;

      case "isRequired":
        select.ariaRequired = value.toString();
        nativeSelect.required = value;

      case "isOpen":
        select.ariaExpanded = value.toString();
    }
  };

  configKeys.forEach((key) => {
    setAttributes(key, config[key]);
  });

  const control = new Proxy(config, {
    set(target, key, value): any {
      setAttributes(key, value);

      return Reflect.set(target, key, value);
    },
  });

  return { select, control };
};

export const option = (
  props: IOption = {
    value: "",
    disabled: false,
    selected: false,
    label: "",
  }
): HTMLElement => {
  const element: HTMLElement = document.createElement("div");
  element.classList.add(defaultClass.option);
  element.role = "option";
  element.ariaSelected = props.selected!.toString();
  element.ariaDisabled = props.disabled!.toString();
  element.ariaLabel = props.label!;

  element.dataset.value = props.value;
  element.innerHTML = props.label || "";

  return element;
};
