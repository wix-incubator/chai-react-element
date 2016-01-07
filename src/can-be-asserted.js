import _ from 'lodash';
import React from 'react';

export default function canBeAsserted(vdom) {
    function isCompatibleObject(node) {
        return node
            && typeof node === 'object'
            && typeof node.type === 'string'
            && (!node.props || typeof node.props === 'object');
    }

    return _.all([].concat(vdom), node =>
        React.isValidElement(node) || isCompatibleObject(node));
}
