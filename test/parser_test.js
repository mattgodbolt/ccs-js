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
});

//TEST(ParserTest, UglyAbutments) {
//  P parser;
//  EXPECT_FALSE(parser.parse("foo {p = 1x = 2}");
//  EXPECT_FALSE(parser.parse("foo {p = 'x'x = 2}");
//  EXPECT_FALSE(parser.parse("value=12env.foo {}");
//  EXPECT_TRUE(parser.parse("foo {p = 1 x = 2}");
//  EXPECT_TRUE(parser.parse("foo{p=1;x=2}");
//  EXPECT_FALSE(parser.parse("foo{@overridep=1}");
//  EXPECT_TRUE(parser.parse("foo{@override /*hi*/ p=1}");
//  EXPECT_FALSE(parser.parse("@import'asdf'");
//  EXPECT_FALSE(parser.parse("@constrainasdf");
//  EXPECT_TRUE(parser.parse(
//      "@import 'asdf' \n ; \n @constrain asdf \n ; @import 'foo'  ");
//  EXPECT_TRUE(parser.parse("@import /*hi*/ 'asdf'");
//}
//
//TEST(ParserTest, SelectorSections) {
//  P parser;
//  EXPECT_TRUE(parser.parse("foo > { bar {}}");
//  EXPECT_TRUE(parser.parse("foo > { bar > baz {}}");
//  EXPECT_TRUE(parser.parse("bar > baz {}");
//  EXPECT_TRUE(parser.parse("bar baz {}");
//}
//
//TEST(ParserTest, Constraints) {
//  P parser;
//  EXPECT_TRUE(parser.parse("a.b: @constrain a.c");
//}
//
//
//TEST(ParserTest, ParsesIntegers) {
//  P parser;
//  int64_t v64 = 0;
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 100", v64));
//  EXPECT_EQ(100, v64);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 0", v64));
//  EXPECT_EQ(0, v64);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = -0", v64));
//  EXPECT_EQ(0, v64);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = -100", v64));
//  EXPECT_EQ(-100, v64);
//  ASSERT_FALSE(parser.parseAndReturnValue("value = 100.123", v64));
//  ASSERT_FALSE(parser.parseAndReturnValue("value = '100", v64));
//}
//
//TEST(ParserTest, ParsesDoubles) {
//  P parser;
//  double vDouble = 0.0;
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 100.", vDouble));
//  EXPECT_DOUBLE_EQ(100., vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 100.0000", vDouble));
//  EXPECT_DOUBLE_EQ(100., vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 0.0000", vDouble));
//  EXPECT_DOUBLE_EQ(0., vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = -0.0000", vDouble));
//  EXPECT_DOUBLE_EQ(0., vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 1.0e-2", vDouble));
//  EXPECT_DOUBLE_EQ(0.01, vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 1.0E-2", vDouble));
//  EXPECT_DOUBLE_EQ(0.01, vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 1e-2", vDouble));
//  EXPECT_DOUBLE_EQ(0.01, vDouble);
//  ASSERT_TRUE(parser.parseAndReturnValue("value = 1E-2", vDouble));
//  EXPECT_DOUBLE_EQ(0.01, vDouble);
//  ASSERT_FALSE(parser.parseAndReturnValue("value = 100", vDouble));
//  ASSERT_FALSE(parser.parseAndReturnValue("value = '100.0", vDouble));
//}
