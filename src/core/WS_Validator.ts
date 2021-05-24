import { WS_Error } from '../error/WS_Error';

export class WS_Validator {
  static isNotEmpty(args: { [x: string]: any }): void {
    for (const key in args) {
      let argsList = args[key];
      let isArray = true;
      if (!Array.isArray(argsList)) {
        argsList = [argsList];
        isArray = false;
      }

      for (let i = 0; i < argsList.length; i++) {
        if (isArray) {
          if (argsList[i] === undefined || argsList[i] === null || argsList[i] === '') {
            throw new WS_Error(
              'emptyField',
              key,
              `An array field "${key}" can't have empty value at position ${i}!`,
            );
          }
        } else {
          if (argsList[i] === undefined || argsList[i] === null || argsList[i] === '') {
            throw new WS_Error('emptyField', key, `Field "${key}" is required!`);
          }
        }
      }
    }
  }

  /*static isInteger(args: { [x: string]: any }): void {
    for (const key in args) {
      const arg = args[key];

      if (arg.toString().match(/^\d+$/) === false) {
        throw new WS_Error('typeMismatch', key, `Field "${key}" is not integer!`);
      }
    }
  }*/

  static isString(args: { [x: string]: any }): void {
    for (const key in args) {
      let argsList = args[key];
      let isArray = true;
      if (!Array.isArray(argsList)) {
        argsList = [argsList];
        isArray = false;
      }

      for (let i = 0; i < argsList.length; i++) {
        if (isArray) {
          if (typeof argsList[i] !== 'string') {
            throw new WS_Error(
              'typeMismatch',
              key,
              `An array field "${key}" contains not a string at position ${i}!`,
            );
          }
        } else {
          if (typeof argsList[i] !== 'string') {
            throw new WS_Error('typeMismatch', key, `Field "${key}" is not a string!`);
          }
        }
      }
    }
  }

  static isNumber(args: { [x: string]: any }): void {
    for (const key in args) {
      let argsList = args[key];
      let isArray = true;
      if (!Array.isArray(argsList)) {
        argsList = [argsList];
        isArray = false;
      }

      for (let i = 0; i < argsList.length; i++) {
        if (isArray) {
          if (Number.isNaN(Number.parseFloat(argsList[i]))) {
            throw new WS_Error(
              'typeMismatch',
              key,
              `An array field "${key}" contains not a number at position ${i}!`,
            );
          }
        } else {
          if (Number.isNaN(Number.parseFloat(argsList[i]))) {
            throw new WS_Error('typeMismatch', key, `Field "${key}" is not a number!`);
          }
        }
      }
    }
  }

  static isBoolean(args: { [x: string]: any }): void {
    for (const key in args) {
      let argsList = args[key];
      let isArray = true;
      if (!Array.isArray(argsList)) {
        argsList = [argsList];
        isArray = false;
      }

      for (let i = 0; i < argsList.length; i++) {
        if (isArray) {
          if (
            !(
              argsList[i] === 'true' ||
              argsList[i] === 'false' ||
              argsList[i] === true ||
              argsList[i] === false
            )
          ) {
            throw new WS_Error(
              'typeMismatch',
              key,
              `An array field "${key}" contains not a boolean at position ${i}!`,
            );
          }
        } else {
          if (
            !(
              argsList[i] === 'true' ||
              argsList[i] === 'false' ||
              argsList[i] === true ||
              argsList[i] === false
            )
          ) {
            throw new WS_Error('typeMismatch', key, `Field "${key}" is not a boolean!`);
          }
        }
      }
    }
  }

  /* static inRange(args: { [x: string]: any }, min: number, max: number): void {
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
  }*/

  static isValid(kv: { [x: string]: any }, type: string): void {
    if (type === 'email') {
      for (const key in kv) {
        let args = kv[key];
        let isArray = true;
        if (!Array.isArray(args)) {
          args = [args];
          isArray = false;
        }

        for (let i = 0; i < args.length; i++) {
          const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          if (typeof args[i] !== 'string') {
            throw new WS_Error(
              'invalid',
              key,
              `Field "${key}" must contain a string or array of strings!`,
            );
          }

          if (!re.test(args[i].toLowerCase())) {
            if (isArray) {
              throw new WS_Error(
                'invalid',
                key,
                `An array field "${key}" must contain a valid email at position ${i}!`,
              );
            } else {
              throw new WS_Error('invalid', key, `Field "${key}" must contain a valid email!`);
            }
          }
        }
      }
    }

    if (type === 'date') {
      for (const key in kv) {
        let args = kv[key];
        let isArray = true;
        if (!Array.isArray(args)) {
          args = [args];
          isArray = false;
        }

        for (let i = 0; i < args.length; i++) {
          if (args[i] instanceof Date) {
            continue;
          }

          if (new Date(args[i]).toString() === 'Invalid Date') {
            if (isArray) {
              throw new WS_Error(
                'invalid',
                key,
                `An array field "${key}" must contain a valid (YYYY-MM-DD) date at position ${i}!`,
              );
            } else {
              throw new WS_Error(
                'invalid',
                key,
                `Field "${key}" must contain a valid (YYYY-MM-DD) date!`,
              );
            }
          }
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
