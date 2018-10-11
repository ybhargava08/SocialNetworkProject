import React,{ Component,Fragment } from 'react';
import { NavItem } from 'mdbreact';
import { graphql,compose } from 'react-apollo';
import FriendReqList  from './FriendReqList';
import { getFriendRequestCount, friendReqActivity } from '../../../clientQueries/queries';

class FriendReqNotification extends Component{
    constructor(props){
        super(props);
        this.state = {
            count:0,
            skipLoadingFriendListQuery:true, 
            showFriendList:false
        }
    }

   componentWillReceiveProps(props) {
    if(props.getFriendRequestCount && !props.getFriendRequestCount.loading && props.getFriendRequestCount.getFriendRequestCount &&
        props.getFriendRequestCount.getFriendRequestCount.count > 0) {
            const count = props.getFriendRequestCount.getFriendRequestCount.count;
          this.setState({count});
     }

    if(props.friendReqActivity && !props.friendReqActivity.loading 
        && props.friendReqActivity.friendReqActivity 
        && props.friendReqActivity.friendReqActivity.id) {
            this.setState(prevState => ({count:prevState.count+1}));
    } 
   } 

   showNotificationText = () => {
        if(this.state.count > 0) {
            return (<span className='notificationText'>{this.state.count}</span>);
        }
        return null;
   }

   updateViewFriendReqList = (boolValue) => {
              this.setState({showFriendList:boolValue});
   }

   showFriendList = () => {
        if(this.state.showFriendList) {
             return (<FriendReqList listStyle = 
                 {{position:'absolute',top:this.node.offsetTop+this.node.offsetHeight,left:this.node.offsetLeft}} 
                 currUser = {this.props.currUser} node = {this.node} updateViewFriendReqList = {this.updateViewFriendReqList}/>);
        }else{
            return (<Fragment></Fragment>);
        }
   }

   clickIcon = () => {
    this.setState({count:0});
    this.setState(prevState => ({showFriendList:!prevState.showFriendList}))
   }

   showFriendRequestCount = () => { 
           return (
              <Fragment> 
                <NavItem className='notification'>
                    <div className='notificationDiv' ref = {node => this.node = node}>
                        <i className='fa fa-user' onClick = 
                            {() => this.clickIcon()}></i>
                        {this.showNotificationText()}
                    </div>
                </NavItem>
                {this.showFriendList()} 
             </Fragment>   
           ) ;
   }

   render(){
       return (
            <Fragment>
                {this.showFriendRequestCount()}
            </Fragment>   
       );
   }

} 

export default compose(
    graphql(getFriendRequestCount,{name: 'getFriendRequestCount',
        options: (props) => ({
            variables: {
                id: props.currUser.id,
                status: 'AWAITING'
            },
            fetchPolicy:"network-only"
        })
  }),
  graphql(friendReqActivity,{name: 'friendReqActivity',
       options: (props) => ({
           variables: {
                userId:props.currUser.id,
                type:'ALL'
           }
       })
  })
)(FriendReqNotification);