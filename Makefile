default: test

.PHONY: clean run test prereqs
prereqs: node_modules lib/ccs_parser.js

lib/ccs_parser.js: node_modules lib/ccs.pegjs
	./node_modules/.bin/pegjs lib/ccs.pegjs lib/ccs_parser.js

NODE_MODULES=.npm-updated
$(NODE_MODULES): package.json
	npm install
	@touch $@

node_modules: $(NODE_MODULES)

test: prereqs
	./node_modules/.bin/mocha

clean:
	rm -rf node_modules $(NODE_MODULES)
