import { useSelect } from "./hooks/select";
import { useDropdown } from "./hooks/dropdown";
import { useSelectItems } from "./hooks/select-items";
import { ISelectOptions } from "./interfaces";

const selectItemsMock: string[] = [
  "134",
  "823471972",
  "93487",
  "04994904",
  "ttutuituituut",
  "ad-jfajl;sdf",
  "13412341",
];

export function createSelect<T extends object | string | number>(
  data: T[],
  options: ISelectOptions = {
    isDisabled: false,
    isRequired: false,
    isMultiple: false,
    optionTemplate: (data) => data as string,
  }
): void {
  const container = document.getElementById("container");

  const items = useSelectItems(data, options);
  const dropdown = useDropdown(container!);

  dropdown.element.append(...items.map((item) => item.element));

  container?.addEventListener("click", () => {
    dropdown.isOpen = !dropdown.isOpen;
  });

  console.log(items);
}

document.addEventListener("DOMContentLoaded", () => {
  const nativeSelect: HTMLSelectElement | null =
    document.querySelector("#select");

  if (!nativeSelect) {
    return;
  }

  const testDropdown = document.createElement("div");
  testDropdown.innerHTML = "test";

  const select = useSelect<string>(nativeSelect, {
    placeholder: "Make a selection",
  });
  // const dropdown = useDropdown(select.element);
  const selectInstance = createSelect<string>(selectItemsMock);

  console.log(selectInstance);

  // select.element.addEventListener("click", () => {
  //   select.control.isOpen = !select.control.isOpen;
  //   dropdown.control.isOpen = select.control.isOpen;
  // });

  document.body.append(select.element);
});
