import { ErrorType, WS_Error } from '../error/WS_Error';
import { DocumentationGenerator } from '../util/DocumentationGenerator';
import { WS_Context } from './WS_Context';
import { WS_Validator } from './WS_Validator';

export type ConfigParams = {
  useJsonWrapper?: boolean;
  isRequiresAuthorization?: boolean;
  isReturnAccessToken?: boolean;
  isNotEmpty?: string[];
  isInteger?: string[];
  isNumber?: string[];
  isPositive?: string[];
  isMatch?: { [x: string]: (string | number)[] };
  isValid?: { [x: string]: string };
  description?: string;
  examples?: {
    request: Record<string, unknown>;
    response: string | null | number | boolean | Record<string, unknown> | WS_Error;
  }[];
  struct?: Record<string, string>;
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
  isRequiresAuthorization = false,
  isReturnAccessToken = false,
  isNotEmpty = [],
  isPositive = [],
  isInteger = [],
  isNumber = [],
  isMatch = {},
  isValid = {},
  description = '',
  examples = [],
  struct = {},
}: ConfigParams) {
  return function (
    target: { path: string },
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    // Generate documentation
    DocumentationGenerator.add({
      className: target.path,
      method: propertyKey.split('_')[0],
      functionName: propertyKey.split('_').pop() || '',
      isRequiresAuthorization,
      isReturnAccessToken,
      useJsonWrapper,
      description,
      examples,
      isNotEmpty,
      isPositive,
      isInteger,
      isNumber,
      isMatch,
      isValid,
      struct,
    });

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]): unknown {
      const requestArgs = args[0] as { [x: string]: unknown };

      // Use wrapper json
      if (requestArgs.ctx && useJsonWrapper) {
        (requestArgs.ctx as WS_Context).useJsonWrapper = useJsonWrapper;
      }

      // Fill from struct
      for (const key in struct) {
        if (struct[key] === 'string') {
          isNotEmpty.push(key);
        }
        if (struct[key] === 'number') {
          isNumber.push(key);
        }
        if (struct[key] === 'email') {
          isValid[key] = 'email';
        }
        if (struct[key] === 'date') {
          isValid[key] = 'date';
        }
      }

      // Check auth
      if (isRequiresAuthorization && !requestArgs.accessToken) {
        throw new WS_Error(
          ErrorType.ACCESS_DENIED,
          'accessToken',
          'Method requires Authorization header',
        );
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

      // console.log('wrapped function: before invoking ' + propertyKey);
      const result = originalMethod.apply(this, args);
      // console.log('wrapped function: after invoking ' + propertyKey);
      return result;
    };
  };
}
