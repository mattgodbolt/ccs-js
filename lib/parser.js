(function() {
var pegParser = require('./ccs_parser');

function Parser() {
    var self = this;

    self.parse = function(text) {
        pegParser.parse(text);
        return true;
    };
}

module.exports = {
    Parser: Parser
};
})();
