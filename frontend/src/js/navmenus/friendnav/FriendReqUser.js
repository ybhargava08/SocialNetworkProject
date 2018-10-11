import React, { Component,Fragment } from 'react';
import { getImage } from '../../constants/constants';
import { compose,graphql } from 'react-apollo';
import { friendRequest } from '../../../clientQueries/queries';
import { Preloader } from 'react-materialize';

class FriendReqUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user:this.props.user,
            isShowButton:true
        }
    }

    acceptFriendRequest = () => {
        this.props.friendRequest({variables:{fromUser:this.props.currUser.id,toUser:this.state.user.id,type:'FRIENDS'}}).then(res => {
            const { data: {friendRequest} } = res;
            this.setState({user:friendRequest});
        });
    }

    showButton = () => {
        if(this.state.isShowButton) {
            return (<button onClick = {() => this.acceptFriendRequest()}>Confirm</button>);
        }else{
            return (<Preloader/>);
        }
    }
   
     loadFriendUser = () => {
         if(this.state.user.status === 'FRIENDS') {
             return (
              <div className = 'friendReqUser'>
                  <span><img src = {getImage(this.state.user)} /></span>
                  <span>You and {this.state.user.name} are now friends</span>
              </div>   
             );
         }else{
             return (
              <div className = 'friendReqUser'>
                  <span><img src = {getImage(this.state.user)} /></span>
                  <span>{this.state.user.name}</span>
                  {this.showButton()}
              </div>
             );
         }
     }

    render() {
        return ( 
            <Fragment>{this.loadFriendUser()}</Fragment>
       );
    } 
};

export default compose(
    graphql(friendRequest,{name:'friendRequest'})
)(FriendReqUser);