import React from 'react';
import { Icon,Preloader,Collection,CollectionItem } from 'react-materialize';
import SingleUserChatInput from './SingleUserChatInput';
import SingleUserChat from './SingleUserChat';
import { graphql,compose } from 'react-apollo';
import { addUpLatestTargetUserInfo,getCurrentUser } from '../../localStateQueries/localStateQueries';
import { personChatActivity,userActivity } from '../../clientQueries/queries';

class SingleUserChatBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            targetUserInfo: this.props.item      
        }
    }

    componentDidMount() {
        
        this.setScrollBarToBottom();  

        this.props.result.subscribeToMore({
            document: personChatActivity,
            variables: {firstUserId: this.props.getCurrentUser.getCurrentUser.id,
                secondUserId: this.state.targetUserInfo.id,targetUserIDs:null},
            updateQuery: (prev,{subscriptionData}) => {
               if (!subscriptionData) return prev;
               const newData = subscriptionData.data.personChatActivity;
               return ({...prev,getPersonChats:[...prev.getPersonChats,newData]});
            }
       });
    }

    componentDidUpdate() {
        this.setScrollBarToBottom();
    }

    setScrollBarToBottom (){
        //this.node.scrollIntoView({behavior:'smooth'});
        this.node.scrollTop = this.node.scrollHeight;
    }

    componentWillReceiveProps(props) {
        if(props.userActivity && !props.userActivity.loading) {
            const { userData } = props.userActivity.userActivity;
            if(userData){
                this.setState({targetUserInfo:userData});
            }
        }
    }

    loadChatBox(result) {
        const {loading,error,data} = result;
        if(loading) return (<Preloader />)
        if(error) return (<div>Error {error.message}</div>)  
        
        return data.getPersonChats.map(item => {
            return (<li key = {item.id}><SingleUserChat item={item}/></li>)
        }) ;      
    }

   cancelClicked() {
          console.log("icon clicked ");
          const { id,name } = this.state.targetUserInfo;
          this.props.addUpLatestTargetUserInfo({variables:{id,name,opType:'remove'}});
   }

    render() {
        return (
            <React.Fragment>
               <div className='singleuserchatheader'>
                   <div style = {this.state.targetUserInfo.isOnline ? {backgroundColor:'#49fb35'}: {backgroundColor:'#F0F0F0'}} 
                         className='onlineIndChatBox'></div> 
                  <span className="cancelIcon" onClick = {()=>this.cancelClicked()}>
                      <Icon>cancel</Icon></span>{this.state.targetUserInfo.name}</div>
                  <span className='offlineIndicator'>
                      <i>{this.state.targetUserInfo.isOnline?'':this.state.targetUserInfo.name+' is Offline'}</i></span>  
               <ul className = 'chatul' ref = {node => this.node = node}>{this.loadChatBox(this.props.result)}</ul>
               <SingleUserChatInput targetUserInfo = {this.state.targetUserInfo}/>
            </React.Fragment>    
         );
    }
}

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'}),
    graphql(addUpLatestTargetUserInfo,{name:'addUpLatestTargetUserInfo'}),
    graphql(userActivity,{name: 'userActivity',
        options: (props) => ({
             variables: {
                 id: props.item.id,
                 activityType: ['ISONLINE']
             }
        })
   })
)(SingleUserChatBox);