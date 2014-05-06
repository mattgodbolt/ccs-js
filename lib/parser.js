(function() {
var pegParser = require('./ccs_parser');

function Parser() {
    var self = this;
    self.exception = undefined;

    self.parse = function(text) {
        pegParser.parse(text);
    };
}

module.exports = {
    Parser: Parser
};
})();
