import React from 'react';
import { graphql,compose } from 'react-apollo';
import { addUpLatestTargetUserInfo } from '../../localStateQueries/localStateQueries';
import { Badge } from 'react-materialize';
import { userActivity } from '../../clientQueries/queries';
import { getImage } from '../constants/constants';

class ContactUser extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            newMsgs:0,
            user:this.props.user
        }
    }

  componentWillReceiveProps(props) {
        if(props.personSubsData && props.personSubsData.personChatActivity) {
            this.setState((prevState) => ({newMsgs:prevState.newMsgs+1}));
        }

        if(props.userActivity && !props.userActivity.loading) {
            const { activityType,userData } = props.userActivity.userActivity;

           // console.log("got useractivity "+JSON.stringify(activityType)+" "+JSON.stringify(userData));  

            if(activityType && userData) {

                 if('CHANGE_PICTURE' === activityType){
                      this.setState(prevState => ({
                            user:{
                                ...prevState.user,
                                imageDataURL:userData.imageDataURL
                            }
                      }));

                 }else if('ISONLINE' === activityType){
                     this.setState(prevState => ({
                        user:{
                            ...prevState.user,
                            isOnline:userData.isOnline
                        }
                  }));
                 }
            }
        }
    }

    addTargetUserToChatWindow(id,name,isOnline,lastActiveDate) {
        if(this.props.currentuser.id !== id){
           this.props.addUpLatestTargetUserInfo({variables:{id,name,isOnline,lastActiveDate,opType:'add'}});
           this.setState({newMsgs:0});
        }               
    }

    showMsgCount() {
        
       if (this.state.newMsgs > 0 && this.state.user.isOnline) {
           return (<Badge newIcon>{this.state.newMsgs}</Badge>);
       }
       return null;
    } 

    showOnlineInd() {
        if (this.state.user.isOnline) {
            return (<div className='onlineInd'></div>); 
        }
        return null;
    }

    render() {
        return (
          <div style={this.state.user.isOnline ? {opacity:'1'}: {opacity:'0.8'}} 
               onClick = {() => this.addTargetUserToChatWindow(this.state.user.id,this.state.user.name,
                          this.state.user.isOnline,this.state.user.lastActiveDate)}>  
               {this.showMsgCount()}
              <span className='ContactUserImg'><img src = {getImage(this.state.user)}/>
              </span><span className= 'onlineUserSpan'>{this.state.user.name}</span>
              {this.showOnlineInd()}
          </div>
        );
    }
}

export default compose(
    graphql(addUpLatestTargetUserInfo,{name:'addUpLatestTargetUserInfo'}),
    graphql(userActivity,{name: 'userActivity',
     options: (props) =>({
         variables:{
             id: props.user.id,
             activityType: ['CHANGE_PICTURE','ISONLINE']
         }
     })
  })
)(ContactUser);