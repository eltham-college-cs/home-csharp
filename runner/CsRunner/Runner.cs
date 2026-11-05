using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

[assembly: SupportedOSPlatform("browser")]

namespace CsRunner;

public static class Program
{
    // Required by an Exe project; the worker calls the [JSExport] methods instead.
    public static void Main() { }
}

/// <summary>
/// Compiles and runs a student's C# program. Called from the Web Worker through [JSExport].
/// Results go back to JavaScript as JSON strings (camelCase).
/// </summary>
public static partial class Runner
{
    /// <summary>Same as the Python site: more than this many characters counts as "never finished".</summary>
    const int MaxOutputChars = 100_000;

    // Students write top-level statements, so give them the usings a normal console app gets.
    const string GlobalUsings = """
        global using System;
        global using System.Collections.Generic;
        global using System.Linq;
        """;

    // Added to the version of the program that runs (never to the one that reports compile errors).
    //  - __Trace.Line is set before every statement, so a runtime error can name its line.
    //  - Random in the global namespace hides System.Random, so `new Random()` is seeded and a
    //    re-run after typing an answer replays the same numbers (as the Python site does).
    const string RunSupport = """
        static class __Trace
        {
            public static int Line;
            public static int Seed;
            public static int Made;
            public static Random SharedRandom;
        }

        class Random : System.Random
        {
            public Random() : base(__Trace.Seed + 7919 * __Trace.Made++) { }
            public Random(int seed) : base(seed) { }
            public static new Random Shared => __Trace.SharedRandom ??= new Random();
        }
        """;

    static readonly CSharpParseOptions Parse = new(LanguageVersion.Latest);

    static List<MetadataReference>? _references;
    static byte[]? _assembly;

    static List<MetadataReference> References()
    {
        if (_references != null) return _references;
        var asm = typeof(Runner).Assembly;
        _references = asm.GetManifestResourceNames()
            .Where(n => n.StartsWith("ref/"))
            .Select(n =>
            {
                using var s = asm.GetManifestResourceStream(n)!;
                using var ms = new MemoryStream();
                s.CopyTo(ms);
                return (MetadataReference)MetadataReference.CreateFromImage(ms.ToArray());
            })
            .ToList();
        return _references;
    }

    static CSharpCompilation NewCompilation(params SyntaxTree[] trees) =>
        CSharpCompilation.Create(
            "StudentProgram",
            trees,
            References(),
            new CSharpCompilationOptions(OutputKind.ConsoleApplication)
                .WithOptimizationLevel(OptimizationLevel.Debug)
                // Beginners use Console.ReadLine() as a plain string; hide nullable noise.
                .WithNullableContextOptions(NullableContextOptions.Disable)
                .WithConcurrentBuild(false));

    /// <summary>Compiles the program. Returns {ok, ms, errors:[{line, column, code, message}]}.</summary>
    [JSExport]
    public static string Compile(string code)
    {
        var sw = Stopwatch.StartNew();
        _assembly = null;

        var studentTree = CSharpSyntaxTree.ParseText(code, Parse, path: "Program.cs");
        var usingsTree = CSharpSyntaxTree.ParseText(GlobalUsings, Parse, path: "GlobalUsings.cs");

        // 1. Compile exactly what the student wrote, so error positions match their code.
        //    No PDB: Roslyn's PDB writer blocks on a Task, which single-threaded WebAssembly cannot do.
        using var pe = new MemoryStream();
        var result = NewCompilation(usingsTree, studentTree).Emit(pe);

        var errors = result.Diagnostics
            .Where(d => d.Severity == DiagnosticSeverity.Error)
            .OrderBy(d => d.Location.SourceSpan.Start)
            .Select(d =>
            {
                var span = d.Location.GetLineSpan();
                return new CompileError(span.StartLinePosition.Line + 1, span.StartLinePosition.Character + 1, d.Id, d.GetMessage());
            })
            .ToList();

        if (result.Success)
        {
            // 2. Build the version that actually runs: the same code plus line markers and seeded Random.
            //    If that fails for any reason (say the student wrote their own class Random),
            //    fall back to the plain build: everything still works except line numbers and seeding.
            _assembly = pe.ToArray();
            var instrumented = CSharpSyntaxTree.Create(
                (CSharpSyntaxNode)new LineMarker().Visit(studentTree.GetRoot()), Parse, "Program.cs");
            var supportTree = CSharpSyntaxTree.ParseText(RunSupport, Parse, path: "RunSupport.cs");
            using var pe2 = new MemoryStream();
            if (NewCompilation(usingsTree, instrumented, supportTree).Emit(pe2).Success)
                _assembly = pe2.ToArray();
        }

        return JsonSerializer.Serialize(new CompileResult(result.Success, sw.ElapsedMilliseconds, errors), RunnerJson.Default.CompileResult);
    }

    /// <summary>
    /// Runs the last compiled program.
    /// <paramref name="input"/>: one line per Console.ReadLine(), joined with \n.
    /// <paramref name="interactive"/>: when the lines run out, stop with needInput (the page asks
    /// and runs again). Otherwise ReadLine() returns null, as a real console does at end of input.
    /// </summary>
    [JSExport]
    public static string Run(string input, bool interactive, int seed)
    {
        if (_assembly == null)
            return Serialize(new RunResult([], 0, false, false, new RunError("NotCompiled", "Compile first.", null)));

        var sw = Stopwatch.StartNew();
        var record = new Recording(MaxOutputChars);
        var oldOut = Console.Out;
        Console.SetOut(new RecordingWriter(record));
        Console.SetIn(new ScriptedReader(input, interactive, record));

        RunError? error = null;
        bool needsInput = false, tooMuch = false;
        Assembly? asm = null;
        try
        {
            // A fresh load each run resets any static state from the previous run.
            asm = Assembly.Load(_assembly);
            asm.GetType("__Trace")?.GetField("Seed")?.SetValue(null, seed);
            var entry = asm.EntryPoint!;
            var args = entry.GetParameters().Length == 0 ? null : new object[] { Array.Empty<string>() };
            entry.Invoke(null, args);
        }
        catch (TargetInvocationException tie) when (tie.InnerException is NeedsInputException)
        {
            needsInput = true;
        }
        catch (TargetInvocationException tie) when (tie.InnerException is TooMuchOutputException)
        {
            tooMuch = true;
        }
        catch (TargetInvocationException tie) when (tie.InnerException != null)
        {
            var ex = tie.InnerException;
            error = new RunError(ex.GetType().Name, ex.Message, CurrentLine(asm));
        }
        catch (Exception ex)
        {
            error = new RunError(ex.GetType().Name, ex.Message, null);
        }
        finally
        {
            record.Flush();
            Console.SetOut(oldOut);
            Console.SetIn(TextReader.Null);
        }

        return Serialize(new RunResult(record.Segments, sw.ElapsedMilliseconds, needsInput, tooMuch, error));
    }

    static string Serialize(RunResult r) => JsonSerializer.Serialize(r, RunnerJson.Default.RunResult);

    /// <summary>The student's line that was running when the program stopped (from the line markers).</summary>
    static int? CurrentLine(Assembly? asm)
    {
        var value = asm?.GetType("__Trace")?.GetField("Line")?.GetValue(null);
        return value is int n && n > 0 ? n : null;
    }
}

/// <summary>
/// Puts <c>global::__Trace.Line = n;</c> before every statement, where n is the statement's line
/// in the student's original code.
/// </summary>
sealed class LineMarker : CSharpSyntaxRewriter
{
    static int LineOf(SyntaxNode n) => n.GetLocation().GetLineSpan().StartLinePosition.Line + 1;

    static StatementSyntax Marker(int line) => SyntaxFactory.ParseStatement($"global::__Trace.Line = {line};");

    SyntaxList<StatementSyntax> Mark(SyntaxList<StatementSyntax> statements)
    {
        var list = new List<StatementSyntax>();
        foreach (var st in statements)
        {
            if (st is not LocalFunctionStatementSyntax and not LabeledStatementSyntax)
                list.Add(Marker(LineOf(st)));
            list.Add((StatementSyntax)Visit(st));
        }
        return SyntaxFactory.List(list);
    }

    public override SyntaxNode? VisitBlock(BlockSyntax node) => node.WithStatements(Mark(node.Statements));

    public override SyntaxNode? VisitSwitchSection(SwitchSectionSyntax node) => node.WithStatements(Mark(node.Statements));

    public override SyntaxNode? VisitCompilationUnit(CompilationUnitSyntax node)
    {
        var members = new List<MemberDeclarationSyntax>();
        foreach (var m in node.Members)
        {
            if (m is GlobalStatementSyntax g && g.Statement is not LocalFunctionStatementSyntax)
                members.Add(SyntaxFactory.GlobalStatement(Marker(LineOf(g))));
            members.Add((MemberDeclarationSyntax)Visit(m));
        }
        return node.WithMembers(SyntaxFactory.List(members));
    }
}

public record CompileError(int Line, int Column, string Code, string Message);
public record CompileResult(bool Ok, long Ms, List<CompileError> Errors);
public record Segment(string Kind, string Text);
public record RunError(string Type, string Message, int? Line);
public record RunResult(List<Segment> Segments, long Ms, bool NeedInput, bool TooMuchOutput, RunError? Error);

[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(CompileResult))]
[JsonSerializable(typeof(RunResult))]
partial class RunnerJson : JsonSerializerContext { }

/// <summary>Thrown when the program asks for more input than the page has given it.</summary>
sealed class NeedsInputException : Exception { }

sealed class TooMuchOutputException : Exception { }

/// <summary>
/// Everything the program showed, in order: printed text ("out") and the answers typed in ("in"),
/// so the page can echo typed answers in a different colour, like the Python site.
/// </summary>
sealed class Recording(int max)
{
    public List<Segment> Segments { get; } = [];
    readonly StringBuilder _current = new();
    string _kind = "out";
    int _total;

    public void Add(string kind, string text)
    {
        if (text.Length == 0) return;
        if (kind != _kind) Flush();
        _kind = kind;
        _current.Append(text);
        _total += text.Length;
        if (_total > max) { Flush(); throw new TooMuchOutputException(); }
    }

    public void Flush()
    {
        if (_current.Length > 0) Segments.Add(new Segment(_kind, _current.ToString()));
        _current.Clear();
    }
}

sealed class RecordingWriter(Recording record) : TextWriter
{
    public override Encoding Encoding => Encoding.UTF8;
    public override void Write(char value) => record.Add("out", value.ToString());
    public override void Write(string? value) => record.Add("out", value ?? "");
    public override void Write(char[] buffer, int index, int count) => record.Add("out", new string(buffer, index, count));
    public override void Flush() { }
}

/// <summary>Feeds prepared lines to Console.ReadLine().</summary>
sealed class ScriptedReader(string input, bool interactive, Recording record) : TextReader
{
    readonly Queue<string> _lines = new(input.Length == 0 ? [] : input.Replace("\r\n", "\n").Split('\n'));

    public override string? ReadLine()
    {
        if (_lines.Count == 0)
        {
            if (interactive) { record.Flush(); throw new NeedsInputException(); }
            return null;
        }
        var line = _lines.Dequeue();
        record.Add("in", line + "\n");
        return line;
    }

    public override int Read() => -1;
    public override int Peek() => -1;
}
