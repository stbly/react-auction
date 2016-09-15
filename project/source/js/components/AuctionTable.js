import React, { Component, PropTypes } from 'react'
import classNames from 'classnames';
// import {primaryPositionFor, playerIsDrafted, playerIsUndrafted} from '../helpers/PlayerListUtils';
// import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'

import {Table, Tfoot, Tr, Td, Thead, Th} from 'reactable'

import Row from './Row'

class AuctionTable extends Table {

	parseChildData(props) {

        let data = [], tfoot;

        // Transform any children back to a data array
        if (typeof(props.children) !== 'undefined') {
            React.Children.forEach(props.children, function(child) {
                if (typeof(child) === 'undefined' || child === null) {
                    return;
                }

                switch (child.type) {
                    case Thead:
                    break;
                    case Tfoot:
                        if (typeof(tfoot) !== 'undefined') {
                            console.warn ('You can only have one <Tfoot>, but more than one was specified.' +
                                          'Ignoring all but the last one');
                        }
                        tfoot = child;
                    break;
                    case Row:
                    case Tr:
                        let childData = child.props.data || {};

                        React.Children.forEach(child.props.children, function(descendant) {
                            // TODO
                            /* if (descendant.type.ConvenienceConstructor === Td) { */
                            if (
                                typeof(descendant) !== 'object' ||
                                descendant == null
                            ) {
                                return;
                            } else if (typeof(descendant.props.column) !== 'undefined') {
                                let value;

                                if (typeof(descendant.props.data) !== 'undefined') {
                                    value = descendant.props.data;
                                } else if (typeof(descendant.props.children) !== 'undefined') {
                                    value = descendant.props.children;
                                } else {
                                    console.warn('exports.Td specified without ' +
                                                 'a `data` property or children, ' +
                                                 'ignoring');
                                    return;
                                }

                                childData[descendant.props.column] = {
                                    value: value,
                                    props: filterPropsFrom(descendant.props),
                                    __reactableMeta: true
                                };
                            } else {
                                console.warn('exports.Td specified without a ' +
                                             '`column` property, ignoring');
                            }
                        });

                        data.push({
                            data: childData,
                            props: filterPropsFrom(child.props),
                            __reactableMeta: true
                        });
                    break;

                    default:
                        console.warn ('The only possible children of <Table> are <Thead>, <Tr>, ' +
                                      'or one <Tfoot>.');
                }
            }.bind(this));
        }

        return { data, tfoot };
    }
	render () {
		return super.render()
	}
}


export default AuctionTable;
