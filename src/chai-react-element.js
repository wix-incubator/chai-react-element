import _ from 'lodash';
import ReactDOM from 'react-dom';
import {decompile, options} from 'react-decompiler';
import predicate from './can-be-asserted';

export default function(chai, utils, opt) {
    if (opt && opt.decompilerOptions) {
        _.assign(options, opt.decompilerOptions);
    }
    
    registerMatcher(chai, utils, 'prop', predicate, function(name, expectedValue) {

        const validateValue = arguments.length > 1;
        const candidates = _.filter(getActual(this), elem => hasProp(elem, name));

        const expectedValueMessage = () => validateValue ? ` and value ${expectedValue}` : ``;

        this.assert(
            candidates.length && (!validateValue || _.some(candidates, elem => prop(elem, name) === expectedValue)),
            `expected ${prettyPrint(this._obj)} to contain a prop with name '${name}'${expectedValueMessage()}`,
            `expected ${prettyPrint(this._obj)} not to contain a prop with name '${name}'${expectedValueMessage()}`
        );

        return new chai.Assertion(candidates);
    });

    registerMatcher(chai, utils, 'text', predicate, function(text) {
        const actual = getActual(this);
        const candidates = _.filter(actual, elem => elem && elem.props && (elem.props.children === text || (utils.type(elem.props.children) == 'array' && ~elem.props.children.indexOf(text))));
        this.assert(
            candidates.length,
            `expected ${prettyPrint(this._obj)} to have text '${text}'`,
            `expected ${prettyPrint(this._obj)} not to have text '${text}'`
        );
    });

    registerMatcher(chai, utils, 'elementOfType', predicate, function(type) {

        const actual = getActual(this);
        const candidates = _.filter(actual, elem => elem && elem.type === type);
        this.assert(
            candidates.length,
            `expected ${prettyPrint(this._obj)} to have an element of type '${type}'`,
            `expected ${prettyPrint(this._obj)} not to have an element of type '${type}'`
        );

        return new chai.Assertion(candidates);
    });

    function getActual(assertion) {
        const assertee = assertion._obj;
        if (utils.flag(assertion, 'contains')) {
            return flatten(assertee);
        } else {
            return [].concat(assertee);
        }
    }

}

function getAssertee(obj) {
    if (obj._reactInternalComponent && obj._reactInternalComponent._currentElement) {
        return obj._reactInternalComponent._currentElement;
    } else {
        return obj;
    }
}

function registerMatcher(chai, utils, name, predicate, matcher) {
    chai.Assertion.overwriteMethod(name, function(_super) {
        return function() {
            if(predicate(this._obj)){
                utils.flag(this, 'object', getAssertee(this._obj));
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
    if(vdom === undefined){return}
    if(Array.isArray(vdom)){
        vdom.forEach(function(vdom){
            visitVDom(vdom, visitor);
        });
    } else {
        visitor(vdom);
        if(vdom && vdom.props){
            visitVDom(vdom.props.children, visitor);
        }
    }
}

function hasProp(elem, name) {
    if (!elem) return false;

    if (elem.props) {
        return elem.props.hasOwnProperty(name);
    } else if (elem._store && elem._store.props) {
        return elem._store.props.hasOwnProperty(name);
    }
    return false;
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
