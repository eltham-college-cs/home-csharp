// The error decoder. Each entry explains one error in plain English.
// `match` is tested against "Code: message", for example
//   "CS1002: ; expected"                                     (compile error: the code never ran)
//   "FormatException: The input string 'seven' was not ..."  (runtime error: it ran, then stopped)
// The first match wins, so keep specific entries above general ones.
// Messages are exactly as .NET 10 / Roslyn print them (see the cases in errors.test.ts).

export type ErrorEntry = {
  id: string;
  name: string;
  /** What C# prints (shortened). */
  looksLike: string;
  match: RegExp;
  meaning: string;
  broken: string;
  fixed: string;
  check: string[];
};

export const errors: ErrorEntry[] = [
  // ---- Compile errors: C# couldn't build the program, so none of it ran ----
  {
    id: 'cs1002-semicolon',
    name: 'Missing semicolon',
    looksLike: 'CS1002: ; expected',
    match: /^CS1002:/,
    meaning:
      'In C#, every instruction ends with a semicolon ;, like a full stop at the end of a sentence. C# reached the end of a line and the semicolon was missing.',
    broken: 'Console.WriteLine("Hello")\nConsole.WriteLine("Bye");',
    fixed: 'Console.WriteLine("Hello");\nConsole.WriteLine("Bye");',
    check: [
      'Look at the end of the line the error names, and the line just before it.',
      'Lines that end with { or } do not need a semicolon.',
    ],
  },
  {
    id: 'cs0103-name',
    name: "C# doesn't know that name",
    looksLike: "CS0103: The name 'score' does not exist in the current context",
    match: /^CS0103:/,
    meaning:
      "C# looked for something with this name and couldn't find it. Usually it is a spelling slip, a capital letter (console instead of Console), a variable you haven't created yet, or text that is missing its speech marks.",
    broken: 'int score = 10;\nconsole.WriteLine(Score);\nConsole.WriteLine(Hello);',
    fixed: 'int score = 10;\nConsole.WriteLine(score);\nConsole.WriteLine("Hello");',
    check: [
      'Is the name spelt exactly the same, with the same capitals, everywhere? Console always has a capital C.',
      'Is it meant to be text? Then it needs speech marks.',
      'Did you create the variable (int score = …) before this line?',
      'Was the variable created inside { } further up? It only exists inside those braces.',
    ],
  },
  {
    id: 'cs0117-member',
    name: 'Capital letters in a method name',
    looksLike: "CS0117: 'Console' does not contain a definition for 'Writeline'",
    match: /^CS0117:/,
    meaning:
      'The part after the dot is not spelt the way C# expects. Capital letters count: it is WriteLine with a capital L, and ReadLine with a capital L.',
    broken: 'Console.Writeline("Hi");\nstring name = Console.readLine();',
    fixed: 'Console.WriteLine("Hi");\nstring name = Console.ReadLine();',
    check: ['Copy the spelling from a line that works: WriteLine, Write, ReadLine.', 'Each new word starts with a capital letter.'],
  },
  {
    id: 'cs0029-if-equals',
    name: '= where you meant ==',
    looksLike: "CS0029: Cannot implicitly convert type 'int' to 'bool'",
    match: /^CS0029: Cannot implicitly convert type '(int|string|double|char)' to 'bool'/,
    meaning:
      'An if or while needs a question with a true or false answer. One = puts a value in a box; two == asks "are these equal?".',
    broken: 'if (answer = 5)\n{\n    Console.WriteLine("Correct");\n}',
    fixed: 'if (answer == 5)\n{\n    Console.WriteLine("Correct");\n}',
    check: ['Inside if ( ) and while ( ), use == to compare.'],
  },
  {
    id: 'cs0029-string-to-int',
    name: 'Putting text in a number box',
    looksLike: "CS0029: Cannot implicitly convert type 'string' to 'int'",
    match: /^CS0029: Cannot implicitly convert type 'string' to '(int|double)'/,
    meaning:
      'An int box can only hold whole numbers, but you tried to put text in it. Console.ReadLine() always gives you text, even if someone types 12. Convert it first with int.Parse().',
    broken: 'int age = Console.ReadLine();',
    fixed: 'int age = int.Parse(Console.ReadLine());',
    check: [
      'Wrap Console.ReadLine() in int.Parse( ) for whole numbers, or double.Parse( ) for decimals.',
      'Count the brackets: int.Parse(Console.ReadLine()) ends with two ).',
    ],
  },
  {
    id: 'cs0029-general',
    name: 'The value is the wrong type for the box',
    looksLike: "CS0029: Cannot implicitly convert type 'int' to 'string'",
    match: /^CS0029:/,
    meaning:
      'Every C# variable has a type, and it can only hold that kind of value: int holds whole numbers, string holds text, bool holds true or false. You tried to put a different kind of value in.',
    broken: 'string total = 5 + 3;',
    fixed: 'int total = 5 + 3;',
    check: ['Look at the type before the name. Does the value on the right fit it?', 'To turn a number into text, use .ToString().'],
  },
  {
    id: 'cs0266-double-to-int',
    name: 'A decimal will not fit in an int',
    looksLike: "CS0266: Cannot implicitly convert type 'double' to 'int'",
    match: /^CS0266: Cannot implicitly convert type 'double' to 'int'/,
    meaning:
      "An int can only hold whole numbers. The answer on the right is a double (it might have a decimal part), and C# won't throw away the decimal part without being told.",
    broken: 'int half = 7 / 2.0;',
    fixed: 'double half = 7 / 2.0;',
    check: ['If the answer can have a decimal point, make the variable a double.'],
  },
  {
    id: 'cs0019-operator',
    name: 'Doing maths or comparing with text',
    looksLike: "CS0019: Operator '-' cannot be applied to operands of type 'string' and 'int'",
    match: /^CS0019:/,
    meaning:
      'One side is text (a string) and the other is a number. You cannot take away from text, or ask if text is bigger than a number. The text usually came from Console.ReadLine().',
    broken: 'string money = Console.ReadLine();\nConsole.WriteLine(money - 2);',
    fixed: 'int money = int.Parse(Console.ReadLine());\nConsole.WriteLine(money - 2);',
    check: ['Find the variable that should be a number and convert it with int.Parse().'],
  },
  {
    id: 'cs1503-argument',
    name: 'The wrong kind of value in the brackets',
    looksLike: "CS1503: Argument 1: cannot convert from 'int' to 'string'",
    match: /^CS1503:/,
    meaning:
      "The value inside the brackets isn't the type this method needs. For example, int.Parse( ) needs text to turn into a number: giving it a number doesn't make sense.",
    broken: 'int x = int.Parse(5);',
    fixed: 'int x = 5;',
    check: ['What type does the method need? int.Parse needs a string, such as Console.ReadLine().'],
  },
  {
    id: 'cs0128-declared-twice',
    name: 'Variable created twice',
    looksLike: "CS0128: A local variable or function named 'score' is already defined in this scope",
    match: /^CS0128:/,
    meaning:
      'You can only create a variable once. Putting the type (int, string…) at the start creates a new one. To change the value later, leave the type off.',
    broken: 'int score = 0;\nint score = score + 5;',
    fixed: 'int score = 0;\nscore = score + 5;',
    check: ['Only the first line that uses a variable has int, string, double or bool in front.'],
  },
  {
    id: 'cs0165-unassigned',
    name: 'Variable used before it has a value',
    looksLike: "CS0165: Use of unassigned local variable 'total'",
    match: /^CS0165:/,
    meaning:
      'You created the variable but never put a value in it, then tried to use it. C# makes you give every variable a starting value first.',
    broken: 'int total;\ntotal = total + 5;',
    fixed: 'int total = 0;\ntotal = total + 5;',
    check: ['Give the variable a starting value when you create it, for example = 0 or = "".'],
  },
  {
    id: 'cs0201-not-a-statement',
    name: 'A line that does nothing',
    looksLike: 'CS0201: Only assignment, call, increment, decrement … can be used as a statement',
    match: /^CS0201:/,
    meaning:
      'This line works something out but does nothing with the answer. Often it is == where you meant = (to set a value), or a sum that is not stored anywhere.',
    broken: 'int lives = 3;\nlives == lives - 1;',
    fixed: 'int lives = 3;\nlives = lives - 1;',
    check: ['To change a variable, use one =.', 'Is the answer being stored or printed?'],
  },
  {
    id: 'cs1010-string',
    name: 'Speech marks not closed',
    looksLike: 'CS1010: Newline in constant',
    match: /^CS1010:/,
    meaning: 'A piece of text was opened with " but never closed before the end of the line. Every opening speech mark needs a closing one.',
    broken: 'Console.WriteLine("Hello);',
    fixed: 'Console.WriteLine("Hello");',
    check: ['Count the speech marks on the line. There should be an even number.'],
  },
  {
    id: 'cs1026-brackets',
    name: 'Missing bracket',
    looksLike: 'CS1026: ) expected',
    match: /^CS1026:/,
    meaning:
      'Every ( needs a matching ). With int.Parse(Console.ReadLine()) you need two closing brackets: one for ReadLine() and one for Parse().',
    broken: 'int age = int.Parse(Console.ReadLine();',
    fixed: 'int age = int.Parse(Console.ReadLine());',
    check: ['Count the ( and the ) on the line. They should match.'],
  },
  {
    id: 'cs1513-braces',
    name: 'Curly braces that do not match',
    looksLike: 'CS1513: } expected',
    match: /^CS151[34]:/,
    meaning:
      'Curly braces { } go in pairs and wrap the lines that belong to an if, else, for or while. One of them has no partner. C# often only notices at the very end of the program.',
    broken: 'if (age >= 13)\n{\n    Console.WriteLine("Teen");\n',
    fixed: 'if (age >= 13)\n{\n    Console.WriteLine("Teen");\n}',
    check: [
      'Count the { and the } in your whole program. They should match.',
      'Line them up: each } sits straight below its {.',
    ],
  },
  {
    id: 'cs1003-syntax',
    name: "C# can't read the line",
    looksLike: "CS1003: Syntax error, ',' expected",
    match: /^CS(1003|1525|1001|1022|1519|0116|1031|1056|8124|1012):/,
    meaning:
      'Something on this line (or the line just before it) is not written the way C# expects. Look for a missing bracket, speech mark, comma or semicolon, or a stray symbol.',
    broken: 'Console.WriteLine("Score: " score);',
    fixed: 'Console.WriteLine("Score: " + score);',
    check: ['Check the line the error points to, and the line above it.', 'Joining text and a variable? Put + between them.'],
  },
  {
    id: 'cs5001-empty',
    name: 'Nothing to run',
    looksLike: "CS5001: There's no code to run yet.",
    match: /^CS5001:/,
    meaning: 'Your program has no instructions in it yet, so there is nothing for C# to run. Write at least one line of code.',
    broken: '',
    fixed: 'Console.WriteLine("Hello!");',
    check: ['Is the code box empty, or does it only have comments (lines starting with //)?'],
  },
  {
    id: 'compile-general',
    name: "Your code didn't build",
    looksLike: 'CSxxxx: …',
    match: /^CS\d{4}:/,
    meaning:
      'C# checks the whole program before it runs any of it. It found a problem on the line it names. The message is often technical: look at that line, and the line above it, for a small slip.',
    broken: 'Console.WriteLine("Hi")\nconsole.writeline("Bye");',
    fixed: 'Console.WriteLine("Hi");\nConsole.WriteLine("Bye");',
    check: [
      'Fix the first error first. The others often disappear with it.',
      'Check semicolons, capital letters, brackets and speech marks.',
    ],
  },

  // ---- Runtime errors: the program started, then stopped ----
  {
    id: 'formatexception',
    name: "int.Parse() can't turn this into a number",
    looksLike: "FormatException: The input string 'seven' was not in a correct format.",
    match: /^FormatException:/,
    meaning:
      'int.Parse() can only convert text that looks like a whole number, such as "12". It cannot convert words like "seven", decimals like "2.5", or an empty answer.',
    broken: 'int number = int.Parse("seven");',
    fixed: 'int number = int.Parse("7");',
    check: [
      'When you run the program, type digits, not words.',
      'Decimal number? Use double.Parse() and a double variable.',
    ],
  },
  {
    id: 'overflowexception',
    name: 'Number too big for an int',
    looksLike: 'OverflowException: Value was either too large or too small for an Int32.',
    match: /^OverflowException:/,
    meaning: 'An int can only hold numbers up to about 2 billion (2,147,483,647). The number was bigger than that.',
    broken: 'int big = int.Parse("99999999999");',
    fixed: 'long big = long.Parse("99999999999");',
    check: ['Did you mean to type such a big number?'],
  },
  {
    id: 'argumentnullexception',
    name: 'Asked for more input than there is',
    looksLike: "ArgumentNullException: Value cannot be null. (Parameter 's')",
    match: /^ArgumentNullException:/,
    meaning:
      'Console.ReadLine() found nothing left to read and gave back null (nothing at all), which int.Parse() cannot convert. The program asks for more answers than the test gives: there is an extra ReadLine(), or one inside a loop that keeps going.',
    broken: 'string name = Console.ReadLine();\nint age = int.Parse(Console.ReadLine());\nint year = int.Parse(Console.ReadLine());',
    fixed: 'string name = Console.ReadLine();\nint age = int.Parse(Console.ReadLine());',
    check: ['Count your Console.ReadLine() calls. Does the task ask for that many?', 'If ReadLine() is inside a loop, does the loop stop?'],
  },
  {
    id: 'nullreferenceexception',
    name: 'Using something that is empty (null)',
    looksLike: 'NullReferenceException: Object reference not set to an instance of an object.',
    match: /^NullReferenceException:/,
    meaning:
      'A variable held null, which means "nothing at all", and you tried to use it. In these lessons it nearly always means Console.ReadLine() ran out of answers to read.',
    broken: 'string a = Console.ReadLine();\nstring b = Console.ReadLine();\nConsole.WriteLine(b.ToUpper());',
    fixed: 'string a = Console.ReadLine();\nConsole.WriteLine(a.ToUpper());',
    check: ['Count your Console.ReadLine() calls. Does the task ask for that many?'],
  },
  {
    id: 'argumentoutofrange-index',
    name: 'Index out of range',
    looksLike: "ArgumentOutOfRangeException: Index was out of range. … (Parameter 'index')",
    match: /^ArgumentOutOfRangeException:.*[Ii]ndex/,
    meaning:
      'You asked for a position in the list that does not exist. Positions start at 0, so a list of 3 items has positions 0, 1 and 2. Position 3 is off the end.',
    broken: 'List<string> pets = new List<string> { "cat", "dog", "fish" };\nConsole.WriteLine(pets[3]);',
    fixed: 'List<string> pets = new List<string> { "cat", "dog", "fish" };\nConsole.WriteLine(pets[2]);',
    check: [
      'The last position is pets.Count - 1.',
      'In a for loop over a list, use i < pets.Count, not i <= pets.Count.',
    ],
  },
  {
    id: 'indexoutofrange',
    name: 'Index outside the text or array',
    looksLike: 'IndexOutOfRangeException: Index was outside the bounds of the array.',
    match: /^IndexOutOfRangeException:/,
    meaning:
      'You asked for a position that does not exist. Positions start at 0, so the word "cat" has positions 0, 1 and 2.',
    broken: 'string word = "cat";\nConsole.WriteLine(word[3]);',
    fixed: 'string word = "cat";\nConsole.WriteLine(word[2]);',
    check: ['The last position is word.Length - 1.'],
  },
  {
    id: 'collection-modified',
    name: 'Changing a list while looping through it',
    looksLike: 'InvalidOperationException: Collection was modified; enumeration operation may not execute.',
    match: /^InvalidOperationException: Collection was modified/,
    meaning:
      "foreach walks through a list one item at a time, and the list must not change while it does. You added or removed items inside the loop.",
    broken: 'foreach (string pet in pets)\n{\n    if (pet == "dog")\n    {\n        pets.Remove(pet);\n    }\n}',
    fixed: 'pets.Remove("dog");',
    check: ['Make the change before or after the loop.', 'Or use a for loop that counts down from the end.'],
  },
  {
    id: 'dividebyzero',
    name: 'Dividing by zero',
    looksLike: 'DivideByZeroException: Attempted to divide by zero.',
    match: /^DivideByZeroException:/,
    meaning: 'Nothing can be divided into zero groups, so C# stops. The number after / was 0 when this line ran.',
    broken: 'int people = 0;\nConsole.WriteLine(12 / people);',
    fixed: 'int people = 4;\nConsole.WriteLine(12 / people);',
    check: ['Which variable is after the /? What value does it have on this line?'],
  },
  {
    id: 'integer-division',
    name: 'Division gives the wrong answer',
    looksLike: '7 / 2 prints 3',
    match: /^$/,
    meaning:
      'Not an error message, but a classic surprise: when both numbers are ints, / gives a whole-number answer and throws away the remainder. 7 / 2 is 3. If either number is a double, you get 3.5.',
    broken: 'int total = 7;\nConsole.WriteLine(total / 2);',
    fixed: 'int total = 7;\nConsole.WriteLine(total / 2.0);',
    check: ['Need a decimal answer? Make one of the numbers a double, for example 2.0.'],
  },
  {
    id: 'never-finished',
    name: "The program didn't finish",
    looksLike: "Your program didn't finish. Is something repeating forever?",
    match: /^Timeout$/,
    meaning:
      'This is an infinite loop: the loop condition never becomes false. Every loop needs a start value, a condition, and an update that moves towards the exit.',
    broken: 'int count = 5;\nwhile (count > 0)\n{\n    Console.WriteLine(count);\n}',
    fixed: 'int count = 5;\nwhile (count > 0)\n{\n    Console.WriteLine(count);\n    count = count - 1;\n}',
    check: [
      'Does the body change the variable in the condition?',
      'Does it change it in the right direction?',
      'Is the update inside the { } of the loop?',
      'Can the condition ever be false?',
    ],
  },
];

/** Build errors stop the program before it starts; runtime errors stop it part-way through. */
export function errorKind(e: ErrorEntry): 'build' | 'runtime' {
  return e.match.source.startsWith('^CS') ? 'build' : 'runtime';
}

/** Find the decoder entry for an error (a compile error code or an exception type), if there is one. */
export function findError(type: string, message: string): ErrorEntry | undefined {
  const text = `${type}: ${message}`;
  return errors.find((e) => e.match.test(text));
}
