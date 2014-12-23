(function () {
    var parser = require('./parser');

    function nullImportResolver() {
        return false;
    }

    function CcsDomain(config) {
        config = config || {};
        var self = this;

        self.dag = null;

        self.load = function (str, filename, importResolver) {
            if (typeof(str) !== "string") {
                // TODO - load here?
            }
            if (!filename) {
                filename = "<literal>";
            }
            if (!importResolver) {
                importResolver = nullImportResolver;
            }
            var p = new parser.Parser();
            var ast = p.parse(str, filename);
        };

        self.build = function () {
            return null;
        };
    }

    module.exports = CcsDomain;
})();
