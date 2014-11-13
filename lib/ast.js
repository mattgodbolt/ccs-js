(function () {

    function Key(name, values) {
        var self = this;
        if (name !== undefined) {
            self.addName(name);
        }
        // TODO add values
    }

    module.exports = {
        Key: Key
    };
})();
