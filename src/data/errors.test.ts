import { describe, expect, it } from 'vitest';
import { findError } from './errors';

// Messages exactly as the in-browser runner (.NET 10, Roslyn 4.14) reports them.
// The dev page /dev/runner/ produces each of these from a real program.
const cases: [string, string, string][] = [
  ['CS1002', '; expected', 'cs1002-semicolon'],
  ['CS0103', "The name 'console' does not exist in the current context", 'cs0103-name'],
  ['CS0103', "The name 'Hello' does not exist in the current context", 'cs0103-name'],
  ['CS0117', "'Console' does not contain a definition for 'Writeline'", 'cs0117-member'],
  ['CS0029', "Cannot implicitly convert type 'int' to 'bool'", 'cs0029-if-equals'],
  ['CS0029', "Cannot implicitly convert type 'string' to 'int'", 'cs0029-string-to-int'],
  ['CS0029', "Cannot implicitly convert type 'int' to 'string'", 'cs0029-general'],
  ['CS0266', "Cannot implicitly convert type 'double' to 'int'. An explicit conversion exists (are you missing a cast?)", 'cs0266-double-to-int'],
  ['CS0019', "Operator '-' cannot be applied to operands of type 'string' and 'int'", 'cs0019-operator'],
  ['CS0019', "Operator '>=' cannot be applied to operands of type 'string' and 'int'", 'cs0019-operator'],
  ['CS1503', "Argument 1: cannot convert from 'int' to 'System.ReadOnlySpan<byte>'", 'cs1503-argument'],
  ['CS0128', "A local variable or function named 'score' is already defined in this scope", 'cs0128-declared-twice'],
  ['CS0165', "Use of unassigned local variable 'total'", 'cs0165-unassigned'],
  ['CS0201', 'Only assignment, call, increment, decrement, await, and new object expressions can be used as a statement', 'cs0201-not-a-statement'],
  ['CS1010', 'Newline in constant', 'cs1010-string'],
  ['CS1026', ') expected', 'cs1026-brackets'],
  ['CS1513', '} expected', 'cs1513-braces'],
  ['CS1003', "Syntax error, ',' expected", 'cs1003-syntax'],
  ['CS1525', "Invalid expression term ')'", 'cs1003-syntax'],
  ['CS0136', "A local or parameter named 'i' cannot be declared in this scope", 'compile-general'],
  ['CS5001', "There's no code to run yet. Type your code in the box.", 'cs5001-empty'],
  ['FormatException', "The input string 'seven' was not in a correct format.", 'formatexception'],
  ['OverflowException', 'Value was either too large or too small for an Int32.', 'overflowexception'],
  ['ArgumentNullException', "Value cannot be null. (Parameter 's')", 'argumentnullexception'],
  ['NullReferenceException', 'Object reference not set to an instance of an object.', 'nullreferenceexception'],
  ['ArgumentOutOfRangeException', "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", 'argumentoutofrange-index'],
  ['IndexOutOfRangeException', 'Index was outside the bounds of the array.', 'indexoutofrange'],
  ['InvalidOperationException', 'Collection was modified; enumeration operation may not execute.', 'collection-modified'],
  ['DivideByZeroException', 'Attempted to divide by zero.', 'dividebyzero'],
];

describe('findError', () => {
  it.each(cases)('%s: %s', (type, message, id) => {
    expect(findError(type, message)?.id).toBe(id);
  });
});
