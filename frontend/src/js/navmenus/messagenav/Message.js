import React, { Component } from 'react';
import { graphql,compose } from 'react-apollo';
import { addUpLatestTargetUserInfo } from '../../../localStateQueries/localStateQueries';

const msgStyle = {
      color: '#3366CC',
      fontWeight:'bold'  
}

class Message extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
             messageInfo : this.props.messageInfo
        }
    }

     updateTotalMsgs() {
         const { _id,name,isOnline,lastActiveDate } = this.state.messageInfo;
        this.props.addUpLatestTargetUserInfo({variables:{id:_id,name,isOnline,lastActiveDate,opType:'add'}});
    }

    render() {
        return (
            <div onClick = {() => this.updateTotalMsgs()}>
               You have <span style = {msgStyle}>{this.state.messageInfo.count}</span> 
                   &nbsp; unread message(s) from <span style = {msgStyle}>{this.state.messageInfo.name}</span> 
            </div>
         );
    }
};

export default compose(
    graphql(addUpLatestTargetUserInfo,{name: 'addUpLatestTargetUserInfo'})
)(Message);