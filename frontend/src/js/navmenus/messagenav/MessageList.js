import React, { Component } from 'react';
import { graphql,compose } from 'react-apollo';
import { getOfflineMsgs } from '../../../clientQueries/queries';
import {  Preloader, Collection,CollectionItem } from 'react-materialize';
import Message from './Message';
import { findDOMNode } from 'react-dom';

class MessageList extends Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    
    componentDidMount() {
        window.addEventListener('click',this.handleClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click',this.handleClick);
    }

    handleClick(e) {
        if(findDOMNode(this.props.node).contains(e.target)){
            this.props.updateViewMessageList(true);
        }else if(!findDOMNode(this).contains(e.target)){
            this.props.updateViewMessageList(false);
        } 
    }

    loadMessageList =() => {
        const { loading,error,getOfflineMsgs } = this.props.getOfflineMsgs;
        if(loading) return (<Preloader />);
        if(error) return (<div>error :(</div>); 
        
        return getOfflineMsgs.map(item => {
            const { _id  } = item;
            return (<CollectionItem key = {_id}>
                 <Message messageInfo = {item} currUser = {this.props.currUser} /></CollectionItem>)
        });
    }

      render() {
        return (
           <div className='Reqlist' style = {this.props.listStyle}>
              <Collection>{this.loadMessageList()}</Collection>
           </div>        
        );
      }  
}

export default compose(
    graphql(getOfflineMsgs,{name: 'getOfflineMsgs',
             options:(props) => ({
                 variables: {
                     toUser: props.currUser.id,
                     type: 'DETAILCOUNT'
                 },
                 fetchPolicy: "network-only"
             })        
    })
)(MessageList);