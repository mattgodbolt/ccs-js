CcsFile
  = _ context:Context? _ rules:Rules _ { return { context: context, rules: rules }; }

Rules = rules:Rule* { return rules; }

Context = "@context" _ "(" _ context:Selector _ ")" _ ";"? { return context; }

Term = Step (_ ">" _ Step)*
Product = Term (_ Term*)
Sum = Product (_ "," _ Product)*
Step = SingleStep / ("(" _ Sum _ ")")
Selector = Sum _ ">"?

Rule = Import / Constraint / Property / Nested

Import = "@import" _ imp:String { return imp; }

Constraint
  = "@constrain" _ ss:SingleStep { return ss; }

Modifiers
  = "@override"?

Property "property" = Modifiers _ Ident _ "=" _ Val

Val "value" 
  = "0x" [0-9a-fA-F]+
  / String;

Nested
  = Selector _ ( ":" _ (Import / Constraint / Property) / ("{" _ Rule* _ "}"))

SingleStep "constraint"
  = Ident Vals? StepSuffix?

Vals
  = "." Ident Vals?

StepSuffix
  = "/" SingleStep

Ident = [A-Za-z0-9$_]+ / String

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
_ = Skipper

Skipper = (Comment / ws)*

nl "end of line" = "\n" / "\r\n" / "\r" / "\f"
ws "whitespace" = [ \t\n\r]
