CcsFile
  = _ context:Context? _ rules:Rules _ { return { context: context, rules: rules }; }

Rules = rules:Rule* { return rules; }

Context = "@context" _ "(" _ context:Selector _ ")" _ ";"? { return context; }

Selector = "sel"
Rule = "rule"

BlockComment
  = "/*" (BlockComment / (!"*/" .))* "*/"

LineComment = "//" (!nl .)*

_ = Skipper

Skipper = (BlockComment / LineComment / ws)*

nl = "\n" / "\r\n" / "\r" / "\f"
ws = [ \t\n\r]
