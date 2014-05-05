var parserLib = require('../lib/ccs').parser;

var assert = require("assert");
describe('Parser', function(){
    describe('BasicPhrases', function(){
        var parser = new parserLib.Parser();
        it('should parse empty strings', function(){
            assert.equal(true, parser.parse(""));
            assert.equal(true, parser.parse("   "));
            assert.equal(true, parser.parse("\n\t "));
        });
        it('should parse // comments', function(){
            assert.equal(true, parser.parse("// this is a comment"));
            assert.equal(true, parser.parse("// this\n//is\n//many\n//comments"));
            assert.equal(true, parser.parse("  // comment and whitespace"));
        });
        it('should parse /* comments */', function(){
            assert.equal(true, parser.parse("/* this is a comment */"));
            assert.equal(true, parser.parse("/* this\nis\na\ncomment*/"));
            assert.equal(true, parser.parse("  /* comment and whitespace */  "));
        });
        it('should parse nested /* comments */', function(){
            assert.equal(true, parser.parse("/* /* this isn't nice */ but is legal */"));
        });
        it('should accept import files', function(){
            assert.equal(true, parser.parse("@import 'file'"));
        });
        it('should accept context lines', function(){
            assert.equal(true, parser.parse("@context (foo.bar > baz)"));
            assert.equal(true, parser.parse("@context (foo x.bar > baz >)"));
        });
        it('should accept property defs', function(){
            assert.equal(true, parser.parse("prop = 'val'"));
        });
        it('should accept simple elem defs', function(){
            assert.equal(true, parser.parse("elem.id {}"));
            assert.equal(true, parser.parse("elem.id {prop = 'val'}"));
        });
        it('should parse properties in nested defs - int', function(){
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = 43 }"));
        });
        it('should parse properties in nested defs - float', function(){
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = 2.3 }"));
        });
        it('should parse properties in nested defs - string', function(){
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = \"val\" }"));
        });
        it('should parse properties in nested defs - hex', function(){
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = 0xAB12 }"));
        });
        it('should parse properties in nested defs - bool', function(){
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = true }"));
            assert.equal(true, parser.parse("a.class.class blah > elem.id { prop = false }"));
        });
        it('should fail to parse duplicate class suffixes', function(){
            assert.equal(false, parser.parse("a.class.class blah > elem. id {prop=2.3}"));
            assert.equal(false, parser.parse("a.class.class blah > elem.id { prop = false }"));
        });
    })
})
//  EXPECT_FALSE(parser.parse("a.class.class blah > elem. id {prop=2.3}"));
//  EXPECT_FALSE(parser.parse("a.class. class > elem.id {prop=\"val\"}"));
//  EXPECT_FALSE(parser.parse("blah"));
//  EXPECT_FALSE(parser.parse("@import 'file'; @context (foo)"));
//  EXPECT_TRUE(parser.parse("@import 'file' ; @constrain foo"));
//  EXPECT_TRUE(parser.parse("a.class { @import 'file' }"));
//  EXPECT_FALSE(parser.parse("a.class { @context (foo) }"));
//  EXPECT_TRUE(parser.parse("elem.id { prop = 'val'; prop2 = 31337 }"));
//  EXPECT_TRUE(parser.parse("prop.'val'/a.foo/p.'hmm' { p = 1; }"));
//  EXPECT_TRUE(parser.parse("a b > c d {p=1}"));
//  EXPECT_TRUE(parser.parse("(a > b) (c > d) {p=1}"));
//  EXPECT_TRUE(parser.parse("a > (b c) > d {p=1}"));
//  EXPECT_TRUE(parser.parse("a.\"foo\" 'bar' {'test' = 1};"));
//}
//
//TEST(ParserTest, Comments) {
//  P parser;
//  EXPECT_TRUE(parser.parse("// single line comment\n"));
//  EXPECT_TRUE(parser.parse("// single line comment nonl"));
//  EXPECT_TRUE(parser.parse("/* multi-line comment */"));
//  EXPECT_TRUE(parser.parse("prop = /* comment */ 'val'"));
//  EXPECT_TRUE(parser.parse("prop = /* comment /*nest*/ more */ 'val'"));
//  EXPECT_TRUE(parser.parse("elem.id /* comment */ {prop = 'val'}"));
//  EXPECT_TRUE(parser.parse("// comment\nelem { prop = 'val' prop = 'val' }"));
//}
//
//TEST(ParserTest, UglyAbutments) {
//  P parser;
//  EXPECT_FALSE(parser.parse("foo {p = 1x = 2}"));
//  EXPECT_FALSE(parser.parse("foo {p = 'x'x = 2}"));
//  EXPECT_FALSE(parser.parse("value=12env.foo {}"));
//  EXPECT_TRUE(parser.parse("foo {p = 1 x = 2}"));
//  EXPECT_TRUE(parser.parse("foo{p=1;x=2}"));
//  EXPECT_FALSE(parser.parse("foo{@overridep=1}"));
//  EXPECT_TRUE(parser.parse("foo{@override /*hi*/ p=1}"));
//  EXPECT_FALSE(parser.parse("@import'asdf'"));
//  EXPECT_FALSE(parser.parse("@constrainasdf"));
//  EXPECT_TRUE(parser.parse(
//      "@import 'asdf' \n ; \n @constrain asdf \n ; @import 'foo'  "));
//  EXPECT_TRUE(parser.parse("@import /*hi*/ 'asdf'"));
//}
//
//TEST(ParserTest, SelectorSections) {
//  P parser;
//  EXPECT_TRUE(parser.parse("foo > { bar {}}"));
//  EXPECT_TRUE(parser.parse("foo > { bar > baz {}}"));
//  EXPECT_TRUE(parser.parse("bar > baz {}"));
//  EXPECT_TRUE(parser.parse("bar baz {}"));
//}
//
//TEST(ParserTest, Constraints) {
//  P parser;
//  EXPECT_TRUE(parser.parse("a.b: @constrain a.c"));
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
