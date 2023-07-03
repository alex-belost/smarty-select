export class Bool {
  public static stringify(value: boolean): string {
    return `${value}`;
  }

  public static parse(value: string): boolean {
    return "true" === value;
  }
}
