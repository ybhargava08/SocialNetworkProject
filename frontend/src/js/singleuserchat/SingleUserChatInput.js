import React from 'react';
import { Input } from 'react-materialize';
import { addPersonChat } from '../../clientQueries/queries';
import { getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql,compose } from 'react-apollo';

class SingleUserChatInput extends React.Component{

    constructor(props) {
        super(props);
        this.state ={
            chatText: '',
            targetUserInfo: this.props.targetUserInfo
        }
    }

    sendChat(e) {
       e.preventDefault();
    
       const fromUser = this.props.getCurrentUser.getCurrentUser.id;
       const toUser = this.state.targetUserInfo.id;
       console.log("sent chat data "+JSON.stringify(fromUser) +" "+JSON.stringify(toUser)+" "+this.state.chatText 
           +" online status "+String(this.props.targetUserInfo.isOnline));
       this.props.addPersonChat({variables:{text:this.state.chatText,fromUser,toUser,
             isRead:this.props.targetUserInfo.isOnline}});
       this.setState({chatText:''})
    }

    render() {
        return(
           <form onSubmit = {(e) => this.sendChat(e)}>
             <Input placeholder='Enter Text' value = {this.state.chatText} 
               onChange = {(ev)=>{this.setState({chatText:ev.target.value})}} />  
           </form>   
        );
    }
}

export default compose(
    graphql(addPersonChat,{name:'addPersonChat'}),
    graphql(getCurrentUser,{name:'getCurrentUser'})
)(SingleUserChatInput);