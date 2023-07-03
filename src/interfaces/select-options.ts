export interface ISelectOptions {
  isMultiple?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  optionTemplate?: <T extends any>(data: T) => string;
}
