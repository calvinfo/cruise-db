
test:
	@./node_modules/.bin/mocha \
		--reporter spec

node_modules: package.json
		npm install

.PHONY: test