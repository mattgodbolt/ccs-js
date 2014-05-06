(function() {
var pegParser = require('./ccs_parser');

function Parser() {
    var self = this;

    self.parse = function(text, filename) {
        return pegParser.parse(text, {filename: filename || "unknown"});
    };
}

module.exports = {
    Parser: Parser
};
})();
