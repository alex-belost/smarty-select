import { ISelectOptions } from "../interfaces";

export interface SelectItem<T> {
  readonly element: HTMLElement;
  readonly data: T;
  isSelected: boolean;
  isDisabled: boolean;
}

const createSelectItem = <T extends any>(
  data: T,
  options: ISelectOptions
): SelectItem<T> => {
  const element: HTMLElement = document.createElement("div");

  const props = {
    isSelected: false,
    isDisabled: false,
    element,
    data,
  };
  const availableDefaultTypes = ["string", "number"];

  if (!options.optionTemplate && availableDefaultTypes.includes(typeof data)) {
    throw new Error("Wrong option template rendering");
  }

  element.role = "option";
  element.ariaSelected = String(props.isSelected);
  element.ariaDisabled = String(props.isDisabled);

  element.innerHTML = options.optionTemplate
    ? options.optionTemplate(data)
    : String(data);

  return new Proxy(props, {
    set(target, key: keyof SelectItem<T>, value) {
      switch (key) {
        case "isSelected":
          element.ariaSelected = String(value);
          break;

        case "isDisabled":
          element.ariaDisabled = String(value);
          break;

        case "element":
          console.warn("element key is readonly property");
          return false;

        case "data":
          console.warn("data key is readonly property");
          return false;
      }

      return Reflect.set(target, key, value);
    },
  });
};

export function useSelectItems<T extends any>(
  dataset: T[],
  options: ISelectOptions
): SelectItem<T>[] {
  return dataset.map((data) => createSelectItem(data, options));
}
