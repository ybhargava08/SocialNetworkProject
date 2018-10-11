import React, { Component } from 'react';
import _ from 'lodash';
import { getUserSearchResult,getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql, compose } from 'react-apollo';
import { getFriendRelationship } from '../../clientQueries/queries';
import { Collection, CollectionItem,Preloader,Row,Col } from 'react-materialize';
import SingleUserSearch from './SingleUserSearch';

class UserSearchResult extends Component {

    constructor(props){
        super(props);
    }

    renderUserRelationship() {
        const { loading,error,getFriendRelationship } = this.props.getFriendRelationship;
        if(loading) {
               return (<Preloader />);
        }
        if(error) {
            return (<div>{error.message}</div>);
        }

        console.log("getFriendRelationship data is "+JSON.stringify(getFriendRelationship));
        return getFriendRelationship.map(item => {
            return (<CollectionItem key = {item.id}><SingleUserSearch item ={item} 
                 currUser = {this.props.getCurrentUser.getCurrentUser}/></CollectionItem>) 
        })
    }

    render() {
        return(
           <Row><Col s = {6}>
                <Collection header = 'Results'> 
                {this.renderUserRelationship()}
                </Collection>
           </Col></Row> 
        );
    }
}

export default compose(
    graphql(getCurrentUser,{name:'getCurrentUser'}),
    graphql(getUserSearchResult,{name: 'getUserSearchResult'}),
    graphql(getFriendRelationship,{name: 'getFriendRelationship',
      options: (props) =>({
          variables: {
              id: props.getCurrentUser.getCurrentUser.id,
              targetUserList: _.map(props.getUserSearchResult.getUserSearchResult.userSearchResult,
                item => _.pick(item,['id','name','username','authId','isOnline','lastActiveDate','imageDataURL']))
          }
      })
    })
)(UserSearchResult);