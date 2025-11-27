import assert from 'assert';
import { Context, formulaEval, Options } from '../src/formula';

describe('formula_eval', () => {
  function testFormula(formula: string, context: Context, expected: unknown, description: string) {
    const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
    it(title, () => {
      expect(formulaEval(formula, context)).toBe(expected);
    });
    /*it(`serialize | ${title}`, () => {
      expect(parser.parse(formula).serialize()).toBe(formula.trim());
    });*/
  }

  function testFormulaStrictEqual(formula: string, context: Context, expected: unknown, description: string) {
    const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
    it(title, () => {
      expect(formulaEval(formula, context)).toStrictEqual(expected);
    });
  }

  function testFormulaWithOptions(formula: string, context: Context, options: Options, expected: unknown, description: string) {
    const title = `${description} ${formula} => ${JSON.stringify(expected)}`;
    it(title, () => {
      expect(formulaEval(formula, context, options)).toBe(expected);
    });
    /*it(`serialize | ${title}`, () => {
      expect(parser.parse(formula).serialize()).toBe(formula.trim());
    });*/
  }

  function testFormulaError(formula: string, context: Context, expectedError: string, description: string) {
    it(description, () => {
      expect(() => formulaEval(formula, context))
        .toThrow(expectedError);
    });
  }

  // Some basic usecases
  describe('Basics', () => {
    testFormula('"Hello"', {}, 'Hello', 'String');
    testFormula('12', {}, 12, 'Number');
    testFormula('true', {}, true, 'Boolean true');
    testFormula('false', {}, false, 'Boolean false');
    testFormula('11 + 1', {}, 12, 'Addition');
    testFormula('13 - 1', {}, 12, 'Subtraction');
    testFormula('6 * 2', {}, 12, 'Multiplication');
    testFormula('6 * 2 + 1', {}, 13, 'Addition and Multiplication');
    testFormula('24 / 2', {}, 12, 'Division');
    testFormula('true && true', {}, true, 'Boolean && true');
    testFormula('true && false', {}, false, 'Boolean && false');
    testFormula('true || false', {}, true, 'Boolean || true');
    testFormula('false || false', {}, false, 'Boolean || false');
    testFormula('12 > 10', {}, true, '> true');
    testFormula('12 > 14', {}, false, '> false');
    testFormula('12 < 14', {}, true, '< true');
    testFormula('12 < 10', {}, false, '< false');
    testFormula('12 == 12', {}, true, '== true');
    testFormula('12 == 14', {}, false, '== false');
    testFormula('12 != 14', {}, true, '!= true');
    testFormula('12 != 12', {}, false, '!= false');
    testFormula('12 >= 12', {}, true, '>= true');
    testFormula('12 >= 14', {}, false, '>= false');
    testFormula('12 <= 12', {}, true, '<= true');
    testFormula('12 <= 14', {}, true, '<= true');
    testFormula('', {}, undefined, 'undefined');
    testFormula(' ', {}, undefined, 'undefined');
    testFormula('12 * 2', {}, 24, 'Multiplication');
    testFormula('12 - 2', {}, 10, 'Substraction');
    testFormulaError('12 12', {}, 'Unknown operator', 'Missing operator');
  });

  describe('Whitespaces', () => {
    testFormula(' "Hello"', {}, 'Hello', 'starting with whitespace');
    testFormula('"Hello" ', {}, 'Hello', 'ending with whitespace');
    testFormula('  12', {}, 12, 'ending with whitespace');
    testFormula('12 ', {}, 12, 'ending with whitespace');
  });

  // Text Operations
  describe('Variables', () => {
    testFormula('FirstName', { FirstName: "John" }, 'John', 'text field reference');
    testFormula('FirstName.value', { FirstName: { value: "John" } }, 'John', 'object field reference');
    testFormula('a.b.c', { a: { b: { c: "Super" } } }, 'Super', 'object field reference');
    testFormula('FirstName & " " & LastName',
      { FirstName: "John", LastName: "Doe" }, 
      'John Doe', 
      'text concatenation');
  });

  describe('Functions', () => {
    testFormula('NOT(true)', {}, false, 'NOT true');
    testFormula('NOT(false)', {}, true, 'NOT false');
    testFormula('ISBLANK(Email)',
      { Email: "TEST@EXAMPLE.COM" }, 
      false,
      'IS BLANK false');
    testFormula('ISBLANK(Email)',
      { Email: "" },
      true,
      'IS BLANK false');
    testFormula('ISBLANK(Email)',
      { Email: " " },
      true,
      'IS BLANK false');
    testFormula('ISBLANK(Email) && ISBLANK(FirstName)',
      { Email: "john@doe.com", FirstName: "John" },
      false,
      'Multiple ISBLANK true');
    testFormula('NOT(ISBLANK(Email)) && NOT(ISBLANK(FirstName))',
      { Email: "", FirstName: "John" },
      false,
      'Multiple NOT(ISBLANK) false');
    testFormula('NOT(ISBLANK(Email)) && NOT(ISBLANK(FirstName))',
      { Email: "john@doe.fs", FirstName: "John" },
      true,
      'Multiple NOT(ISBLANK) false');
  });

  // Numeric Operations
  describe('Numeric Formulas', () => {
    testFormula('Amount', { Amount: 100 }, 100, 'numeric field reference');
    testFormula('Amount * Quantity', 
      { Amount: 10, Quantity: 5 }, 
      50, 
      'numeric multiplication');
    /*testFormula('ROUND(Amount, 2)',
      { Amount: 100.456 }, 
      100.46, 
      'rounding numbers');
    testFormula('ABS(Balance)', 
      { Balance: -50 }, 
      50, 
      'absolute value');*/
  });


  // Logical Operations
  describe('Logical Formulas', () => {
    testFormula('IsActive', 
      { IsActive: true }, 
      true, 
      'boolean field reference');
    testFormula('Amount > 1000', 
      { Amount: 1500 }, 
      true, 
      'numeric comparison');
    testFormula('Status = "Open"', 
      { Status: "Open" }, 
      true, 
      'text comparison');
    testFormula('IsActive AND Amount > 0',
      { IsActive: true, Amount: 100 }, 
      true, 
      'logical AND');
    testFormula('IsClosed OR Amount = 0',
      { IsClosed: false, Amount: 0 }, 
      true, 
      'logical OR');
    testFormula('ISBLANK(FirstName)',
      { FirstName: "" },
      true,
      'check if field is blank');
    testFormula('ISBLANK(FirstName)',
      { FirstName: "Luc" },
      false,
      'check if field is blank');
    testFormula('NOT(IsActive)',
      { IsActive: false },
      true,
      'negation of boolean value');
    testFormula('NOT(IsActive)',
      { IsActive: true },
      false,
      'negation of boolean value');
  });

  /*
  // Date Operations
  describe('Date Formulas', () => {
    testFormula('TODAY()', 
      {}, 
      expect.any(Date), 
      'current date');
    testFormula('DATEVALUE(CreatedDate)', 
      { CreatedDate: "2023-12-25" }, 
      new Date("2023-12-25"), 
      'date conversion');
    testFormula('DAYS(DueDate, CreatedDate)', 
      { DueDate: "2023-12-25", CreatedDate: "2023-12-20" }, 
      5, 
      'days between dates');
  });
  */

  // Conditional Logic
  describe('Conditional Formulas', () => {
    testFormula('IF(Amount > 1000, "High", "Low")', 
      { Amount: 1500 }, 
      "High", 
      'simple if condition');
    testFormula('IF(Amount > 1000, "High", "Low")',
      { Amount: 2 },
      "Low",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "J" },
      "Missing 2 Chars",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "Jo" },
      "Missing 1 Chars",
      'simple if condition');
    testFormula('IF(LEN(name) < 3, "Missing " + TEXT(3 - LEN(name)) + " Chars" , true)',
      { name: "John" },
      true,
      'simple if condition');
    testFormula('IF(LEN(name.value) < 3, "Missing " + TEXT(3 - LEN(name.value)) + " chars" , "")',
      (variables: string[])=> {
        if(variables.join('.') !== "name.value") throw new Error("Oups trying to evaluate another variable than name.value");
        return 'Jo'
      },
      "Missing 1 chars",
      'simple if condition');
    testFormula('IF(LEN(name.value) < 3, "Missing " + TEXT(3 - LEN(name.value)) + " chars" , "")',
      (variables: string[])=> {
        if(variables.join('.') !== "name.value") throw new Error("Oups trying to evaluate another variable than name.value");
        return 'John'
      },
      "",
      'simple if condition');
    testFormula('IF(true, firstname, lastname)',
      (variable)=> {
        if(variable.join('.') !== "firstname") {
          throw new Error("Oups trying to evaluate another variable than firstname");
        }
        return "John";
      },
      "John",
      'test if true argument is evaluated');
    testFormula('IF(false, firstname, lastname)',
      (variable)=> {
        if(variable.join('.') !== "lastname") {
          throw new Error("Oups trying to evaluate another variable than lastname");
        }
        return "Else";
      },
      "Else",
      'test if false argument is evaluated');
  });


  describe('functions', () => {
    testFormula('LEN("Hello")', {}, 5, 'LEN function');
    testFormula('LEN("")', {}, 0, 'LEN function');
    testFormula('LEN([1, 2, 3])', {}, 3, 'LEN function with array');
    testFormula('LEN([])', {}, 0, 'LEN function with empty array');

    testFormulaError('LEN(123)', {}, 'Argument should be a string or a list in LEN(123)', 'LEN function');

    testFormula('FLOOR(5.7)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(5.2)', {}, 5, 'FLOOR function with positive number');
    testFormula('FLOOR(-5.7)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(-5.2)', {}, -6, 'FLOOR function with negative number');
    testFormula('FLOOR(5)', {}, 5, 'FLOOR function with integer');
    testFormulaError('FLOOR("abc")', {}, 'Argument should be a number in FLOOR("abc")', 'FLOOR function with non-number');

    testFormula('CEILING(5.7)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(5.2)', {}, 6, 'CEILING function with positive number');
    testFormula('CEILING(-5.7)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(-5.2)', {}, -5, 'CEILING function with negative number');
    testFormula('CEILING(5)', {}, 5, 'CEILING function with integer');
    testFormulaError('CEILING("abc")', {}, 'Argument should be a number in CEILING("abc")', 'CEILING function with non-number');

    testFormula('BLANKVALUE("", "Default")', {}, "Default", 'BLANKVALUE with empty string');
    testFormula('BLANKVALUE(null, "Default")', {}, "Default", 'BLANKVALUE with null');
    testFormula('BLANKVALUE(undefined, "Default")', {}, "Default", 'BLANKVALUE with undefined');
    testFormula('BLANKVALUE(" ", "Default")', {}, "Default", 'BLANKVALUE with whitespace');
    testFormula('BLANKVALUE("Hello", "Default")', {}, "Hello", 'BLANKVALUE with non-blank string');
    testFormula('BLANKVALUE(123, "Default")', {}, 123, 'BLANKVALUE with number');
    testFormula('BLANKVALUE(0, "Default")', {}, 0, 'BLANKVALUE with zero');
    testFormula('BLANKVALUE(false, "Default")', {}, false, 'BLANKVALUE with false');
    testFormula('BLANKVALUE(Name, "Unknown")', { Name: "" }, "Unknown", 'BLANKVALUE with blank variable');
    testFormula('BLANKVALUE(Name, "Unknown")', { Name: "John" }, "John", 'BLANKVALUE with non-blank variable');
    testFormulaError('BLANKVALUE()', {}, 'Not enough arguments 0/2 in BLANKVALUE()', 'BLANKVALUE with no arguments');
    testFormulaError('BLANKVALUE("test")', {}, 'Not enough arguments 1/2 in BLANKVALUE("test")', 'BLANKVALUE with 1 argument');
  });

  describe('INCLUDES - function', () => {
    testFormula('INCLUDES("1;2;3;4;5", "3")', {}, true, 'INCLUDES finds value in multi-picklist');
    testFormula('INCLUDES("1;2;3;4;5", "6")', {}, false, 'INCLUDES does not find value in multi-picklist');
    testFormula('INCLUDES("Option A;Option B;Option C", "Option B")', {}, true, 'INCLUDES finds text value in multi-picklist');
    testFormula('INCLUDES("Option A;Option B;Option C", "Option D")', {}, false, 'INCLUDES does not find text value in multi-picklist');
    testFormula('INCLUDES("Apple;Banana;Orange", "App")', {}, true, 'INCLUDES does partial matches');
    testFormula('INCLUDES(" App ", "App")', {}, true, 'INCLUDES finds exact match with whitespace');
    testFormula('INCLUDES(" App ", "app")', {}, false, 'INCLUDES is case sensitive');
    testFormula('INCLUDES("SingleValue", "SingleValue")', {}, true, 'INCLUDES finds exact match with single value');

    testFormula('INCLUDES("1;2;3", TEXT(2))', {}, true, 'INCLUDES finds number converted to string in multi-picklist');
    testFormula('INCLUDES("1;2;3", TEXT(4))', {}, false, 'INCLUDES does not find number converted to string in multi-picklist');

    testFormula('INCLUDES("", "value")', {}, false, 'INCLUDES with empty string returns false');
    testFormula('INCLUDES(null, "value")', {}, false, 'INCLUDES with null returns false');
    testFormula('INCLUDES(undefined, "value")', {}, false, 'INCLUDES with undefined returns false');
    testFormula('INCLUDES("value", "")', {}, false, 'INCLUDES searching for empty string returns false');

    testFormula('INCLUDES(MultiPicklist, "B")', { MultiPicklist: "A;B;C" }, true, 'INCLUDES with variable containing multi-picklist');
    testFormula('INCLUDES(MultiPicklist, "D")', { MultiPicklist: "A;B;C" }, false, 'INCLUDES with variable not containing value');

    testFormula('INCLUDES(["Option A", "Option B", "Option C"], "Option B")', {}, true, 'INCLUDES finds text value in array');
    testFormula('INCLUDES(["Option A", "Option B", "Option C"], "Option D")', {}, false, 'INCLUDES does not find text value in array');
    testFormula('INCLUDES(["1", "2", "3"], 3)', {}, false, 'INCLUDES does not find number value in text array');
    testFormula('INCLUDES([1, 2, 3], 3)', {}, true, 'INCLUDES does finds number value in number array');

    testFormulaError('INCLUDES("value")', {}, 'Not enough arguments 1/2 in INCLUDES("value")', 'INCLUDES with 1 argument');
    testFormulaError('INCLUDES()', {}, 'Not enough arguments 0/2 in INCLUDES()', 'INCLUDES with no arguments');
    testFormulaError('INCLUDES("a", "b", "c")', {}, 'Too many arguments 3/2 in INCLUDES("a", "b", "c")', 'INCLUDES with too many arguments');

    testFormulaError('INCLUDES("1;2;3", 2)', {}, 'Argument 2 of INCLUDES must be a string', 'INCLUDES with number argument');
    testFormulaError('INCLUDES(123, "2")', {}, 'Argument 1 of INCLUDES must be a string or a list', 'INCLUDES with number multi-picklist');
    testFormulaError('INCLUDES(true, "value")', {}, 'Argument 1 of INCLUDES must be a string or a list', 'INCLUDES with boolean multi-picklist');
    testFormulaError('INCLUDES("value", false)', {}, 'Argument 2 of INCLUDES must be a string', 'INCLUDES with boolean value');
  });

  describe('COUNTMATCHES', () => {
    testFormula('COUNTMATCHES("2   0 22", "2")', {}, 3, 'COUNTMATCHES counts occurrences of a string in a string');
    testFormula('COUNTMATCHES("2   0 22", "0")', {}, 1, 'COUNTMATCHES counts occurrences of a string in a string 2');
    testFormula('COUNTMATCHES("passed passed failed", "failed")', {}, 1, 'COUNTMATCHES counts occurrences of a string in a string 3');
    testFormula('COUNTMATCHES("passed passed failed", "pass")', {}, 2, 'COUNTMATCHES counts occurrences of a string in a string 4');
    testFormula('COUNTMATCHES("passed passed failed", "Pass")', {}, 0, 'COUNTMATCHES is case sensitive');
    testFormula('COUNTMATCHES("2   0 22", "")', {}, 0, 'COUNTMATCHES returns 0 when searching for empty string');
    testFormula('COUNTMATCHES("2   0 22", "3")', {}, 0, 'COUNTMATCHES returns 0 when searching for non-existent string');
    testFormula('COUNTMATCHES(listString, "2")', { listString: "2   0 22"}, 3, 'COUNTMATCHES with listString variable');

    testFormula('COUNTMATCHES(["passed", "passed", "failed"], "passed")', {}, 2, 'COUNTMATCHES counts occurrences of a string in an array');
    testFormula('COUNTMATCHES(["passed", "passed", "failed"], "Passed")', {}, 0, 'COUNTMATCHES is case sensitive 2');
    testFormula('COUNTMATCHES(["passed", "", "failed"], "")', {}, 1, 'COUNTMATCHES counts occurrences of a string in an array 2');
    testFormula('COUNTMATCHES(list, "passed")', { list: ["passed", "passed", "failed"]}, 2, 'COUNTMATCHES with array variable');

    testFormula('COUNTMATCHES([1, 2, 2], 2)', {}, 2, 'COUNTMATCHES counts occurrences of a number in an array');
    testFormula('COUNTMATCHES([1, 0, 1], 0)', {}, 1, 'COUNTMATCHES counts occurrences of a number in an array 2');
    testFormula('COUNTMATCHES([1, 2, 2], 3)', {}, 0, 'COUNTMATCHES returns 0 when searching for non-existent number in an array');
    testFormula('COUNTMATCHES([1, 2, 2], "2")', {}, 0, 'COUNTMATCHES returns 0 when searching for string in a number array');

    testFormula('COUNTMATCHES([false, true, false], true)', {}, 1, 'COUNTMATCHES counts occurrences of a boolean in an array');
    testFormula('COUNTMATCHES([false, true, false], false)', {}, 2, 'COUNTMATCHES counts occurrences of a boolean in an array 2');
    testFormula('COUNTMATCHES([false, true, false], "true")', {}, 0, 'COUNTMATCHES returns 0 when searching for string in a boolean array');

    testFormulaError('COUNTMATCHES("1;2;3", 2)', {}, 'Argument 2 of COUNTMATCHES must also be a string', 'COUNTMATCHES with first argument string and second argument not string');
    testFormulaError('COUNTMATCHES(2, 2)', {}, 'Argument 1 of COUNTMATCHES must be a string or a list', 'COUNTMATCHES with first argument not string or array');
    testFormulaError('COUNTMATCHES(true, "value")', {}, 'Argument 1 of COUNTMATCHES must be a string or a list', 'COUNTMATCHES with boolean first argument');
    testFormulaError('COUNTMATCHES(null, "value")', {}, 'Argument 1 of COUNTMATCHES must be a string or a list', 'COUNTMATCHES with null first argument');
    testFormulaError('COUNTMATCHES([false, true, false], "true", "true")', {}, 'Too many arguments 3/2 in COUNTMATCHES([false, true, false], "true", "true")', 'COUNTMATCHES with too many arguments');
  });

  describe('SUM', () => {
    testFormula('SUM([1, 2, 3])', {}, 6, 'SUM array of positive numbers');
    testFormula('SUM([-1, -2, -3])', {}, -6, 'SUM array of negative numbers');
    testFormula('SUM([1, -2, 3])', {}, 2, 'SUM array of mixed positive and negative numbers');
    testFormula('SUM([0, 0, 0])', {}, 0, 'SUM array of zeros');
    testFormula('SUM([5])', {}, 5, 'SUM single number');
    testFormula('SUM([])', {}, 0, 'SUM empty array');
    testFormula('SUM([1.5, 2.5, 3.5])', {}, 7.5, 'SUM array of decimal numbers');
    testFormula('SUM([-1.5, 2.5, -3.5])', {}, -2.5, 'SUM array of mixed decimal numbers');
    testFormula('SUM([1, 0, -1])', {}, 0, 'SUM array that sums to zero');
    testFormula('SUM(numbers)', { numbers: [1, 2, 3, 4, 5] }, 15, 'SUM with variable containing array');
    testFormula('SUM(single)', { single: [42] }, 42, 'SUM with variable containing single number');

    testFormulaError('SUM(123)', {}, 'Argument 1 of SUM must be a list', 'SUM with non-array argument');
    testFormulaError('SUM("hello")', {}, 'Argument 1 of SUM must be a list', 'SUM with string argument');
    testFormulaError('SUM(true)', {}, 'Argument 1 of SUM must be a list', 'SUM with boolean argument');
    testFormulaError('SUM(null)', {}, 'Argument 1 of SUM must be a list', 'SUM with null argument');
    testFormulaError('SUM([1, "hello", 3])', {}, 'All elements in the list must be numbers', 'SUM with array containing non-number');
    testFormulaError('SUM(["1", "2", "3"])', {}, 'All elements in the list must be numbers', 'SUM with array of strings');
  });

  describe('REMOVEBLANKS', () => {
    testFormulaStrictEqual('REMOVEBLANKS(["", "Hello", "", "World", ""])', {}, ["Hello", "World"], 'REMOVEBLANKS removes empty strings from array');
    testFormulaStrictEqual('REMOVEBLANKS(["Hello", "World", " "])', {}, ["Hello", "World", " "], 'REMOVEBLANKS leaves non-empty strings in array');
    testFormulaStrictEqual('REMOVEBLANKS([1, 2, 3])', {}, [1, 2, 3], 'REMOVEBLANKS leaves numbers in array');
    testFormulaStrictEqual('REMOVEBLANKS([null, undefined, "Hello", "", 0, false])', {}, ["Hello", 0, false], 'REMOVEBLANKS removes null, undefined, and empty strings');
    testFormulaStrictEqual('REMOVEBLANKS([undefined, undefined, undefined])', {}, [], 'REMOVEBLANKS removes undefined from array containing undefined');
    testFormulaStrictEqual('REMOVEBLANKS(numbers)', {numbers: [0,undefined,1, undefined, 2]}, [0,1,2], 'REMOVEBLANKS removes undefined from number array');

    testFormulaError('REMOVEBLANKS(123)', {}, 'Argument 1 of REMOVEBLANKS must be a list', 'REMOVEBLANKS with non-array argument');
    testFormulaError('REMOVEBLANKS("hello")', {}, 'Argument 1 of REMOVEBLANKS must be a list', 'REMOVEBLANKS with string argument');
    testFormulaError('REMOVEBLANKS(true)', {}, 'Argument 1 of REMOVEBLANKS must be a list', 'REMOVEBLANKS with boolean argument');
    testFormulaError('REMOVEBLANKS(null)', {}, 'Argument 1 of REMOVEBLANKS must be a list', 'REMOVEBLANKS with null argument');
    testFormulaError('REMOVEBLANKS(undefined)', {}, 'Argument 1 of REMOVEBLANKS must be a list', 'REMOVEBLANKS with undefined argument');
  });

  describe('JOIN', () => {
    testFormula('JOIN(["Hello", "World"], ";")', {}, "Hello;World", 'JOIN joins array with separator');
    testFormula('JOIN(["Hello", "World"], "")', {}, "HelloWorld", 'JOIN joins array with empty string separator');
    testFormula('JOIN(["Hello"], " ")', {}, "Hello", 'JOIN joins array with one element');
    testFormula('JOIN(empty, " ")', {empty: []}, "", 'JOIN joins empty array with separator');

    testFormula('JOIN(numbers, ";")', {numbers: [1, 2, 3]}, "1;2;3", 'JOIN joins array with separator');
    testFormula('JOIN(numbers, " ")', {numbers: [1, 2, 3]}, "1 2 3", 'JOIN joins array with space separator');
    testFormula('JOIN(numbers, "")', {numbers: [1, 2, 3]}, "123", 'JOIN joins array with empty string separator');

    testFormula('JOIN(booleans, ";")', {booleans: [true, true, false]}, "true;true;false", 'JOIN joins boolean array with separator');

    testFormulaError('JOIN(123, ";")', {}, 'Argument 1 of JOIN must be a list', 'JOIN with non-array argument');
    testFormulaError('JOIN("hello", ";")', {}, 'Argument 1 of JOIN must be a list', 'JOIN with string argument');
    testFormulaError('JOIN(true, ";")', {}, 'Argument 1 of JOIN must be a list', 'JOIN with boolean argument');
    testFormulaError('JOIN(null, ";")', {}, 'Argument 1 of JOIN must be a list', 'JOIN with null argument');
    testFormulaError('JOIN(undefined, ";")', {}, 'Argument 1 of JOIN must be a list', 'JOIN with undefined argument');

    testFormulaError('JOIN([1, 2, 3], 123)', {}, 'Argument 2 of JOIN must be a string', 'JOIN with separator not string');
    testFormulaError('JOIN([1, 2, 3], true)', {}, 'Argument 2 of JOIN must be a string', 'JOIN with separator not string');
    testFormulaError('JOIN([1, 2, 3], null)', {}, 'Argument 2 of JOIN must be a string', 'JOIN with separator not string');
    testFormulaError('JOIN([1, 2, 3], undefined)', {}, 'Argument 2 of JOIN must be a string', 'JOIN with separator not string');
    testFormulaError('JOIN([1, 2, 3], [1, 2, 3])', {}, 'Argument 2 of JOIN must be a string', 'JOIN with separator not string');
  });

  describe('ADDDAYS', () => {
    testFormulaStrictEqual('ADDDAYS(date, 1)', {date: new Date("2024-01-01")}, new Date("2024-01-02"), 'ADDDAYS adds days to date string');
    testFormulaStrictEqual('ADDDAYS(date, 50)', {date: new Date("2024-01-01")}, new Date("2024-02-20"), 'ADDDAYS adds days to date string');
    testFormulaStrictEqual('ADDDAYS(date, 500)', {date: new Date("2024-01-01")}, new Date("2025-05-15"), 'ADDDAYS adds days to date string');

    testFormulaError('ADDDAYS(date, "1")', {date: new Date("2024-01-01")}, 'Argument 2 of ADDDAYS must be a positive integer', 'ADDDAYS with string argument');
    testFormulaError('ADDDAYS(date, 1.5)', {date: new Date("2024-01-01")}, 'Argument 2 of ADDDAYS must be a positive integer', 'ADDDAYS with number argument');
    testFormulaError('ADDDAYS(date, true)', {date: new Date("2024-01-01")}, 'Argument 2 of ADDDAYS must be a positive integer', 'ADDDAYS with boolean argument');
    testFormulaError('ADDDAYS(date, null)', {date: new Date("2024-01-01")}, 'Argument 2 of ADDDAYS must be a positive integer', 'ADDDAYS with null argument');
    testFormulaError('ADDDAYS(date, undefined)', {date: new Date("2024-01-01")}, 'Argument 2 of ADDDAYS must be a positive integer', 'ADDDAYS with undefined argument');
    testFormulaError('ADDDAYS("123", 1)', {}, 'Argument 1 of ADDDAYS must be a date', 'ADDDAYS with string argument');
    testFormulaError('ADDDAYS(123, 1)', {}, 'Argument 1 of ADDDAYS must be a date', 'ADDDAYS with number argument');
    testFormulaError('ADDDAYS(true, 1)', {}, 'Argument 1 of ADDDAYS must be a date', 'ADDDAYS with boolean argument');
    testFormulaError('ADDDAYS(null, 1)', {}, 'Argument 1 of ADDDAYS must be a date', 'ADDDAYS with null argument');
    testFormulaError('ADDDAYS(undefined, 1)', {}, 'Argument 1 of ADDDAYS must be a date', 'ADDDAYS with undefined argument');
  });

  describe('DAYSBETWEEN', () => {
    testFormula('DAYSBETWEEN(date1, date2)', {date1: new Date("2024-01-01"), date2: new Date("2024-01-01")}, 0, 'DAYSBETWEEN between two dates');
    testFormula('DAYSBETWEEN(date1, date2)', {date1: new Date("2024-01-01"), date2: new Date("2024-01-03")}, -2, 'DAYSBETWEEN between two dates');
    testFormula('DAYSBETWEEN(date1, date2)', {date1: new Date("2024-01-03"), date2: new Date("2024-01-01")}, 2, 'DAYSBETWEEN between two dates');
    testFormula('DAYSBETWEEN(date1, date2)', {date1: new Date("2024-01-01"), date2: new Date("2024-02-03")}, -33, 'DAYSBETWEEN between two dates');
    testFormula('DAYSBETWEEN(date1, date2)', {date1: new Date("2025-01-29"), date2: new Date("2024-03-01")}, 334, 'DAYSBETWEEN between two dates');

    testFormulaError('DAYSBETWEEN("1", date)', {date: new Date("2024-01-01")}, 'Argument 1 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with string argument');
    testFormulaError('DAYSBETWEEN(1.5, date)', {date: new Date("2024-01-01")}, 'Argument 1 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with number argument');
    testFormulaError('DAYSBETWEEN(true, date)', {date: new Date("2024-01-01")}, 'Argument 1 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with boolean argument');
    testFormulaError('DAYSBETWEEN(null, date)', {date: new Date("2024-01-01")}, 'Argument 1 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with null argument');
    testFormulaError('DAYSBETWEEN(undefined, date)', {date: new Date("2024-01-01")}, 'Argument 1 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with undefined argument');
    testFormulaError('DAYSBETWEEN(date, "1")', {date: new Date("2024-01-01")}, 'Argument 2 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with string argument');
    testFormulaError('DAYSBETWEEN(date, 1.5)', {date: new Date("2024-01-01")}, 'Argument 2 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with number argument');
    testFormulaError('DAYSBETWEEN(date, true)', {date: new Date("2024-01-01")}, 'Argument 2 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with boolean argument');
    testFormulaError('DAYSBETWEEN(date, null)', {date: new Date("2024-01-01")}, 'Argument 2 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with null argument');
    testFormulaError('DAYSBETWEEN(date, undefined)', {date: new Date("2024-01-01")}, 'Argument 2 of DAYSBETWEEN must be a date', 'DAYSBETWEEN with undefined argument');
  });

  describe('Dynamic context', () => {
    testFormula('Amount', (variables: string[])=> {
      assert(variables.length === 1);
      assert(variables[0] === 'Amount');
      return 100
    }, 100, 'numeric field reference');

    testFormula('Amount * Quantity', (variables: string[])=> {
      if(variables[0] === 'Amount') return 100;
      return 2;
    }, 200, 'numeric field reference');
  });
  // Error Cases
  /*
  describe('Error Handling', () => {
    /*testFormulaError(
      '',
      {},
      '',
      ''
    );*/
    /*testFormulaError(
      'NonexistentVariable',
      {},
      'Field "NonexistentVariable" not found in context',
      'undefined variable reference'
    );

    /*

    testFormulaError(
      'DIVIDE(Amount, ZeroValue)',
      { Amount: 100, ZeroValue: 0 },
      'Division by zero',
      'division by zero'
    );

    testFormulaError(
      '1 + + 2',
      {},
      'Invalid formula syntax',
      'invalid formula syntax'
    );
    */

    /*testFormulaError(
      'INVALID_FUNCTION(123)',
      {},
      'Unknown function: INVALID_FUNCTION',
      'invalid function name'
    );* /
  }); */

  describe('Dynamic functions', () => {
    const today = new Date();
    testFormulaWithOptions('TODAY()', {}, { functions: { 'TODAY': () => today } }, today, 'Dynamic function without arguments');
    testFormulaWithOptions('INC(12)',{}, {functions: { 'INC': (...args: Array<()=>unknown>) => {
        assert(args.length === 1);
        const arg = args[0]();
        if(typeof arg !== 'number') throw new Error('OUPS ?');
        assert(arg === 12);

        return arg + 1;
      }
    }}, 13, 'Dynamic function with one argument');

    testFormulaWithOptions('SUM(12, 4)',{}, {
      functions: {'SUM': (...args: Array<()=>unknown>) => {
        assert(args.length === 2);
        const values = args.map((f)=> f());
        assert(values[0] === 12);
        assert(values[1] === 4);

        return 12 + 4;
      }
    }}, 12 + 4, 'Dynamic function with arguments');
  });

  describe('NULLVALUE', () => {
    testFormula('NULLVALUE(NullVar, "Default")', {NullVar: null}, "Default", 'NULLVALUE null variable');
    testFormula('NULLVALUE(NotDefined, "Default")', {}, "Default", 'NULLVALUE undefined variable');
    testFormula('NULLVALUE("Actual", "Default")', {}, "Actual", 'NULLVALUE non-null string');
    testFormula('NULLVALUE("", "Default")', {}, "", 'NULLVALUE empty string (not null)');
    testFormula('NULLVALUE(0, "Default")', {}, 0, 'NULLVALUE zero (not null)');
    testFormula('NULLVALUE(Name, "Unknown")', {Name: 'John'}, "John", 'NULLVALUE Name="John"');
    testFormula('NULLVALUE(BLANKVALUE(null, null), "Subst")', {}, "Subst", 'NULLVALUE nested with null');
    testFormulaError('NULLVALUE(1)', {}, 'Not enough arguments 1/2 in NULLVALUE(1)', 'NULLVALUE one argument');
    testFormulaError('NULLVALUE()', {}, 'Not enough arguments 0/2 in NULLVALUE()', 'NULLVALUE one argument');
  });

  describe('ISNUMBER', () => {
    testFormula('ISNUMBER(123)', {}, true, 'ISNUMBER 123');
    testFormula('ISNUMBER(-123.45)', {}, true, 'ISNUMBER -123.45');
    testFormula('ISNUMBER("123")', {}, true, 'ISNUMBER "123"');
    testFormula('ISNUMBER("123.45")', {}, true, 'ISNUMBER "123.45"');
    testFormula('ISNUMBER("-10")', {}, true, 'ISNUMBER "-10"');
    testFormula('ISNUMBER("  123  ")', {}, true, 'ISNUMBER "  123  "');
    testFormula('ISNUMBER("")', {}, false, 'ISNUMBER empty string');
    testFormula('ISNUMBER("   ")', {}, false, 'ISNUMBER whitespace string');
    testFormula('ISNUMBER("abc")', {}, false, 'ISNUMBER "abc"');
    testFormula('ISNUMBER("12a3")', {}, false, 'ISNUMBER "12a3"');
    testFormula('ISNUMBER("12.3.4")', {}, false, 'ISNUMBER "12.3.4"');
    testFormula('ISNUMBER("1,234")', {}, false, 'ISNUMBER "1,234" (with comma)');
    testFormula('ISNUMBER(true)', {}, false, 'ISNUMBER true');
    testFormula('ISNUMBER(false)', {}, false, 'ISNUMBER false');
    testFormula('ISNUMBER(NullVar)', {NullVar: null}, false, 'ISNUMBER null');
    testFormula('ISNUMBER(NotDefined)', {}, false, 'ISNUMBER undefined');
    testFormula('ISNUMBER(PI())', {}, true, 'ISNUMBER PI()');
    testFormula('ISNUMBER(1/0)', {}, false, 'ISNUMBER Infinity (isFinite check)'); // JS 1/0 is Infinity
    testFormula('ISNUMBER(0/0)', {}, false, 'ISNUMBER NaN (isFinite check)'); // JS 0/0 is NaN
    testFormulaError('ISNUMBER()', {}, 'Not enough arguments 0/1 in ISNUMBER()', 'ISNUMBER no arguments');
    testFormulaError('ISNUMBER(1,2)', {}, 'Too many arguments 2/1 in ISNUMBER(1,2)', 'ISNUMBER too many arguments');
    // testFormula('ISNUMBER(DATE(2023,1,1))', {}, false, 'ISNUMBER Date object');
  });
  describe('ISNULL', () => {
    testFormula('ISNULL(NullVar)', {NullVar: null}, true, 'ISNULL null variable');
    testFormula('ISNULL(NotDefined)', {}, true, 'ISNULL undefined variable');
    testFormula('ISNULL("")', {}, false, 'ISNULL empty string');
    testFormula('ISNULL("text")', {}, false, 'ISNULL string');
    testFormula('ISNULL(0)', {}, false, 'ISNULL zero');
    testFormula('ISNULL(1)', {}, false, 'ISNULL number');
    testFormula('ISNULL(BLANKVALUE("", 1))', {}, false, 'ISNULL BLANKVALUE returns 1 (not null)');
    testFormula('ISNULL(BLANKVALUE(null, "a"))', {}, false, 'ISNULL BLANKVALUE returns "a" (not null)');
    testFormula('ISNULL(Name)', {Name: 'John'}, false, 'ISNULL Name="John"');
    testFormulaError('ISNULL()', {}, 'Not enough arguments 0/1 in ISNULL()', 'ISNULL no arguments');
    testFormulaError('ISNULL(1,2)', {}, 'Too many arguments 2/1 in ISNULL(1,2)', 'ISNULL too many arguments');
  });
  describe('CASE', () => {
    testFormula('CASE(3, 1, "One", 2, "Two", 3, "Three", "Other")', {}, "Three", 'CASE match third value');
    testFormula('CASE(4, 1, "One", 2, "Two", 3, "Three", "Other")', {}, "Other", 'CASE use else_result');
    testFormula('CASE(5, 1, "One", 2, "Two", 3, "Three")', {}, null, 'CASE no match, no else_result');
    testFormula('CASE("B", "A", 10, "B", 20, "C", 30, 0)', {}, 20, 'CASE string match');
    testFormula('CASE("D", "A", 10, "B", 20, "C", 30, 100)', {}, 100, 'CASE string use else_result');
    testFormula('CASE("D", "A", 10, "B", 20, "C", 30)', {}, null, 'CASE string no match, no else');
    testFormula('CASE(Status, "Open", 1, "Closed", 2, 0)', {Status: 'Open'}, 1, 'CASE var match');
    testFormula('CASE(Status, "Pending", 1, "Closed", 2, 0)', {Status: 'Open'}, 0, 'CASE var use else_result');
    testFormula('CASE(true, false, "No", true, "Yes", "Maybe")', {}, "Yes", 'CASE boolean expression');
    testFormula('CASE(Amount, 50, "Fifty", 100, "Hundred", 200, "Two Hundred", "Other")', {Amount: 100}, "Hundred", 'CASE number expression');
    testFormula('CASE(Amount, 50, "Fifty", 101, "HundredOne", "Other")', {Amount: 100}, "Other", 'CASE number expression else');
    testFormulaError('CASE(1)', {}, 'Not enough arguments 1/3 in CASE(1)', 'CASE one argument');
    testFormulaError('CASE(1, 2)', {}, 'Not enough arguments 2/3 in CASE(1, 2)', 'CASE two arguments');
    testFormula('CASE(2, 2, "Val2")', {}, "Val2", 'CASE expression matches value, no else'); // This is valid: expression, value1, result1
  });
  describe('Math Functions', () => {
    // ABS
    describe('ABS', () => {
      testFormula('ABS(10)', {}, 10, 'ABS positive');
      testFormula('ABS(-10)', {}, 10, 'ABS negative');
      testFormula('ABS(0)', {}, 0, 'ABS zero');
      testFormulaError('ABS("text")', {}, 'Argument 1 of ABS must be a number in ABS("text")', 'ABS text input');
      testFormulaError('ABS()', {}, 'Not enough arguments 0/1 in ABS()', 'ABS no arguments');
      testFormulaError('ABS(1, 2)', {}, 'Too many arguments 2/1 in ABS(1, 2)', 'ABS too many arguments');
    });

    // ACOS
    describe('ACOS', () => {
      testFormula('ACOS(1)', {}, 0, 'ACOS 1');
      testFormula('ACOS(0)', {}, Math.PI / 2, 'ACOS 0');
      testFormula('ACOS(-1)', {}, Math.PI, 'ACOS -1');
      testFormula('ACOS(0.5)', {}, Math.acos(0.5), 'ACOS 0.5');
      testFormula('ACOS(2)', {}, null, 'ACOS 2 (out of range)');
      testFormula('ACOS(-2)', {}, null, 'ACOS -2 (out of range)');
      testFormulaError('ACOS("text")', {}, 'Argument 1 of ACOS must be a number in ACOS("text")', 'ACOS text input');
      testFormulaError('ACOS()', {}, 'Not enough arguments 0/1 in ACOS()', 'ACOS no arguments');
      testFormulaError('ACOS(1, 2)', {}, 'Too many arguments 2/1 in ACOS(1, 2)', 'ACOS too many arguments');
    });

    // ASIN
    describe('ASIN', () => {
      testFormula('ASIN(1)', {}, Math.PI / 2, 'ASIN 1');
      testFormula('ASIN(0)', {}, 0, 'ASIN 0');
      testFormula('ASIN(-1)', {}, -Math.PI / 2, 'ASIN -1');
      testFormula('ASIN(0.5)', {}, Math.asin(0.5), 'ASIN 0.5');
      testFormula('ASIN(2)', {}, null, 'ASIN 2 (out of range)');
      testFormula('ASIN(-2)', {}, null, 'ASIN -2 (out of range)');
      testFormulaError('ASIN("text")', {}, 'Argument 1 of ASIN must be a number in ASIN("text")', 'ASIN text input');
      testFormulaError('ASIN()', {}, 'Not enough arguments 0/1 in ASIN()', 'ASIN no arguments');
      testFormulaError('ASIN(1, 2)', {}, 'Too many arguments 2/1 in ASIN(1, 2)', 'ASIN too many arguments');
    });

    // ATAN
    describe('ATAN', () => {
      testFormula('ATAN(0)', {}, 0, 'ATAN 0');
      testFormula('ATAN(1)', {}, Math.PI / 4, 'ATAN 1');
      testFormulaError('ATAN("text")', {}, 'Argument 1 of ATAN must be a number in ATAN("text")', 'ATAN text input');
      testFormulaError('ATAN()', {}, 'Not enough arguments 0/1 in ATAN()', 'ATAN no arguments');
      testFormulaError('ATAN(1, 2)', {}, 'Too many arguments 2/1 in ATAN(1, 2)', 'ATAN too many arguments');
    });

    // ATAN2
    describe('ATAN2', () => {
      testFormula('ATAN2(0, 0)', {}, 0, 'ATAN2(0,0)');
      testFormula('ATAN2(1, 1)', {}, Math.PI / 4, 'ATAN2(1,1)');
      testFormula('ATAN2(10, 0)', {}, Math.PI / 2, 'ATAN2(10,0)');
      testFormula('ATAN2(0, 10)', {}, 0, 'ATAN2(0,10)');
      testFormulaError('ATAN2("text", 1)', {}, 'Argument 1 of ATAN2 must be a number in ATAN2("text", 1)', 'ATAN2 text input for arg1');
      testFormulaError('ATAN2(1, "text")', {}, 'Argument 2 of ATAN2 must be a number in ATAN2(1, "text")', 'ATAN2 text input for arg2');
      testFormulaError('ATAN2()', {}, 'Not enough arguments 0/2 in ATAN2()', 'ATAN2 no arguments');
      testFormulaError('ATAN2(1)', {}, 'Not enough arguments 1/2 in ATAN2(1)', 'ATAN2 one argument');
      testFormulaError('ATAN2(1, 2, 3)', {}, 'Too many arguments 3/2 in ATAN2(1, 2, 3)', 'ATAN2 too many arguments');
    });

    // COS
    describe('COS', () => {
      testFormula('COS(0)', {}, 1, 'COS 0');
      testFormula('COS(PI())', {}, -1, 'COS PI');
      testFormula('COS(PI()/2)', {}, Math.cos(Math.PI/2), 'COS PI/2 (close to 0)');
      testFormulaError('COS("text")', {}, 'Argument 1 of COS must be a number in COS("text")', 'COS text input');
      testFormulaError('COS()', {}, 'Not enough arguments 0/1 in COS()', 'COS no arguments');
      testFormulaError('COS(1, 2)', {}, 'Too many arguments 2/1 in COS(1, 2)', 'COS too many arguments');
    });

    // EXP
    describe('EXP', () => {
      testFormula('EXP(1)', {}, Math.E, 'EXP 1');
      testFormula('EXP(0)', {}, 1, 'EXP 0');
      testFormula('EXP(2)', {}, Math.exp(2), 'EXP 2');
      testFormulaError('EXP("text")', {}, 'Argument 1 of EXP must be a number in EXP("text")', 'EXP text input');
      testFormulaError('EXP()', {}, 'Not enough arguments 0/1 in EXP()', 'EXP no arguments');
      testFormulaError('EXP(1, 2)', {}, 'Too many arguments 2/1 in EXP(1, 2)', 'EXP too many arguments');
    });

    // LN
    describe('LN', () => {
      testFormula('LN(EXP(1))', {}, 1, 'LN(e)');
      testFormula('LN(1)', {}, 0, 'LN 1');
      testFormulaError('LN("text")', {}, 'Argument 1 of LN must be a number in LN("text")', 'LN text input');
      testFormulaError('LN(0)', {}, 'Argument 1 of LN must be a positive number in LN(0)', 'LN zero');
      testFormulaError('LN(-1)', {}, 'Argument 1 of LN must be a positive number in LN(-1)', 'LN negative');
      testFormulaError('LN()', {}, 'Not enough arguments 0/1 in LN()', 'LN no arguments');
      testFormulaError('LN(1, 2)', {}, 'Too many arguments 2/1 in LN(1, 2)', 'LN too many arguments');
    });

    // LOG
    describe('LOG', () => {
      testFormula('LOG(10)', {}, 1, 'LOG 10');
      testFormula('LOG(100)', {}, 2, 'LOG 100');
      testFormula('LOG(1)', {}, 0, 'LOG 1');
      testFormulaError('LOG("text")', {}, 'Argument 1 of LOG must be a number in LOG("text")', 'LOG text input');
      testFormulaError('LOG(0)', {}, 'Argument 1 of LOG must be a positive number in LOG(0)', 'LOG zero');
      testFormulaError('LOG(-1)', {}, 'Argument 1 of LOG must be a positive number in LOG(-1)', 'LOG negative');
      testFormulaError('LOG()', {}, 'Not enough arguments 0/1 in LOG()', 'LOG no arguments');
      testFormulaError('LOG(1, 2)', {}, 'Too many arguments 2/1 in LOG(1, 2)', 'LOG too many arguments');
    });

    // MAX
    describe('MAX', () => {
      testFormula('MAX(1, 2, 3)', {}, 3, 'MAX three numbers');
      testFormula('MAX(10, 0, -10)', {}, 10, 'MAX positive, zero, negative');
      testFormula('MAX(5)', {}, 5, 'MAX single number');
      testFormula('MAX(10, 5, 20, 1)', {}, 20, 'MAX multiple numbers');
      testFormulaError('MAX(5, "text")', {}, 'Argument 2 of MAX must be a number in MAX(5, "text")', 'MAX text input');
      testFormulaError('MAX("text", 5)', {}, 'Argument 1 of MAX must be a number in MAX("text", 5)', 'MAX text input first');
      testFormulaError('MAX()', {}, 'Not enough arguments 0/1 in MAX()', 'MAX no arguments');
    });

    // MCEILING
    describe('MCEILING', () => {
      testFormula('MCEILING(5.7)', {}, 6, 'MCEILING positive number');
      testFormula('MCEILING(5.2)', {}, 6, 'MCEILING positive number');
      testFormula('MCEILING(-5.7)', {}, -5, 'MCEILING negative number');
      testFormula('MCEILING(-5.2)', {}, -5, 'MCEILING negative number');
      testFormula('MCEILING(5)', {}, 5, 'MCEILING integer');
      testFormulaError('MCEILING("text")', {}, 'Argument 1 of MCEILING must be a number in MCEILING("text")', 'MCEILING text input');
      testFormulaError('MCEILING()', {}, 'Not enough arguments 0/1 in MCEILING()', 'MCEILING no arguments');
      testFormulaError('MCEILING(1, 2)', {}, 'Too many arguments 2/1 in MCEILING(1, 2)', 'MCEILING too many arguments');
    });

    // MFLOOR
    describe('MFLOOR', () => {
      testFormula('MFLOOR(5.7)', {}, 5, 'MFLOOR positive number');
      testFormula('MFLOOR(5.2)', {}, 5, 'MFLOOR positive number');
      testFormula('MFLOOR(-5.7)', {}, -6, 'MFLOOR negative number');
      testFormula('MFLOOR(-5.2)', {}, -6, 'MFLOOR negative number');
      testFormula('MFLOOR(5)', {}, 5, 'MFLOOR integer');
      testFormulaError('MFLOOR("text")', {}, 'Argument 1 of MFLOOR must be a number in MFLOOR("text")', 'MFLOOR text input');
      testFormulaError('MFLOOR()', {}, 'Not enough arguments 0/1 in MFLOOR()', 'MFLOOR no arguments');
      testFormulaError('MFLOOR(1, 2)', {}, 'Too many arguments 2/1 in MFLOOR(1, 2)', 'MFLOOR too many arguments');
    });

    // MIN
    describe('MIN', () => {
      testFormula('MIN(1, 2, 3)', {}, 1, 'MIN three numbers');
      testFormula('MIN(10, 0, -10)', {}, -10, 'MIN positive, zero, negative');
      testFormula('MIN(5)', {}, 5, 'MIN single number');
      testFormula('MIN(10, 5, 20, 1)', {}, 1, 'MIN multiple numbers');
      testFormulaError('MIN(5, "text")', {}, 'Argument 2 of MIN must be a number in MIN(5, "text")', 'MIN text input');
      testFormulaError('MIN("text", 5)', {}, 'Argument 1 of MIN must be a number in MIN("text", 5)', 'MIN text input first');
      testFormulaError('MIN()', {}, 'Not enough arguments 0/1 in MIN()', 'MIN no arguments');
    });

    // MOD
    describe('MOD', () => {
      testFormula('MOD(10, 3)', {}, 1, 'MOD 10, 3');
      testFormula('MOD(10, -3)', {}, 1, 'MOD 10, -3 (JS behavior)');
      testFormula('MOD(-10, 3)', {}, -1, 'MOD -10, 3 (JS behavior)');
      testFormula('MOD(-10, -3)', {}, -1, 'MOD -10, -3 (JS behavior)');
      testFormula('MOD(10, 10)', {}, 0, 'MOD 10, 10');
      testFormulaError('MOD(10, 0)', {}, 'Argument 2 of MOD cannot be zero in MOD(10, 0)', 'MOD divisor zero');
      testFormulaError('MOD("text", 3)', {}, 'Argument 1 of MOD must be a number in MOD("text", 3)', 'MOD text input for arg1');
      testFormulaError('MOD(10, "text")', {}, 'Argument 2 of MOD must be a number in MOD(10, "text")', 'MOD text input for arg2');
      testFormulaError('MOD()', {}, 'Not enough arguments 0/2 in MOD()', 'MOD no arguments');
      testFormulaError('MOD(1)', {}, 'Not enough arguments 1/2 in MOD(1)', 'MOD one argument');
      testFormulaError('MOD(1, 2, 3)', {}, 'Too many arguments 3/2 in MOD(1, 2, 3)', 'MOD too many arguments');
    });

    // PI
    describe('PI', () => {
      testFormula('PI()', {}, Math.PI, 'PI');
      testFormulaError('PI(1)', {}, 'Too many arguments 1/0 in PI(1)', 'PI with argument');
    });

    // ROUND
    describe('ROUND', () => {
      testFormula('ROUND(3.14159, 2)', {}, 3.14, 'ROUND 3.14159 to 2 digits');
      testFormula('ROUND(3.14159, 0)', {}, 3, 'ROUND 3.14159 to 0 digits');
      testFormula('ROUND(12345.67, -2)', {}, 12300, 'ROUND 12345.67 to -2 digits');
      testFormula('ROUND(3.5, 0)', {}, 4, 'ROUND 3.5 to 0 digits (round half up)');
      testFormula('ROUND(2.5, 0)', {}, 3, 'ROUND 2.5 to 0 digits (JS Math.round behavior - round half towards +Infinity)'); // Math.round(2.5) is 3
      testFormula('ROUND(1.2345, 8)', {}, 1.2345, 'ROUND 1.2345 to 8 digits');
      testFormula('ROUND(2.7,0)', {}, 3, 'ROUND 2.7 to 0 digits');
      testFormula('ROUND(2.499,0)', {}, 2, 'ROUND 2.499 to 0 digits');
      testFormula('ROUND(123.456, -1)', {}, 120, 'ROUND 123.456 to -1 digits');
      testFormulaError('ROUND("text", 2)', {}, 'Argument 1 of ROUND must be a number in ROUND("text", 2)', 'ROUND text input for arg1');
      testFormulaError('ROUND(3.14, "text")', {}, 'Argument 2 of ROUND must be a number in ROUND(3.14, "text")', 'ROUND text input for arg2');
      testFormulaError('ROUND(3.14, 1.5)', {}, 'Argument 2 of ROUND must be an integer in ROUND(3.14, 1.5)', 'ROUND non-integer num_digits');
      testFormulaError('ROUND()', {}, 'Not enough arguments 0/2 in ROUND()', 'ROUND no arguments');
      testFormulaError('ROUND(1)', {}, 'Not enough arguments 1/2 in ROUND(1)', 'ROUND one argument');
      testFormulaError('ROUND(1, 2, 3)', {}, 'Too many arguments 3/2 in ROUND(1, 2, 3)', 'ROUND too many arguments');
    });

    // SIN
    describe('SIN', () => {
      testFormula('SIN(0)', {}, 0, 'SIN 0');
      testFormula('SIN(PI()/2)', {}, 1, 'SIN PI/2');
      testFormula('SIN(PI())', {}, Math.sin(Math.PI), 'SIN PI (close to 0)');
      testFormulaError('SIN("text")', {}, 'Argument 1 of SIN must be a number in SIN("text")', 'SIN text input');
      testFormulaError('SIN()', {}, 'Not enough arguments 0/1 in SIN()', 'SIN no arguments');
      testFormulaError('SIN(1, 2)', {}, 'Too many arguments 2/1 in SIN(1, 2)', 'SIN too many arguments');
    });

    // SQRT
    describe('SQRT', () => {
      testFormula('SQRT(9)', {}, 3, 'SQRT 9');
      testFormula('SQRT(2)', {}, Math.SQRT2, 'SQRT 2');
      testFormula('SQRT(0)', {}, 0, 'SQRT 0');
      testFormulaError('SQRT(-1)', {}, 'Argument 1 of SQRT must be a non-negative number in SQRT(-1)', 'SQRT negative');
      testFormulaError('SQRT("text")', {}, 'Argument 1 of SQRT must be a number in SQRT("text")', 'SQRT text input');
      testFormulaError('SQRT()', {}, 'Not enough arguments 0/1 in SQRT()', 'SQRT no arguments');
      testFormulaError('SQRT(1, 2)', {}, 'Too many arguments 2/1 in SQRT(1, 2)', 'SQRT too many arguments');
    });

    // TAN
    describe('TAN', () => {
      testFormula('TAN(0)', {}, 0, 'TAN 0');
      testFormula('TAN(PI()/4)', {}, Math.tan(Math.PI/4), 'TAN PI/4 (close to 1)'); // Using Math.tan for precision
      testFormula('TAN(PI()/2)', {}, Math.tan(Math.PI/2), 'TAN PI/2 (large number)');
      testFormulaError('TAN("text")', {}, 'Argument 1 of TAN must be a number in TAN("text")', 'TAN text input');
      testFormulaError('TAN()', {}, 'Not enough arguments 0/1 in TAN()', 'TAN no arguments');
      testFormulaError('TAN(1, 2)', {}, 'Too many arguments 2/1 in TAN(1, 2)', 'TAN too many arguments');
    });

    // TRUNC
    describe('TRUNC', () => {
      testFormula('TRUNC(8.9)', {}, 8, 'TRUNC positive');
      testFormula('TRUNC(-8.9)', {}, -8, 'TRUNC negative');
      testFormula('TRUNC(12.345, 1)', {}, 12.3, 'TRUNC positive with num_digits');
      testFormula('TRUNC(12.345, 0)', {}, 12, 'TRUNC positive with 0 num_digits');
      testFormula('TRUNC(12.999, 2)', {}, 12.99, 'TRUNC positive with num_digits, no rounding');
      testFormula('TRUNC(123.456, -1)', {}, 120, 'TRUNC positive with negative num_digits');
      testFormula('TRUNC(123.456, -2)', {}, 100, 'TRUNC positive with large negative num_digits');
      testFormula('TRUNC(-123.456, -1)', {}, -120, 'TRUNC negative with negative num_digits');
      testFormula('TRUNC(-123.456, -2)', {}, -100, 'TRUNC negative with large negative num_digits');
      testFormula('TRUNC(456.123, -3)', {}, 0, 'TRUNC to zero');
      testFormula('TRUNC(-456.123, -3)', {}, -0, 'TRUNC to zero negative');
      testFormula('TRUNC(1.23)', {}, 1, 'TRUNC with one argument'); // num_digits defaults to 0
      testFormulaError('TRUNC("text")', {}, 'Argument 1 of TRUNC must be a number in TRUNC("text")', 'TRUNC text input for arg1');
      testFormulaError('TRUNC(12.3, "text")', {}, 'Argument 2 of TRUNC must be a number in TRUNC(12.3, "text")', 'TRUNC text input for arg2');
      testFormulaError('TRUNC(12.3, 1.5)', {}, 'Argument 2 of TRUNC must be an integer in TRUNC(12.3, 1.5)', 'TRUNC non-integer num_digits');
      testFormulaError('TRUNC()', {}, 'Not enough arguments 0/1 in TRUNC()', 'TRUNC no arguments');
      testFormulaError('TRUNC(1, 2, 3)', {}, 'Too many arguments 3/2 in TRUNC(1, 2, 3)', 'TRUNC too many arguments');
    });
  });
});



/*
Errors:

-PI()
IF(12=, "OK", "KO")

*/