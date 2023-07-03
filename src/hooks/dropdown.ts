import { createPopper } from "@popperjs/core";

export interface IDropdown {
  readonly element: HTMLElement;
  isOpen: boolean;
}

export function useDropdown(target: HTMLElement, content?: string): IDropdown {
  const props: IDropdown = {
    element: document.createElement("div"),
    isOpen: false,
  };

  props.element.innerHTML = content || "";
  props.element.ariaModal = "true";

  const show = () => {
    document.body.append(props.element);
    createPopper(target, props.element);
  };

  const hide = () => {
    props.element.remove();
  };

  return new Proxy(props, {
    set(target, key: keyof typeof props, value) {
      switch (key) {
        case "isOpen":
          const isOpen = Boolean(value);
          const action = isOpen ? show : hide;

          action();
          break;

        case "element":
          console.warn("element key is readonly property");

          return false;
      }

      return Reflect.set(target, key, value);
    },
  });
}
