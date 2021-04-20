import { WS_Context } from './WS_Context';
import { WS_Validator } from './WS_Validator';

type ConfigParams = {
  useJsonWrapper?: boolean;
  isNotEmpty?: string[];
  isInteger?: string[];
  isNumber?: string[];
  isPositive?: string[];
  isMatch?: { [x: string]: (string | number)[] };
  isValid?: { [x: string]: string };
};

const extractFields = (obj: Record<string, unknown>, fields: string[]) => {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < fields.length; i++) {
    out[fields[i]] = obj[fields[i]];
  }
  return out;
};

export function Config({
  useJsonWrapper = false,
  isNotEmpty = [],
  isPositive = [],
  isInteger = [],
  isNumber = [],
  isMatch = {},
  isValid = {},
}: ConfigParams) {
  return function (_target: unknown, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]): unknown {
      const requestArgs = args[0] as { [x: string]: unknown };

      // Use wrapper json
      if (requestArgs.ctx && useJsonWrapper) {
        (requestArgs.ctx as WS_Context).useJsonWrapper = useJsonWrapper;
      }

      // Check empty fields
      WS_Validator.isNotEmpty(extractFields(requestArgs, isNotEmpty));
      WS_Validator.isPositive(extractFields(requestArgs, isPositive));
      WS_Validator.isInteger(extractFields(requestArgs, isInteger));
      WS_Validator.isNumber(extractFields(requestArgs, isNumber));

      // Check matching
      for (const key in isMatch) {
        WS_Validator.isMatch({ [key]: requestArgs[key] }, isMatch[key]);
      }

      // Check valid
      for (const key in isValid) {
        WS_Validator.isValid({ [key]: requestArgs[key] }, isValid[key]);
      }

      // Convert number to number
      for (const key of isPositive) {
        requestArgs[key] = Number.parseFloat(requestArgs[key] as string);
      }
      for (const key of isNumber) {
        requestArgs[key] = Number.parseFloat(requestArgs[key] as string);
      }
      for (const key of isInteger) {
        requestArgs[key] = Number.parseInt(requestArgs[key] as string);
      }

      console.log('wrapped function: before invoking ' + propertyKey);
      const result = originalMethod.apply(this, args);
      console.log('wrapped function: after invoking ' + propertyKey);
      return result;
    };
  };
}
