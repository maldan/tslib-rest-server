import { WS_Error } from '../error/WS_Error';

export class WS_Validator {
  static isNotEmpty(args: { [x: string]: any }): void {
    for (const key in args) {
      const arg = args[key];

      if (arg === undefined || arg === null || arg === '') {
        throw new WS_Error('emptyField', key, `Field "${key}" is required!`);
      }
    }
  }

  static isInteger(args: { [x: string]: any }): void {
    for (const key in args) {
      const arg = args[key];

      if (arg.toString().match(/^\d+$/) === false) {
        throw new WS_Error('typeMismatch', key, `Field "${key}" is not integer!`);
      }
    }
  }

  static isNumber(args: { [x: string]: any }): void {
    for (const key in args) {
      const arg = args[key];

      if (Number.isNaN(Number.parseFloat(arg))) {
        throw new WS_Error('typeMismatch', key, `Field "${key}" is not a number!`);
      }
    }
  }

  static inRange(args: { [x: string]: any }, min: number, max: number): void {
    this.isNumber(args);

    for (const key in args) {
      const arg = args[key];

      if (!(arg >= min && arg <= max)) {
        throw new WS_Error('outOfRange', key, `Field "${key}" must be >= ${min} and <= ${max}!`);
      }
    }
  }

  static isPositive(args: { [x: string]: any }): void {
    this.isNumber(args);

    for (const key in args) {
      const arg = args[key];

      if (!(arg >= 0)) {
        throw new WS_Error('outOfRange', key, `Field "${key}" must be greater then 0!`);
      }
    }
  }

  static isValid(kv: { [x: string]: any }, type: string): void {
    if (type === 'email') {
      for (const key in kv) {
        const arg = kv[key];

        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(arg.toLowerCase())) {
          throw new WS_Error('invalid', key, `Field "${key}" must contain a valid email!`);
        }
      }
    }

    if (type === 'date') {
      for (const key in kv) {
        const arg = kv[key];

        if (arg instanceof Date) {
          continue;
        }

        if (new Date(arg).toString() === 'Invalid Date') {
          throw new WS_Error(
            'invalid',
            key,
            `Field "${key}" must contain a valid (YYYY-MM-DD) date!`,
          );
        }
      }
    }
  }

  static isMatch(kv: { [x: string]: any }, values: (string | number)[]): void {
    for (const key in kv) {
      const arg = kv[key];

      if (!values.includes(arg)) {
        throw new WS_Error(
          'valueMismatch',
          key,
          `Field "${key}" must be equal one of this values ${values}!`,
        );
      }
    }
  }
}
