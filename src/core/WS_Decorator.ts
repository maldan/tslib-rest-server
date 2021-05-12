import { ErrorType, WS_Error } from '../error/WS_Error';
import { DocumentationGenerator } from '../util/DocumentationGenerator';
import { WS_Context } from './WS_Context';
import { WS_Validator } from './WS_Validator';

export type ConfigParams = {
  useJsonWrapper?: boolean;
  isRequiresAuthorization?: boolean;
  isReturnAccessToken?: boolean;
  // isNotEmpty?: string[];
  // isInteger?: string[];
  // isNumber?: string[];
  // isPositive?: string[];
  // isMatch?: { [x: string]: (string | number)[] };
  // isValid?: { [x: string]: string };
  description?: string;
  examples?: {
    request: Record<string, unknown>;
    response: string | null | number | boolean | Record<string, unknown> | WS_Error;
  }[];
  struct?: Record<string, string>;
  contentType?: string;
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
  // isNotEmpty = [],
  // isPositive = [],
  // isInteger = [],
  // isNumber = [],
  // isMatch = {},
  // isValid = {},
  description = '',
  examples = [],
  struct = {},
  contentType = undefined,
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
      /*isNotEmpty,
      isPositive,
      isInteger,
      isNumber,
      isMatch,
      isValid,*/
      struct,
    });

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: unknown[]): unknown {
      const requestArgs = args[0] as Record<string, unknown>;
      const isNotEmpty = [] as string[];
      const isPositive = [] as string[];
      const isInteger = [] as string[];
      const isNumber = [] as string[];
      const isMatch: Record<string, (string | number)[]> = {};
      const isValid: Record<string, string> = {};

      // Use wrapper json
      if (requestArgs.ctx && useJsonWrapper) {
        (requestArgs.ctx as WS_Context).useJsonWrapper = useJsonWrapper;
      }
      if (requestArgs.ctx && contentType) {
        (requestArgs.ctx as WS_Context).contentType = contentType;
      }

      // Fill from struct
      for (const key in struct) {
        // String params
        if (struct[key] === 'string') {
          isNotEmpty.push(key);
        }
        if (struct[key] === 'string?') {
          if (requestArgs[key]) {
            isNotEmpty.push(key);
          } else {
            requestArgs[key] = '';
          }
        }

        // Number params
        if (struct[key] === 'number') {
          requestArgs[key] = Number(requestArgs[key]);
          isNumber.push(key);
        }
        if (struct[key] === 'number?') {
          if (requestArgs[key] !== null && requestArgs[key] !== undefined) {
            requestArgs[key] = Number(requestArgs[key]);
            isNumber.push(key);
          } else {
            requestArgs[key] = 0;
          }
        }

        // Emails
        if (struct[key] === 'email') {
          isValid[key] = 'email';
        }
        if (struct[key] === 'email?') {
          if (requestArgs[key]) {
            isValid[key] = 'email';
          } else {
            requestArgs[key] = '';
          }
        }

        // Date
        if (struct[key] === 'date') {
          requestArgs[key] = new Date(requestArgs[key] as string);
          isValid[key] = 'date';
        }
        if (struct[key] === 'date?') {
          if (requestArgs[key]) {
            requestArgs[key] = new Date(requestArgs[key] as string);
            isValid[key] = 'date';
          } else {
            requestArgs[key] = null;
          }
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
