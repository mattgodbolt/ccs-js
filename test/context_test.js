var CcsDomain = require('../lib/ccs').CcsDomain;

var assert = require("assert");
describe('Context', function () {
    it('should output as string', function () {
        var ccs = new CcsDomain();
        ccs.load("b c : @constrain d.e");
        var root = ccs.build();
        var ctx = root.constrain("c").constrain("b");

        assert.equal("c > b/d.e", ctx.toString());
        assert.equal("<root>", root.toString());
    });
});
