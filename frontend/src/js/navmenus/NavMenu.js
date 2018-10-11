import React, { Component } from 'react';
import ImageUpload from './imagenav/ImageUpload';
import { Navbar, NavbarBrand, NavbarNav, NavItem } from 'mdbreact';
import { Icon } from 'react-materialize';
import FriendReqNotification from './friendnav/FriendReqNotification';
import { updateShowView } from '../../localStateQueries/localStateQueries';
import { updateUser } from '../../clientQueries/queries';
import { compose,graphql } from 'react-apollo';
import { auth } from '../firebase/firebaseconfig';
import MessageNotification from './messagenav/MessageNotification';

class NavMenu extends Component {
    constructor(props) {
        super(props);
    }

    onClickHome = (e) => {
        e.preventDefault();
        this.props.updateShowView({variables:{view:'post'}});
   }

    doStuffOnUnload = () => {
        auth.signOut().then(() => {
            console.log("signed out");
            const authId = this.props.currUser.authId;
            this.props.updateUser({variables:{authId,isOnline:false}});
            this.props.updateShowView({variables:{view:'post'}});
        });     
    }

    logout = (e) => {
        e.preventDefault();
        if(this.props.currUser.id){
                this.doStuffOnUnload();
        }
    }

      render() {
        return(
            <Navbar fixed="top" color="indigo" dark expand="md" scrolling> 
                <NavbarBrand onClick = {(e) => {e.preventDefault()}}><strong>Basic Chat</strong></NavbarBrand>
                <NavbarNav left>   
                        <ImageUpload currUser = {this.props.currUser}/>
                        <NavItem onClick = {(e) => {this.onClickHome(e)}}><strong>Home</strong></NavItem>							
                        <NavItem><strong>{this.props.currUser.name}</strong></NavItem>
                        <FriendReqNotification currUser = {this.props.currUser}/>
                        <MessageNotification currUser = {this.props.currUser} />
                </NavbarNav>
                <NavbarNav right>
                    <NavItem  onClick = {(e)=>this.logout(e)}><Icon small>lock_open</Icon></NavItem>
                </NavbarNav>
           </Navbar>
        );
      } 
}

export default compose(
    graphql(updateShowView,{name:'updateShowView'}),
    graphql(updateUser,{name: 'updateUser'})
)(NavMenu);