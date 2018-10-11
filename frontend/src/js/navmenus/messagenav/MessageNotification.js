import React,{ Component,Fragment } from "react";
import { NavItem,Dropdown,DropdownMenu, DropdownToggle } from 'mdbreact';
import { graphql,compose } from 'react-apollo';
import { getOfflineMsgs,unreadMsgCountActivity } from '../../../clientQueries/queries';
import MessageList from './MessageList';

class MessageNotification extends Component {
       constructor(props) {
           super(props);
           this.state = {
                totalMsgCount:0,
                showMessageList:false
           }
       }
     
    componentWillReceiveProps(props) {
        if(props.getOfflineMsgs && !props.getOfflineMsgs.loading && props.getOfflineMsgs.getOfflineMsgs
            && props.getOfflineMsgs.getOfflineMsgs.length > 0) {
              const obj = props.getOfflineMsgs.getOfflineMsgs[0];
              this.setState({totalMsgCount:obj.count});
         }

         if(props.unreadMsgCountActivity && !props.unreadMsgCountActivity.loading 
             && props.unreadMsgCountActivity.unreadMsgCountActivity) {
                const { count } = props.unreadMsgCountActivity.unreadMsgCountActivity;
                let totalMsgCount = this.state.totalMsgCount;
                totalMsgCount = totalMsgCount-count;
                if(totalMsgCount > 0) {
                    this.setState({totalMsgCount});
                }else{
                this.setState({totalMsgCount:0});
                }
         } 
    } 
    
    updateViewMessageList = (boolValue) => {
              this.setState({showMessageList:boolValue});
    }

    showNotificationText = () => {
        if(this.state.totalMsgCount > 0) {
            return (<span className='notificationText'>{this.state.totalMsgCount}</span>);
        }
        return null;
    }

    showFriendList = () => {
        if(this.state.showMessageList) {
             return (<MessageList listStyle = 
                 {{position:'absolute',top:this.node.offsetTop+this.node.offsetHeight,left:this.node.offsetLeft}} 
                 currUser = {this.props.currUser} node = {this.node} updateViewMessageList = {this.updateViewMessageList}/>);
        }
        return (<Fragment></Fragment>);
    }

    clickIcon = () => {
        this.setState({showMessageList:true});
        this.setState({totalMsgCount:0});
    }

      render() {
        return (
            <Fragment> 
               <NavItem className='notification' onClick = {() => this.clickIcon()}>
                    <div className='notificationDiv' ref = {node => this.node = node}>
                        <i className='fa fa-globe'></i>
                        {this.showNotificationText()}
                    </div>
                </NavItem>
                {this.showFriendList()}
             </Fragment> 
           );
      } 
}

export default compose(
    graphql(getOfflineMsgs,{name: 'getOfflineMsgs',
          options: (props) => ({
            variables: {  
                toUser: props.currUser.id,
                type: 'TOTALCOUNT'
            },
            fetchPolicy:"network-only"
          })
    }),
    graphql(unreadMsgCountActivity,{name: 'unreadMsgCountActivity',
           options: (props) => ({
                 variables:{
                     userId: props.currUser.id
                 }
           })
   })
)(MessageNotification);