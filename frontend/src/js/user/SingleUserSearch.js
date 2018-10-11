import React,{ Component,Fragment } from 'react';
import { graphql,compose } from 'react-apollo';
import { Button } from 'react-materialize';
import { friendRequest } from '../../clientQueries/queries';
import { getImage } from '../constants/constants';

class SingleUserSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            status:this.props.item.status
        }
    }

    showFriendStatus = (item) => {
        if(item.id !== this.props.currUser.id) {
              if(this.state.status && 'AWAITING' === this.state.status) {
                   return (<span>Friend Request Sent</span>)
              }else if(this.state.status && 'FRIENDS' === this.state.status) {  
                 return (<span>Friends</span>)
              }else{
                  return (<Button onClick = {() => this.addFriend(item)}>Add Friend</Button>);
              }       
        }
        return null;
    }

    addFriend = (user) => {
        console.log("calling add friend for user "+JSON.stringify(user));
         this.props.friendRequest({variables:{fromUser:this.props.currUser.id,toUser:user.id,type:'AWAITING'}}).
         then(res => {
              console.log("friend req response is "+JSON.stringify(res));
              const {data: {friendRequest}} = res;
              this.setState({status:friendRequest.status});
         });
    }

    render() {

        const user = this.props.item;
        return (
              <Fragment>
                  <span className = 'userSearchResultImg'><img src = {getImage(user)} /></span>
                  <span className='userSearchResultName'>{user.name}</span>
                  <span className='userSearchResultStatus'>{this.showFriendStatus(user)}</span>
              </Fragment>
        );
    }
}

export default compose(
    graphql(friendRequest,{name:'friendRequest'})
)(SingleUserSearch);