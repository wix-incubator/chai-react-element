import _ from 'lodash';

export default function canBeAsserted(vdom) {
    return _.all([].concat(vdom), node =>
        node
        && typeof node === 'object'
        && typeof node.type === 'string'
        && (!node.props || typeof node.props === 'object')
    );
}