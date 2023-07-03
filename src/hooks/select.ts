import { classNames } from "../constants";

export interface ISelectOptions<ValueType> {
  readonly name: string | null;
  placeholder: string | null;
  selected: ValueType | ValueType[] | null;
  isOpen: boolean;
  isRequired: boolean;
  isDisabled: boolean;
  isMultiple: boolean;
}

type TOptionKey<ValueType> = keyof ISelectOptions<ValueType>;

export function useSelect<ValueType = string>(
  nativeSelect: HTMLSelectElement,
  options?: Partial<ISelectOptions<ValueType>>
): {
  element: HTMLElement;
  control: ISelectOptions<ValueType>;
} {
  const bufferOptions: ISelectOptions<ValueType> = {
    isMultiple: options?.isMultiple || nativeSelect.multiple || false,
    isDisabled: options?.isDisabled || nativeSelect.disabled || false,
    isRequired: options?.isRequired || nativeSelect.required || false,
    isOpen: options?.isOpen || false,
    placeholder: options?.placeholder || null,
    selected: options?.selected || null,
    name: options?.name || nativeSelect.name || "",
  };

  const container = document.createElement("div");
  const button = document.createElement("button");
  const values = document.createElement("span");
  const arrow = document.createElement("span");
  const configKeys: TOptionKey<ValueType>[] = Object.keys(
    bufferOptions
  ) as TOptionKey<ValueType>[];

  container.role = "select";
  button.type = "button";

  container.classList.add(classNames.container);
  button.classList.add(classNames.button);
  values.classList.add(classNames.values);
  arrow.classList.add(classNames.arrow);

  arrow.innerHTML = "&#10095;";

  button.append(...[values, arrow]);
  container.append(button);

  const setAttributes = (key: TOptionKey<ValueType>, value: any) => {
    const valueStringify = value && value.toString();

    switch (key) {
      case "isMultiple":
        container.ariaMultiSelectable = valueStringify;
        nativeSelect.multiple = value;

      case "isDisabled":
        container.ariaDisabled = valueStringify;
        nativeSelect.disabled = value;

      case "isRequired":
        container.ariaRequired = valueStringify;
        nativeSelect.required = value;

      case "placeholder":
        button.ariaPlaceholder = valueStringify;

      case "isOpen":
        container.ariaExpanded = valueStringify;
    }
  };

  configKeys.forEach((key) => {
    setAttributes(key, bufferOptions[key]);
  });

  const control = new Proxy(bufferOptions, {
    set(target, key: TOptionKey<ValueType>, value) {
      setAttributes(key, value);

      return Reflect.set(target, key, value);
    },
  });

  return { element: container, control };
}
