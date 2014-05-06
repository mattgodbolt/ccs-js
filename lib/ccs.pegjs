CcsFile
  = _ context:Context? _ rules:Rules _ { return { context: context, rules: rules }; }

Rules = rules:(Rule _)* { return rules; }

Context = "@context" _ "(" _ context:Selector _ ")" SkipSemicolon { return context; }

Term = Step (_ ">" _ Step)*
Product = Term (_ Term)*
Sum = Product (_ "," _ Product)*
Step = SingleStep / ("(" _ Sum _ ")")
Selector = Sum _ ">"?

RuleBody = Import / Constraint / Property / Nested
Rule = RuleBody SkipSemicolon

// Token separators include quotes only to prevent things like "@import'moo'"
TokenSep = (!['"a-zA-Z0-9$_]) _

Import = "@import" TokenSep imp:String { return imp; }

Constraint
  = "@constrain" TokenSep ss:SingleStep { return ss; }

Modifiers
  = ("@override" TokenSep)?

Property "property" = Modifiers _ Ident _ "=" _ Val TokenSep

Val "value" 
  = "0x" [0-9a-fA-F]+
  / [0-9]+ !([.eE])
  / [0-9.eE]+ /* todo double */
  / "true"
  / "false"
  / String;

Nested
  = Selector _ (":" _ (Import / Constraint / Property) / ("{" _ Rules _ "}"))

SingleStep "constraint class"
  = Ident Vals? StepSuffix?

Vals "constraint value"
  = "." Ident Vals?

StepSuffix
  = "/" SingleStep

Ident "identifier" = [A-Za-z0-9$_]+ / String

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
SkipSemicolon = (Comment / ws / ";")*

nl "end of line" = "\n" / "\r\n" / "\r" / "\f"
ws "whitespace" = [ \t\n\r]
