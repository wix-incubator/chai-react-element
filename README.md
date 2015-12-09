# chai-react-element
[![Build Status](https://travis-ci.org/electricmonk/chai-react-element.png)](https://travis-ci.org/electricmonk/chai-react-element)

[![Dependency Status](https://david-dm.org/electricmonk/chai-react-element)](https://david-dm.org/electricmonk/chai-react-element)
[![devDependency Status](https://david-dm.org/electricmonk/chai-react-element/dev-status.svg)](https://david-dm.org/electricmonk/chai-react-element#info=devDependencies)
Accepting a React VDOM (`ReactElement`) root, this library provides chaining behavior and allows nested assertions using the `include` language chain:

## Usage
```javascript
expect(<div>hello</div>).to.have.text('hello');
expect(<div></div>).to.have.elementOfType('div')
expect(<div data-foo="bar"></div>).to.have.prop('data-foo', 'bar');

expect(<div><div data-foo="bar"></div></div>).to.include.prop('data-foo', 'bar');

expect(expect(<div><span>hello</span></div>).to.include.elementOfType('span').with.text('hello');

```

## Setup
```javascript
import chai, {expect} from 'chai';
import matcher from 'chai-react-element';
chai.use(matcher);
```

The plugin is exported as an ES6 module. If using ES5, please use:
```javascript
chai.use(require('chai-react-element').default);
```
