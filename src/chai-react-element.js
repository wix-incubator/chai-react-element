import React from 'react/addons';
import _ from 'lodash';
import {decompile} from 'react-decompiler';

export default function(chai, utils) {

    registerMatcher(chai, 'prop', predicate, function(name, expectedValue) {

        const validateValue = arguments.length > 1;
        const node = _.find(getActual(this), elem => prop(elem, name) === expectedValue);
        const actualValue = prop(node, name);

        const expectedValueMessage = () => validateValue ? ` and value ${expectedValue}, but got ${actualValue}` : ``;

        this.assert(
            actualValue && (!validateValue || actualValue === expectedValue),
            `expected ${prettyPrint(this._obj)} to contain a prop with name '${name}'${expectedValueMessage()}`,
            `expected ${prettyPrint(this._obj)} not to contain a prop with name '${name}'${expectedValueMessage()}`
        );

        return new chai.Assertion(actualValue);
    });

    registerMatcher(chai, 'text', predicate, function(text) {
        const actual = getActual(this);
        const candidates = _.filter(actual, elem => elem.props && elem.props.children === text);
        this.assert(
            candidates.length,
            `expected ${prettyPrint(this._obj)} to have text '${text}'`,
            `expected ${prettyPrint(this._obj)} not to have text '${text}'`
        );
    });

    registerMatcher(chai, 'elementOfType', predicate, function(type) {

        const actual = getActual(this);
        const candidates = _.filter(actual, elem => elem.type === type);
        this.assert(
            candidates.length,
            `expected ${prettyPrint(this._obj)} to have an element of type '${type}'`,
            `expected ${prettyPrint(this._obj)} not to have an element of type '${type}'`
        );

        return new chai.Assertion(candidates);
    });

    function getActual(assertion) {
        if (utils.flag(assertion, 'contains')) {
            return flatten(assertion._obj);
        } else {
            return [].concat(assertion._obj);
        }
    }
}

function registerMatcher(chai, name, predicate, matcher) {
    chai.Assertion.overwriteMethod(name, function(_super) {
        return function() {
            if(predicate(this._obj)){
                return matcher.apply(this, arguments);
            } else {
                return _super.apply(this, arguments);
            }
        }
    });
}

function flatten(vdom){
    var res = [];
    _.forEach([].concat(vdom), () => visitVDom(vdom, res.push.bind(res)));
    return res;
}

function visitVDom(vdom, visitor) {
    visitor(vdom);
    var children = vdom.props && vdom.props.children;
    if(children) {
        _.forEach([].concat(children), child => child && visitVDom(child, visitor));
    }
}

function prop(elem, name) {
    if (!elem) return;

    if (elem.props) {
        return elem.props[name];
    } else if (elem._store && elem._store.props) {
        return elem._store.props[name];
    } else {
        return;
    }
}

function prettyPrint(vdom) {
    return [].concat(vdom).map(decompile).join(', ');
}

function predicate(vdom) {
    return _.all([].concat(vdom), React.addons.TestUtils.isElement);
}