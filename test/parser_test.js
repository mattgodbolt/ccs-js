var parserLib = require('../lib/ccs').parser;

var assert = require("assert");
var parser = new parserLib.Parser();
describe('Parser', function(){
    function P(a) { parser.parse(a); }
    function F(a) { assert.throws(function(){parser.parse(a);}); }

    describe('BasicPhrases', function(){
        it('should parse empty strings', function(){
            P("");
            P("   ");
            P("\n\t ");
        });
        it('should accept import files', function(){
            P("@import 'file'");
        });
        it('should accept context lines', function(){
            P("@context (foo.bar > baz)");
            P("@context (foo x.bar > baz >)");
        });
        it('should accept property defs', function(){
            P("prop = 'val'");
        });
        it('should accept simple elem defs', function(){
            P("elem.id {}");
            P("elem.id {prop = 'val'}");
        });
        it('should parse properties in nested defs - int', function(){
            P("a.class.class blah > elem.id { prop = 43 }");
        });
        it('should parse properties in nested defs - float', function(){
            P("a.class.class blah > elem.id { prop = 2.3 }");
        });
        it('should parse properties in nested defs - string', function(){
            P("a.class.class blah > elem.id { prop = \"val\" }");
        });
        it('should parse properties in nested defs - hex', function(){
            P("a.class.class blah > elem.id { prop = 0xAB12 }");
        });
        it('should parse properties in nested defs - bool', function(){
            P("a.class.class blah > elem.id { prop = true }");
            P("a.class.class blah > elem.id { prop = false }");
        });
        it('should fail to parse properties with spacing', function(){
            F("a.class.class blah > elem. id {prop=2.3}");
            F("a.class. class blah > elem.id { prop = false }");
        });
        it('should not parse just an identifier', function(){
            F("blah");
        });
        it('should not parse contexts away from the top', function(){
            F("@import 'file'; @context (foo)");
            F("a.class { @context (foo) }");
        });
        it('should allow constraints later on', function(){
            P("@import 'file' ; @constrain foo");
        });
        it('should allow imports within contexts', function(){
            P("@import 'file'; @import 'foo'");
        });
        it('should parse two properties', function(){
            P("elem.id { prop = 'val'; prop2 = 31337 }");
        });
        it('should parse simultaneous constraints', function(){
            P("prop.'val'/a.foo/p.'hmm' { p = 1; }");
        });
        it('should parse ancestor constaints', function(){
            P("a b > c d {p=1}");
        });
        it('should parse parentheses', function() {
            P("(a > b) (c > d) {p=1}");
            P("a > (b c) > d {p=1}");
        });
        it('should handle both quote types', function() {
            P("a.\"foo\" 'bar' {'test' = 1};");
        });
    });

    describe("Comments", function() {
        it('should parse // comments', function(){
            P("// this is a comment");
            P("// this\n//is\n//many\n//comments");
            P("  // comment and whitespace");
        });
        it('should parse /* comments */', function(){
            P("/* this is a comment */");
            P("/* this\nis\na\ncomment*/");
            P("  /* comment and whitespace */  ");
        });
        it('should parse nested /* comments */', function(){
            P("/* /* this isn't nice */ but is legal */");
        });
        it('should handle comments in elements', function(){
            P("prop = /* comment */ 'val'");
            P("prop = /* comment /*nest*/ more */ 'val'");
            P("elem.id /* comment */ {prop = 'val'}");
            P("// comment\nelem { prop = 'val' prop = 'val' }");
        });
    });

    describe("UglyAbutments", function(){
        it('should fail to parse these abutments', function(){
            F("foo {p = 1x = 2}");
            F("foo {p = 'x'x = 2}");
            F("value=12env.foo {}");
            P("foo {p = 1 x = 2}");
            P("foo{p=1;x=2}");
        });
        it('should handle override abutments', function(){
            F("foo{@overridep=1}");
            P("foo{@override/*hi*/p=1}");
            P("foo{@override/*hi*/p=1}");
        });
        it('should handle import abutments', function(){
            F("@import'asdf'");
            P("@import /*hi*/ 'asdf'");
        });
        it('should handle constrain abutments', function(){
            F("@constrainasdf");
            P("@import 'asdf' \n ; \n @constrain asdf \n ; @import 'foo'  ");
        }); 
    });

    describe('Selector sections', function(){
        it('should parse these', function(){
            P("foo > { bar {}}");
            P("foo > { bar > baz {}}");
            P("bar > baz {}");
            P("bar baz {}");
        });
    });

    describe('Constraints', function(){
        it('should parse these', function(){
            P("a.b: @constrain a.c");
        });
    });

    function expectValue(text, type, expected) {
        var parsed = parser.parse(text);
        assert.equal(parsed.rules.length, 1);
        var val = parsed.rules[0].value;
        assert.equal(val.type, type);
        assert.equal(val.value, expected);
    }
    function L(text, expected) { expectValue(text, "long", expected); }
    function D(text, expected) { expectValue(text, "double", expected); }

    describe('Parsing values', function(){
        it('should parse integers', function(){
            L("value = 100", 100);
            L("value = 0", 0);
            L("value = -0", 0);
            L("value = -100", -100);
            F("value = ---1");
        });

        it('should parse hex integers', function(){
            L("value = 0x123", 0x123);
            L("value = 0x0", 0x0);
            L("value = 0x0", 0x0);
            F("value = 0x");
            F("value = 0x0x0");
        });

        it('should parse doubles', function(){
            D("value = 100.", 100.0);
            D("value = 100.0000", 100.0);
            D("value = 0.0000", 0.0);
            D("value = .1", 0.1);
            D("value = -0.0000", 0.0);
            D("value = 1.0e-2", 0.01);
            D("value = 1.0E-2", 0.01);
            D("value = -1.0e-2", -0.01);
            D("value = -1.0E-2", -0.01);
            D("value = .1e-2", 0.001);
            D("value = .1E-2", 0.001);
            D("value = -.1e-2", -0.001);
            D("value = -.1E-2", -0.001);
            D("value = 1e2", 100);
            D("value = 1E2", 100);
        });

        it('should parse bools', function(){
            expectValue("value = true", "bool", true);
            expectValue("value = false", "bool", false);
            F("value = flase");
            F("value = truee");
        });

        it('should parse strings', function(){
            expectValue("value = 'a string'", "string", "a string");
            expectValue("value = \"a string\"", "string", "a string");
            F("value = \"should not work'");
        });
    });
});
