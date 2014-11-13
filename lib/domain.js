(function () {

    function nullImportResolver() {
        return false;
    };

    function CcsDomain(config) {
        config = config || {};
        var self = this;

        self.load = function (str, filename, importResolver) {
            if (typeof(str) != "string") {
                // TODO - load here?
            }
            if (!filename) {
                filename = "<literal>";
            }
            if (!importResolver) {
                importResolver = nullImportResolver;
            }
        };

        self.build = function () {
            return null;
        };
    }

    module.exports = CcsDomain;
})();
