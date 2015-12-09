import React from 'react/addons';
import _ from 'lodash';

export default function(chai, utils) {

    registerMatcher(chai, 'prop', React.addons.TestUtils.isElement, function(name, expectedValue) {

        const getActual = () => {
            if (utils.flag(this, 'contains')) {
                return _.filter(asArray(this._obj), elem => prop(elem, name) === expectedValue);
            } else {
                return [this._obj];
            }
        }

        const validateValue = arguments.length > 1;
        const node = getActual()[0];
        const actualValue = prop(node, name);

        const expectedValueMessage = () => validateValue ? `value ${expectedValue}` : `no value`;

        this.assert(
            actualValue && (!validateValue || actualValue === expectedValue),
            `expected vdom ${JSON.stringify(this._obj)} to contain a prop with name '${name}' and ${expectedValueMessage()}, but got ${actualValue}`,
            `expected vdom ${JSON.stringify(this._obj)} not to contain a prop with name '${name}' and ${expectedValueMessage()}, but got ${actualValue}`
        );

        return new chai.Assertion(actualValue);
    });

    registerMatcher(chai, 'text', React.addons.TestUtils.isElement, function(text) {
        const node = this._obj;
        const actualValue = node.props && node.props['children'];

        this.assert(
            actualValue === text,
            `expected vdom ${JSON.stringify(node)} to have text '${text}', but got ${actualValue}`,
            `expected vdom ${JSON.stringify(node)} not to have text '${text}', but got ${actualValue}`
        );
    });

    registerMatcher(chai, 'elementOfType', React.addons.TestUtils.isElement, function(type) {
        function getActual(assertion) {
            if (utils.flag(assertion, 'contains')) {
                return _.filter(asArray(assertion._obj), elem => elem.type === type);
            } else {
                return [assertion._obj]
            }
        }

        const candidate = getActual(this)[0];

        this.assert(
            candidate.type === type,
            `expected vdom ${JSON.stringify(this._obj)} to have an element of type '${type}', but got ${candidate.type}`,
            `expected vdom ${JSON.stringify(this._obj)} not to have an element of type '${type}', but got ${candidate.type}`
        );

        return new chai.Assertion(candidate);
    });

    chai.Assertion.addMethod('automationId', function(id) {
        return this.prop('data-automation-id', id);
    });
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

function asArray(vdom){
    var res = [];
    visitVDom(vdom,function(vdomNode){
        res.push(vdomNode);
    });
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
