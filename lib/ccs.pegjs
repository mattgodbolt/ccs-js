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
        this.name = name;
        this.value = value;
        this.origin = origin;
        this.override = override;
    }

    function pickFirst(array) {
        var result = [];
        for (var i = 0; i < array.length; ++i) {
            result.push(array[i][0]);
        }
        return result;
    }
}

CcsFile
  = _ context:Context? _ rules:Rules _ { return { context: context, rules: rules }; }

Rules = rules:(Rule _)* { return pickFirst(rules); }

Context = "@context" _ "(" _ context:Selector _ ")" SkipSemicolon { return context; }

Term = Step (_ ">" _ Step)*
Product = Term (_ Term)*
Sum = Product (_ "," _ Product)*
Step = SingleStep / ("(" _ Sum _ ")")
Selector = Sum _ ">"?

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

Nested
  = Selector _ (":" _ (Import / Constraint / Property) / ("{" _ Rules _ "}"))

SingleStep "constraint class"
  = Ident Vals? StepSuffix?

Vals "constraint value"
  = "." Ident Vals?

StepSuffix
  = "/" SingleStep

Ident "identifier" 
  = id:[A-Za-z0-9$_]+ { return id.join(""); }
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
