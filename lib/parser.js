(function() {
var pegParser = require('./ccs_parser');

function Parser() {
    var self = this;

    self.parse = function(text) {
        return pegParser.parse(text);
    };
}

module.exports = {
    Parser: Parser
};
})();
