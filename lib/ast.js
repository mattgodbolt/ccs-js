(function () {

    // TODO: put in dag?
    function Value(value) {
        this.value = value;
        this.strVal = "";
        this.name = "";
    }

    // TODO put in dag
    function Specificity() {
        this.names = 0;
        this.values = 0;
    }
    Specificity.prototype.lessThan = function(other) {
        if (this.values < other.values) return true;
        if (this.values == other.values && this.names < other.names) return true;
        return false;
    };

    // TODO put in dag
    function Key() {
        this.values = {};
        this.specificity = new Specificity();
    }

    // TODO put in types?
    function Origin(fileName, line) {
        this.fileName = filename || "<unknown>";
        this.line == line | 0;
    }

    function PropDef() {
        this.name = "";
        this.value = new Value();
        this.origin = new Origin();;
        this.override = false;
    }

    function Constraint() {
        this.key = new Key();
    }

    function Nested() {
        this.selector = null;
        this.rules = [];
    }

    Nested.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    Nested.prototype.addTo = function (buildContext, baseContext) {
        var bc = buildContext;
        if (this.selector)
            bc = this.selector.traverse(buildContext, baseContext);
        this.rules.forEach(function (rule) {
            switch (rule.type) {
                case rule.IMPORT:
                    break;
            }
        });
    };
    Nested.prototype.resolveImports = function () {
    };

    module.exports = {
        Nested: Nested
    };
})();
