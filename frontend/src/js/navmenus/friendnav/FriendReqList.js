import React, { Component } from 'react';
import { getFriends } from '../../../clientQueries/queries';
import { graphql, compose } from 'react-apollo';
import { Preloader,Collection,CollectionItem } from 'react-materialize';
import { findDOMNode } from 'react-dom';
import FriendReqUser from './FriendReqUser';

class FriendReqList extends Component{
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        console.log('FriendReqList mounted');
        window.addEventListener('click',this.handleClick);
    }  

    componentWillUnmount() {
        window.removeEventListener('click',this.handleClick);
    }

    handleClick(e) {
        if(findDOMNode(this.props.node).contains(e.target)){
            this.props.updateViewFriendReqList(true);
        }else if(!findDOMNode(this).contains(e.target)){
            this.props.updateViewFriendReqList(false);
        } 
    }

    renderFriendReqList() {
        const { loading,error,getFriends } = this.props.getFriends;
        if(loading) return (<Preloader />);
        if(error) return (<div>{error.message}</div>);

        return getFriends.map(user => {
             return (<CollectionItem key = {user.id}><FriendReqUser user = {user} currUser = {this.props.currUser}/></CollectionItem>);
        })        
    }

    render() {
        return (
            <div className = 'ReqList' style = {this.props.listStyle}>  
             <Collection>{this.renderFriendReqList()}</Collection>
            </div> 
        );
    }
}

export default compose(
    graphql(getFriends,{name:'getFriends',
      options:(props) => ({
          variables: {
               id:props.currUser.id,
               status: 'ALL'
          },
          fetchPolicy:"network-only"
      })
    })
)(FriendReqList);