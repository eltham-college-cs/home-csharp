// The key words glossary. `year` is the year the word is introduced.
// Lessons list words in their `keywords` frontmatter; matching is case-insensitive
// against `term` and `aliases`.

export type KeyWord = {
  term: string;
  aliases?: string[];
  year: 7 | 8;
  meaning: string;
  example?: string;
};

export const keywords: KeyWord[] = [
  { term: 'Console.WriteLine', aliases: ['WriteLine', 'WriteLine()', 'output', 'print'], year: 7, meaning: 'Shows something on the screen, then moves to a new line.', example: 'Console.WriteLine("Hello");' },
  { term: 'Console.Write', aliases: ['Write', 'Write()'], year: 7, meaning: 'Shows something on the screen and stays on the same line.', example: 'Console.Write("Name: ");' },
  { term: 'semicolon', aliases: [';'], year: 7, meaning: 'Ends each instruction in C#, like a full stop ends a sentence.', example: 'int age = 12;' },
  { term: 'string', aliases: ['text'], year: 7, meaning: 'A piece of text. It always has double speech marks around it in your code.', example: 'string name = "Sam";' },
  { term: 'char', year: 7, meaning: 'A single character, in single speech marks.', example: "char grade = 'A';" },
  { term: 'int', aliases: ['integer'], year: 7, meaning: 'A whole number, with no speech marks and no decimal point.', example: 'int age = 12;' },
  { term: 'double', aliases: ['decimal'], year: 7, meaning: 'A number that can have a decimal point.', example: 'double price = 2.5;' },
  { term: 'bool', aliases: ['Boolean', 'true', 'false'], year: 7, meaning: 'A value that is either true or false.', example: 'bool finished = false;' },
  { term: 'data type', aliases: ['type'], year: 7, meaning: 'The kind of value something is, such as string, int, double or bool. In C# every variable has one, and it never changes.' },
  { term: 'variable', year: 7, meaning: "A labelled box in the computer's memory that holds one value at a time. In C# you say what type of box it is when you create it.", example: 'int score = 10;' },
  { term: 'declaration', aliases: ['declare'], year: 7, meaning: 'Creating a variable by giving its type and name. You only declare a variable once.', example: 'int score;' },
  { term: 'identifier', aliases: ['variable name'], year: 7, meaning: "The name on a variable's label. No spaces, cannot start with a number, and capitals matter.", example: 'favouriteColour' },
  { term: 'value', year: 7, meaning: 'What is stored inside a variable.' },
  { term: 'assignment', aliases: ['='], year: 7, meaning: 'Putting a value into a variable with =. Read = as "is set to". The box goes on the left.', example: 'score = 10;' },
  { term: 'Console.ReadLine', aliases: ['ReadLine', 'ReadLine()', 'input'], year: 7, meaning: 'Waits for the user to type something and press Enter, then gives back what they typed as a string.', example: 'string name = Console.ReadLine();' },
  { term: 'int.Parse', aliases: ['int.Parse()', 'Parse', 'Convert.ToInt32'], year: 7, meaning: 'Turns text that looks like a whole number into a real int you can do maths with.', example: 'int.Parse("15") gives 15' },
  { term: 'double.Parse', aliases: ['double.Parse()'], year: 7, meaning: 'Turns text that looks like a number into a double.', example: 'double.Parse("2.5") gives 2.5' },
  { term: 'ToString', aliases: ['ToString()', '.ToString()'], year: 7, meaning: 'Turns a value into text.', example: '15.ToString() gives "15"' },
  { term: 'type conversion', aliases: ['casting', 'conversion', 'cast'], year: 7, meaning: 'Changing a value from one data type to another, for example with int.Parse() or .ToString().' },
  { term: 'concatenation', aliases: ['joining', '+'], year: 7, meaning: 'Joining pieces of text together with +. You must add your own spaces.', example: '"Hi " + name' },
  { term: 'string interpolation', aliases: ['interpolation', '$'], year: 7, meaning: 'Putting variables straight into text: start the text with $ and put each variable in { }.', example: '$"Hi {name}, you are {age}"' },
  { term: 'operator', aliases: ['arithmetic operator'], year: 7, meaning: 'A symbol that does a calculation: + add, - subtract, * multiply, / divide.', example: '5 * 3 + 4' },
  { term: 'integer division', aliases: ['/'], year: 7, meaning: 'When both numbers are ints, / gives a whole-number answer and drops the remainder.', example: '7 / 2 is 3, but 7 / 2.0 is 3.5' },
  { term: 'order of operations', aliases: ['BIDMAS'], year: 7, meaning: 'C# does brackets first, then * and /, then + and -, just like in maths.', example: '5 * 3 + 4 is 19' },
  { term: 'trace table', aliases: ['trace'], year: 7, meaning: 'A table that tracks the value of each variable, line by line, as a program runs.' },
  { term: 'comment', aliases: ['//'], year: 7, meaning: 'A note for humans that starts with //. C# ignores it.', example: '// work out the total' },
  { term: 'temporary variable', aliases: ['temp', 'swap'], year: 7, meaning: 'A spare box used to hold a value for a moment, for example when swapping two values.', example: 'int temp = a;' },
  { term: 'compile error', aliases: ['compiler error', 'build error', 'syntax error'], year: 7, meaning: 'A mistake C# finds before the program runs, such as a missing semicolon. None of the program runs until it is fixed. Each one has a code like CS1002.' },
  { term: 'runtime error', aliases: ['exception'], year: 7, meaning: 'A problem that stops the program while it is running, such as int.Parse("cat").' },
  { term: 'FormatException', year: 7, meaning: 'A runtime error when text cannot be converted, such as int.Parse("cat").' },
  { term: 'comparison operator', aliases: ['comparison', '==', '!='], year: 8, meaning: 'Asks a true or false question: == equal, != not equal, > < >= <=.', example: 'mark >= 50' },
  { term: 'condition', year: 8, meaning: 'A question whose answer is true or false. In C# it goes inside round brackets.', example: '(count > 0)' },
  { term: 'selection', aliases: ['if', 'else if', 'else', 'if / else if / else'], year: 8, meaning: 'Choosing which code to run with if, else if and else. Only one branch runs.' },
  { term: 'curly braces', aliases: ['braces', '{ }', 'block'], year: 8, meaning: 'Wrap the lines that belong to an if, else, for or while. They always come in pairs.' },
  { term: 'indentation', year: 8, meaning: 'The spaces at the start of a line. In C# they do not change what the code does, but they make it easy to see which lines are inside the { }.' },
  { term: 'remainder', aliases: ['%', 'modulo'], year: 8, meaning: 'What is left over after dividing. 7 % 2 is 1. If x % 2 == 0, x is even.', example: '7 % 3 is 1' },
  { term: 'iteration', aliases: ['loop'], year: 8, meaning: 'Repeating some lines of code.' },
  { term: 'for loop', aliases: ['for'], year: 8, meaning: 'A count-controlled loop. The brackets hold three parts: where to start; when to keep going; how to change each time round.', example: 'for (int i = 1; i <= 3; i++)' },
  { term: 'increment', aliases: ['++', 'i++'], year: 8, meaning: 'Adding 1 to a variable. i++ means the same as i = i + 1.', example: 'count++;' },
  { term: 'count-controlled', year: 8, meaning: 'A loop that knows in advance how many times it will run (a for loop).' },
  { term: 'condition-controlled', year: 8, meaning: 'A loop that keeps going until a condition becomes false (a while loop).' },
  { term: 'while loop', aliases: ['while'], year: 8, meaning: 'Repeats while its condition is true. The condition is checked at the top, every time round.', example: 'while (count > 0)' },
  { term: 'infinite loop', year: 8, meaning: 'A loop that never stops because its condition never becomes false.' },
  { term: 'sentinel value', aliases: ['sentinel'], year: 8, meaning: 'A special value that means "I\'m done", such as "q" to quit.' },
  { term: 'validation', aliases: ['int.TryParse', 'TryParse'], year: 8, meaning: 'Checking that input is sensible before using it, and asking again if it is not.' },
  { term: '&& / ||', aliases: ['&&', '||', 'and', 'or'], year: 8, meaning: 'Join two conditions. && (and) needs both to be true; || (or) needs at least one.', example: 'age >= 13 && age <= 19' },
  { term: 'nesting', aliases: ['nested'], year: 8, meaning: 'Putting one block inside another, such as an if inside a for loop.' },
  { term: 'list', aliases: ['List<string>', 'List<int>'], year: 8, meaning: 'One variable that stores several values of the same type, in order. The type goes in < >.', example: 'List<int> scores = new List<int> { 12, 19, 7 };' },
  { term: 'item', aliases: ['element'], year: 8, meaning: 'One value inside a list.' },
  { term: 'index', year: 8, meaning: 'The position number of an item in a list. Counting starts at 0.', example: 'scores[0]' },
  { term: 'Add', aliases: ['Add()', '.Add()'], year: 8, meaning: 'Adds one item to the end of a list.', example: 'scores.Add(25);' },
  { term: 'Count', aliases: ['.Count'], year: 8, meaning: 'How many items are in a list. (For a string, use .Length.)', example: 'scores.Count' },
  { term: 'foreach', aliases: ['foreach loop'], year: 8, meaning: 'Visits each item in a list in turn.', example: 'foreach (int s in scores)' },
  { term: 'ArgumentOutOfRangeException', aliases: ['index out of range'], year: 8, meaning: 'A runtime error when you ask for an index the list does not have.' },
];

export const termSlug = (term: string) =>
  term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'symbol';

export function findKeyword(word: string): KeyWord | undefined {
  const w = word.toLowerCase();
  return keywords.find((k) => k.term.toLowerCase() === w || k.aliases?.some((a) => a.toLowerCase() === w));
}
