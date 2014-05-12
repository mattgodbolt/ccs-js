{
    var ast = require('./ast');
    function Origin(filename, line, column) {
        this.filename = filename;
        this.line = line;
        this.column = column;
    }

    function Constraint(key) {
        this.key = key;
    }

    function Value(type, value) {
        this.type = type;
        this.value = value;
    }

    function PropDef(name, value, origin, override) {
        this.type = "property";
        this.name = name;
        this.value = value;
        this.origin = origin;
        this.override = override;
    }

    function Nested(selector, rules) {
        this.type = "nested";
        this.selector = selector;
        this.rules = rules;
    }

    function pickNth(array, n) {
        var result = [];
        for (var i = 0; i < array.length; ++i) {
            result.push(array[i][n]);
        }
        return result;
    }
    function SelectorBranch(leaf, opt) {
        this.type = opt ? 'descendant' : 'conjunction';
        this.leaf = leaf;
    }
    function SingleStep(id, vals, suffix) {
        this.type = 'singleStep';
        this.id = id;
        this.vals = vals;
        this.suffix = suffix;
    }
    function SelectorLeaf(type, leaves) {
        this.type = type;
        this.leaves = leaves;
    }
}

CcsFile
  = _ context:Context? _ rules:Rules _ { return { context: context, rules: rules }; }

Rules = rules:(Rule _)* { return pickNth(rules, 0); }

Context = "@context" _ "(" _ context:Selector _ ")" SkipSemicolon { return context; }

Term = head:Step tail:(_ ">" _ Step)* { 
    return new SelectorLeaf('descendant', [head].concat(pickNth(tail, 3))); }
Product = head:Term tail:(_ Term)* {
    return new SelectorLeaf('conjunction', [head].concat(pickNth(tail, 1))); }
Sum = head:Product tail:(_ "," _ Product)* {
    return new SelectorLeaf('disjunction', [head].concat(pickNth(tail, 3))); }
Step 
  = ss:SingleStep { return ss; }
  / ("(" _ sum:Sum _ ")") { return sum; }
Selector = s:Sum _ o:">"? { return new SelectorBranch(s, o); }

RuleBody = Import / Constraint / Property / Nested
Rule = r:RuleBody SkipSemicolon { return r; }

// Token separators include quotes only to prevent things like "@import'moo'"
TokenSep = (!['"a-zA-Z0-9$_]) _

Import = "@import" TokenSep imp:String { return imp; }

Constraint
  = "@constrain" TokenSep ss:SingleStep { return ss; }

Modifiers
  = ("@override" TokenSep)?

Property "property" = mod:Modifiers _ id:Ident _ "=" _ v:Val TokenSep { 
    return new PropDef(id, v, new Origin(options.filename, line(), column()), 
                       mod ? true : false); }

Double "double"
  = v:$("-"? [0-9]+ ("." [0-9]*)? ([eE] "-"? [0-9]+)?) { return v; }
  / v:$("-"? "." [0-9]+ ([eE] "-"? [0-9]+)?) { return v; }

Val "value" 
  = "0x" hex:$[0-9a-fA-F]+ { return new Value("long", parseInt(hex, 16)); }
  / v:$("-"?[0-9]+) !([.eE]) { return new Value("long", parseInt(v)); }
  / v:Double { return new Value("double", parseFloat(v)); }
  / "true" { return new Value("bool", true); }
  / "false" { return new Value("bool", false); }
  / s:String { return new Value("string", s); }

RuleOrRules
  = ":" _ rule:(Import / Constraint / Property) { return [rule]; }
  / "{" _ rules:Rules _ "}" { return rules; }

Nested
  = sel:Selector _ rules:RuleOrRules { return new Nested(sel, rules); }

SingleStep "selector step"
  = id:Ident vals:Vals? suffix:StepSuffix? { return new SingleStep(id, vals, suffix); }

Vals "constraint value"
  = "." Ident Vals?

StepSuffix
  = "/" SingleStep

Ident "identifier" 
  = id:$([A-Za-z0-9$_]+) { return id; }
  / str:String { return str; }

String "string" 
  = "'" chars:SingleStringChar+ "'" { return chars.join(""); }
  / "\"" chars:DoubleStringChar+ "\"" { return chars.join(""); }

Escaped 
  = "$" { return "$"; }
  / "'" { return "'"; }
  / "\"" { return "\""; }
  / "\\" { return "\\"; }
  / "t" { return "\t"; }
  / "n" { return "\n"; }
  / "r" { return "\r"; }

SingleStringChar
 = !("'" / "\\" / nl) . { return text(); }
 / "\"" s:Escaped { return s; }

DoubleStringChar
 = !("\"" / "\\" / nl) . { return text(); }
 / "\"" s:Escaped { return s; }

BlockComment
  = "/*" (BlockComment / (!"*/" .))* "*/"

Interpolant = "${" name:[A-Za-z0-9_]+ "}" { return name; }

LineComment = "//" (!nl .)*

Comment "comment" = BlockComment / LineComment

_ = (Comment / ws)*

SkipSemicolon = _ ";"? _

nl "end of line" = "\n" / "\r\n" / "\r" / "\f"
ws "whitespace" = [ \t\n\r]
