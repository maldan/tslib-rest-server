import { WS_Context } from './WS_Context';
import { WS_Validator } from './WS_Validator';

type ConfigParams = {
  useJsonWrapper?: boolean;
  isNotEmpty?: string[];
  isInteger?: string[];
  isNumber?: string[];
  isPositive?: string[];
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

      console.log('wrapped function: before invoking ' + propertyKey);
      const result = originalMethod.apply(this, args);
      console.log('wrapped function: after invoking ' + propertyKey);
      return result;
    };
  };
}
