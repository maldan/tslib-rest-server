export class WS_Error extends Error {
  public code: number;
  public type: string;
  public value: string;
  public description: string;

  constructor(type: string, value: string, description: string, code: number = 500) {
    super(description);

    this.type = type || '';
    this.value = value || '';
    this.description = description || '';
    this.code = code || 500;
  }

  toJSON(): unknown {
    return {
      type: this.type,
      value: this.value,
      description: this.description,
    };
  }
}

export const ErrorType = {
  EMPTY_FIELD: 'emptyField',
  TYPE_MISMATCH: 'typeMismatch',
  VALUE_MISMATCH: 'valueMismatch',
  OUT_OF_RANGE: 'outOfRange',
  INVALID: 'invalid',
  ACCESS_DENIED: 'accessDenied',
  NOT_FOUND: 'notFound',
  EXTERNAL_API: 'externalApi',
};
