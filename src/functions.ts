export function validateArgs(
  args: Array<() => unknown>,
  validations: { min?: number; max?: number }
) {
  const { min, max } = validations;
  if (typeof min === 'number' && args.length < min)
    throw new Error(`Not enough arguments ${args.length}/${min}`);
  if (typeof max === 'number' && args.length > max)
    throw new Error(`Too many arguments ${args.length}/${max}`);
  return args;
}
function computeArg(value: unknown) {
  if (typeof value === 'function') {
    return value();
  }
  throw new Error('Argument is invalid');
}

const isBlank = (value: unknown) => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')
  );
};
const blankvalue = (...args: Array<() => unknown>) => {
  validateArgs(args, { min: 2 });
  let i = 0;
  do {
    const arg = args[i];
    if (!arg) return undefined;
    const value = computeArg(arg);
    if (!isBlank(value)) return value;
    i++;
    // eslint-disable-next-line no-constant-condition
  } while (true);
};
export const defaultFunctions: Record<
  string,
  (...args: Array<() => unknown>) => unknown
> = {
  ISBLANK: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    return isBlank(value);
  },
  NOT: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'boolean')
      throw new Error('Argument should be a boolean');
    return !value;
  },
  BLANKVALUE: blankvalue,
  NULLVALUE: (...args: Array<() => unknown>) => {
    const [exprArg, substituteExprArg] = validateArgs(args, { min: 2, max: 2 });
    const expr = computeArg(exprArg);
    if (expr === null || expr === undefined) {
      return computeArg(substituteExprArg);
    }
    return expr;
  },
  TEXT: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument should be a number');
    return value.toString();
  },
  FLOOR: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument should be a number');
    return Math.floor(value);
  },
  CEILING: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument should be a number');
    return Math.ceil(value);
  },
  LEN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'string') return value.length;

    throw new Error('Argument should be a string or a list');
  },
  IF: (...args: Array<() => unknown>) => {
    const [ifArg, thenArg, elseArg] = validateArgs(args, { min: 2, max: 3 });
    const ifValue = computeArg(ifArg);
    if (typeof ifValue !== 'boolean')
      throw new Error('First argument is not a boolean');
    if (ifValue) {
      return computeArg(thenArg);
    }
    if (elseArg) {
      return computeArg(elseArg);
    }
    return undefined;
  },
  ISNUMBER: (...args: Array<() => unknown>) => {
    const [valueArg] = validateArgs(args, { min: 1, max: 1 });
    const value = computeArg(valueArg);

    if (typeof value === 'number') {
      return isFinite(value);
    }
    if (typeof value === 'string') {
      if (value.trim() === '') {
        // Salesforce ISNUMBER considers blank string not a number
        return false;
      }
      // Number(value) correctly handles strings with surrounding whitespace like " 123 "
      // and returns NaN for non-numeric strings like "abc" or "1,234" or "12.3.4"
      const num = Number(value);
      return !isNaN(num) && isFinite(num);
    }
    // Booleans, objects, null, undefined are not numbers for ISNUMBER
    return false;
  },
  ISNULL: (...args: Array<() => unknown>) => {
    const [exprArg] = validateArgs(args, { min: 1, max: 1 });
    const expr = computeArg(exprArg);
    return expr === null || expr === undefined;
  },
  CASE: (...args: Array<() => unknown>) => {
    validateArgs(args, { min: 3 });

    const value = computeArg(args[0]);
    const numRemainingArgs = args.length - 1;

    // Iterate through value/result pairs
    // Each pair consists of 2 arguments.
    // If numRemainingArgs is odd, the last one is the else_result.
    const numPairs = Math.floor(numRemainingArgs / 2);

    for (let i = 0; i < numPairs; i++) {
      const valueN = computeArg(args[1 + i * 2]);
      if (value === valueN) {
        return computeArg(args[1 + i * 2 + 1]);
      }
    }

    // Check for else_result: if there's an odd number of arguments after the expression
    if (numRemainingArgs % 2 !== 0) {
      return computeArg(args[args.length - 1]);
    }

    return null;
  },
  ABS: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of ABS must be a number');
    return Math.abs(value);
  },
  ACOS: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of ACOS must be a number');
    if (value < -1 || value > 1) return null;
    return Math.acos(value);
  },
  ASIN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of ASIN must be a number');
    if (value < -1 || value > 1) return null;
    return Math.asin(value);
  },
  ATAN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of ATAN must be a number');
    return Math.atan(value);
  },
  ATAN2: (...args: Array<() => unknown>) => {
    const [yArg, xArg] = validateArgs(args, { min: 2, max: 2 });
    const y = computeArg(yArg);
    const x = computeArg(xArg);
    if (typeof y !== 'number')
      throw new Error('Argument 1 of ATAN2 must be a number');
    if (typeof x !== 'number')
      throw new Error('Argument 2 of ATAN2 must be a number');
    return Math.atan2(y, x);
  },
  COS: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of COS must be a number');
    return Math.cos(value);
  },
  EXP: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of EXP must be a number');
    return Math.exp(value);
  },
  LN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of LN must be a number');
    if (value <= 0)
      throw new Error('Argument 1 of LN must be a positive number');
    return Math.log(value);
  },
  LOG: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of LOG must be a number');
    if (value <= 0)
      throw new Error('Argument 1 of LOG must be a positive number');
    return Math.log10(value);
  },
  MAX: (...args: Array<() => unknown>) => {
    validateArgs(args, { min: 1 });
    const values = args.map((arg, i) => {
      const value = computeArg(arg);
      if (typeof value !== 'number')
        throw new Error(`Argument ${i + 1} of MAX must be a number`);
      return value;
    });
    return Math.max(...values);
  },
  MCEILING: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of MCEILING must be a number');
    return Math.ceil(value);
  },
  MFLOOR: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of MFLOOR must be a number');
    return Math.floor(value);
  },
  MIN: (...args: Array<() => unknown>) => {
    validateArgs(args, { min: 1 });
    const values = args.map((arg, i) => {
      const value = computeArg(arg);
      if (typeof value !== 'number')
        throw new Error(`Argument ${i + 1} of MIN must be a number`);
      return value;
    });
    return Math.min(...values);
  },
  MOD: (...args: Array<() => unknown>) => {
    const [numberArg, divisorArg] = validateArgs(args, { min: 2, max: 2 });
    const number = computeArg(numberArg);
    const divisor = computeArg(divisorArg);
    if (typeof number !== 'number')
      throw new Error('Argument 1 of MOD must be a number');
    if (typeof divisor !== 'number')
      throw new Error('Argument 2 of MOD must be a number');
    if (divisor === 0) throw new Error('Argument 2 of MOD cannot be zero');
    return number % divisor;
  },
  PI: (...args: Array<() => unknown>) => {
    validateArgs(args, { min: 0, max: 0 });
    return Math.PI;
  },
  ROUND: (...args: Array<() => unknown>) => {
    const [numberArg, numDigitsArg] = validateArgs(args, { min: 2, max: 2 });
    const number = computeArg(numberArg);
    const num_digits = computeArg(numDigitsArg);
    if (typeof number !== 'number')
      throw new Error('Argument 1 of ROUND must be a number');
    if (typeof num_digits !== 'number')
      throw new Error('Argument 2 of ROUND must be a number');
    if (!Number.isInteger(num_digits))
      throw new Error('Argument 2 of ROUND must be an integer');
    const factor = Math.pow(10, num_digits);
    return Math.round(number * factor) / factor;
  },
  SIN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of SIN must be a number');
    return Math.sin(value);
  },
  SQRT: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of SQRT must be a number');
    if (value < 0)
      throw new Error('Argument 1 of SQRT must be a non-negative number');
    return Math.sqrt(value);
  },
  TAN: (...args: Array<() => unknown>) => {
    const value = computeArg(validateArgs(args, { min: 1, max: 1 })[0]);
    if (typeof value !== 'number')
      throw new Error('Argument 1 of TAN must be a number');
    return Math.tan(value);
  },
  TRUNC: (...args: Array<() => unknown>) => {
    const [numberArg, numDigitsArg] = validateArgs(args, { min: 1, max: 2 });
    const number = computeArg(numberArg);
    if (typeof number !== 'number')
      throw new Error('Argument 1 of TRUNC must be a number');

    let num_digits = 0;
    if (args.length == 2) {
      const numDigitsValue = computeArg(numDigitsArg);
      if (typeof numDigitsValue !== 'number')
        throw new Error('Argument 2 of TRUNC must be a number');
      if (!Number.isInteger(numDigitsValue))
        throw new Error('Argument 2 of TRUNC must be an integer');
      num_digits = numDigitsValue;
    }

    if (num_digits === 0) {
      return Math.trunc(number);
    } else if (num_digits > 0) {
      const factor = Math.pow(10, num_digits);
      return Math.trunc(number * factor) / factor;
    } else {
      // num_digits < 0
      const factor = Math.pow(10, Math.abs(num_digits));
      return Math.trunc(number / factor) * factor;
    }
  },
  INCLUDES: (...args: Array<() => unknown>) => {
    const [listArg, searchValueArg] = validateArgs(args, { min: 2, max: 2 });
    const list = computeArg(listArg);
    const searchValue = computeArg(searchValueArg);

    if (list === null || list === undefined) return false;
    if (Array.isArray(list)) return list.includes(searchValue);

    if (typeof list === 'string') {
      if (typeof searchValue !== 'string')
        throw new Error('Argument 2 of INCLUDES must be a string');
      if (searchValue === '') return false;

      const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');

      return !!list.match(regex)?.length;
    }

    throw new Error('Argument 1 of INCLUDES must be a string or a list');
  },

  COUNTMATCHES: (...args: Array<() => unknown>) => {
    const [sourceArg, searchArg] = validateArgs(args, {
      min: 2,
      max: 2,
    });

    const source = computeArg(sourceArg);
    const searchValue = computeArg(searchArg);

    if (Array.isArray(source)) {
      return source.filter((item) => item === searchValue).length;
    }

    if (typeof source === 'string') {
      if (typeof searchValue !== 'string') {
        throw new Error('Argument 2 of COUNTMATCHES must also be a string');
      }

      if (searchValue === '') return 0;

      const escaped = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');

      return source.match(regex)?.length || 0;
    }

    throw new Error('Argument 1 of COUNTMATCHES must be a string or a list');
  },

  SUM: (...args: Array<() => unknown>) => {
    const [arrayArg] = validateArgs(args, { min: 1, max: 1 });
    const array = computeArg(arrayArg);

    if (!Array.isArray(array))
      throw new Error('Argument 1 of SUM must be a list');

    return array.reduce((sum, item) => {
      if (typeof item !== 'number')
        throw new Error('All elements in the list must be numbers');
      return sum + item;
    }, 0);
  },

  REMOVEBLANKS: (...args: Array<() => unknown>) => {
    const [arrayArg] = validateArgs(args, { min: 1, max: 1 });
    const array = computeArg(arrayArg);
    if (!Array.isArray(array))
      throw new Error('Argument 1 of REMOVEBLANKS must be a list');

    return array.filter(
      (item) => item !== null && item !== undefined && item !== ''
    );
  },

  JOIN: (...args: Array<() => unknown>) => {
    const [arrayArg, separatorArg] = validateArgs(args, { min: 2, max: 2 });
    const array = computeArg(arrayArg);
    const separator = computeArg(separatorArg);
    if (!Array.isArray(array))
      throw new Error('Argument 1 of JOIN must be a list');

    if (typeof separator !== 'string')
      throw new Error('Argument 2 of JOIN must be a string');

    return array.join(separator);
  },

  DATEVALUE: (...args: Array<() => unknown>) => {
    const [dateArg] = validateArgs(args, { min: 1, max: 1 });
    const dateValue = computeArg(dateArg);
    if (typeof dateValue !== 'string')
      throw new Error('Argument 1 of DATEVALUE must be a string');

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      throw new Error('Argument 1 of DATEVALUE must be a valid date string');
    }
    return date;
  },

  ADDDAYS: (...args: Array<() => unknown>) => {
    const [dateArg, daysArg] = validateArgs(args, { min: 2, max: 2 });
    const dateValue = computeArg(dateArg);
    const days = computeArg(daysArg);
    if (!(dateValue instanceof Date))
      throw new Error('Argument 1 of ADDDAYS must be a date');
    if (
      !Number.isFinite(days) ||
      isNaN(days) ||
      !Number.isInteger(days) ||
      days <= 0
    )
      throw new Error('Argument 2 of ADDDAYS must be a positive integer');

    const result = dateValue;
    result.setDate(result.getDate() + days);
    return result;
  },
};
