// The key words glossary.
// Lessons list words in their `keywords` frontmatter; matching is case-insensitive
// against `term` and `aliases`.

export type KeyWord = {
  term: string;
  aliases?: string[];
  meaning: string;
  example?: string;
};

export const keywords: KeyWord[] = [
  { term: 'Console.WriteLine', aliases: ['WriteLine', 'WriteLine()', 'output', 'print'], meaning: 'Shows something on the screen, then moves to a new line.', example: 'Console.WriteLine("Hello");' },
  { term: 'Console.Write', aliases: ['Write', 'Write()'], meaning: 'Shows something on the screen and stays on the same line.', example: 'Console.Write("Name: ");' },
  { term: 'semicolon', aliases: [';'], meaning: 'Ends each instruction in C#, like a full stop ends a sentence.', example: 'int age = 12;' },
  { term: 'string', aliases: ['text'], meaning: 'A piece of text. It always has double speech marks around it in your code.', example: 'string name = "Sam";' },
  { term: 'char', meaning: 'A single character, in single speech marks.', example: "char grade = 'A';" },
  { term: 'int', aliases: ['integer'], meaning: 'A whole number, with no speech marks and no decimal point.', example: 'int age = 12;' },
  { term: 'double', aliases: ['decimal'], meaning: 'A number that can have a decimal point.', example: 'double price = 2.5;' },
  { term: 'bool', aliases: ['Boolean', 'true', 'false'], meaning: 'A value that is either true or false.', example: 'bool finished = false;' },
  { term: 'data type', aliases: ['type'], meaning: 'The kind of value something is, such as string, int, double or bool. In C# every variable has one, and it never changes.' },
  { term: 'variable', meaning: "A labelled box in the computer's memory that holds one value at a time. In C# you say what type of box it is when you create it.", example: 'int score = 10;' },
  { term: 'declaration', aliases: ['declare'], meaning: 'Creating a variable by giving its type and name. You only declare a variable once.', example: 'int score;' },
  { term: 'identifier', aliases: ['variable name'], meaning: "The name on a variable's label. No spaces, cannot start with a number, and capitals matter.", example: 'favouriteColour' },
  { term: 'value', meaning: 'What is stored inside a variable.' },
  { term: 'assignment', aliases: ['='], meaning: 'Putting a value into a variable with =. Read = as "is set to". The box goes on the left.', example: 'score = 10;' },
  { term: 'Console.ReadLine', aliases: ['ReadLine', 'ReadLine()', 'input'], meaning: 'Waits for the user to type something and press Enter, then gives back what they typed as a string.', example: 'string name = Console.ReadLine();' },
  { term: 'int.Parse', aliases: ['int.Parse()', 'Parse', 'Convert.ToInt32'], meaning: 'Turns text that looks like a whole number into a real int you can do maths with.', example: 'int.Parse("15") gives 15' },
  { term: 'double.Parse', aliases: ['double.Parse()'], meaning: 'Turns text that looks like a number into a double.', example: 'double.Parse("2.5") gives 2.5' },
  { term: 'ToString', aliases: ['ToString()', '.ToString()'], meaning: 'Turns a value into text.', example: '15.ToString() gives "15"' },
  { term: 'type conversion', aliases: ['casting', 'conversion', 'cast'], meaning: 'Changing a value from one data type to another, for example with int.Parse() or .ToString().' },
  { term: 'concatenation', aliases: ['joining', '+'], meaning: 'Joining pieces of text together with +. You must add your own spaces.', example: '"Hi " + name' },
  { term: 'string interpolation', aliases: ['interpolation', '$'], meaning: 'Putting variables straight into text: start the text with $ and put each variable in { }.', example: '$"Hi {name}, you are {age}"' },
  { term: 'operator', aliases: ['arithmetic operator'], meaning: 'A symbol that does a calculation: + add, - subtract, * multiply, / divide.', example: '5 * 3 + 4' },
  { term: 'integer division', aliases: ['/'], meaning: 'When both numbers are ints, / gives a whole-number answer and drops the remainder.', example: '7 / 2 is 3, but 7 / 2.0 is 3.5' },
  { term: 'order of operations', aliases: ['BIDMAS'], meaning: 'C# does brackets first, then * and /, then + and -, just like in maths.', example: '5 * 3 + 4 is 19' },
  { term: 'trace table', aliases: ['trace'], meaning: 'A table that tracks the value of each variable, line by line, as a program runs.' },
  { term: 'comment', aliases: ['//'], meaning: 'A note for humans that starts with //. C# ignores it.', example: '// work out the total' },
  { term: 'temporary variable', aliases: ['temp', 'swap'], meaning: 'A spare box used to hold a value for a moment, for example when swapping two values.', example: 'int temp = a;' },
  { term: 'compile error', aliases: ['compiler error', 'build error', 'syntax error'], meaning: 'A mistake C# finds before the program runs, such as a missing semicolon. None of the program runs until it is fixed. Each one has a code like CS1002.' },
  { term: 'runtime error', aliases: ['exception'], meaning: 'A problem that stops the program while it is running, such as int.Parse("cat").' },
  { term: 'FormatException', meaning: 'A runtime error when text cannot be converted, such as int.Parse("cat").' },
  { term: 'comparison operator', aliases: ['comparison', '==', '!='], meaning: 'Asks a true or false question: == equal, != not equal, > < >= <=.', example: 'mark >= 50' },
  { term: 'condition', meaning: 'A question whose answer is true or false. In C# it goes inside round brackets.', example: '(count > 0)' },
  { term: 'selection', aliases: ['if', 'else if', 'else', 'if / else if / else'], meaning: 'Choosing which code to run with if, else if and else. Only one branch runs.' },
  { term: 'curly braces', aliases: ['braces', '{ }', 'block'], meaning: 'Wrap the lines that belong to an if, else, for or while. They always come in pairs.' },
  { term: 'indentation', meaning: 'The spaces at the start of a line. In C# they do not change what the code does, but they make it easy to see which lines are inside the { }.' },
  { term: 'remainder', aliases: ['%', 'modulo'], meaning: 'What is left over after dividing. 7 % 2 is 1. If x % 2 == 0, x is even.', example: '7 % 3 is 1' },
  { term: 'iteration', aliases: ['loop'], meaning: 'Repeating some lines of code.' },
  { term: 'for loop', aliases: ['for'], meaning: 'A count-controlled loop. The brackets hold three parts: where to start; when to keep going; how to change each time round.', example: 'for (int i = 1; i <= 3; i++)' },
  { term: 'increment', aliases: ['++', 'i++'], meaning: 'Adding 1 to a variable. i++ means the same as i = i + 1.', example: 'count++;' },
  { term: 'decrement', aliases: ['--', 'i--'], meaning: 'Taking 1 away from a variable. i-- means the same as i = i - 1.', example: 'lives--;' },
  { term: '+= and -=', aliases: ['+=', '-='], meaning: 'Change a variable by an amount: += adds to it, -= takes away from it.', example: 'i += 2 is the same as i = i + 2' },
  { term: 'count-controlled', meaning: 'A loop that knows in advance how many times it will run (a for loop).' },
  { term: 'condition-controlled', meaning: 'A loop that keeps going until a condition becomes false (a while loop).' },
  { term: 'while loop', aliases: ['while'], meaning: 'Repeats while its condition is true. The condition is checked at the top, every time round.', example: 'while (count > 0)' },
  { term: 'infinite loop', meaning: 'A loop that never stops because its condition never becomes false.' },
  { term: 'sentinel value', aliases: ['sentinel'], meaning: 'A special value that means "I\'m done", such as "q" to quit.' },
  { term: 'validation', aliases: ['int.TryParse', 'TryParse'], meaning: 'Checking that input is sensible before using it, and asking again if it is not.' },
  { term: '&& / ||', aliases: ['&&', '||', 'and', 'or'], meaning: 'Join two conditions. && (and) needs both to be true; || (or) needs at least one.', example: 'age >= 13 && age <= 19' },
  { term: 'break', meaning: 'Jumps straight out of a loop, even if its condition is still true.', example: 'if (answer == "q") { break; }' },
  { term: 'not', aliases: ['!'], meaning: 'Turns true into false and false into true. != means "is not equal to".', example: '!finished' },
  { term: 'nesting', aliases: ['nested'], meaning: 'Putting one block inside another, such as an if inside a for loop.' },
  { term: 'list', aliases: ['List<string>', 'List<int>'], meaning: 'One variable that stores several values of the same type, in order. The type goes in < >.', example: 'List<int> scores = new List<int> { 12, 19, 7 };' },
  { term: 'item', aliases: ['element'], meaning: 'One value inside a list.' },
  { term: 'index', meaning: 'The position number of an item in a list. Counting starts at 0.', example: 'scores[0]' },
  { term: 'Add', aliases: ['Add()', '.Add()'], meaning: 'Adds one item to the end of a list.', example: 'scores.Add(25);' },
  { term: 'Insert', aliases: ['Insert()', '.Insert()'], meaning: 'Puts an item into a list at an index. The items after it shuffle along one place.', example: 'scores.Insert(1, 5);' },
  { term: 'Remove', aliases: ['Remove()', '.Remove()'], meaning: 'Takes out the first item with that value.', example: 'pets.Remove("dog");' },
  { term: 'RemoveAt', aliases: ['RemoveAt()', '.RemoveAt()'], meaning: 'Takes out the item at that index.', example: 'scores.RemoveAt(0);' },
  { term: 'Contains', aliases: ['Contains()', '.Contains()'], meaning: 'True if the list holds that value. Capitals matter.', example: 'guests.Contains("Ben")' },
  { term: 'string.Join', aliases: ['Join'], meaning: 'Joins every item of a list into one piece of text, with a separator between them.', example: 'string.Join(", ", scores) gives "12, 19, 7"' },
  { term: 'Count', aliases: ['.Count'], meaning: 'How many items are in a list. (For a string, use .Length.)', example: 'scores.Count' },
  { term: 'foreach', aliases: ['foreach loop'], meaning: 'Visits each item in a list in turn.', example: 'foreach (int s in scores)' },
  { term: 'ArgumentOutOfRangeException', aliases: ['index out of range'], meaning: 'A runtime error when you ask for an index the list does not have.' },
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
