export class WS_Error extends Error {
  public code: number;
  public type: string;
  public value: string;
  public description: string;

  constructor(type: string, value: string, description: string, code: number = 500) {
    super(description);

    this.type = type;
    this.value = value;
    this.description = description;
    this.code = code;
  }

  toJSON() {
    return {
      type: this.type,
      value: this.value,
      description: this.description,
    };
  }
}
