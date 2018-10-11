import React from 'react';
import { graphql,compose,Query,Subscription } from 'react-apollo';
import { userActivity,getAllUsers,personChatActivity } from '../../clientQueries/queries';
import { getLatestTargetUserInfo } from '../../localStateQueries/localStateQueries';
import { Collection,CollectionItem,Preloader } from 'react-materialize';
import ContactUser from './ContactUser';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

class UserList extends React.Component {

    constructor(props) {
        super(props) ;
    }

    componentDidMount() {
        this.props.getAllUsers.subscribeToMore({
            document: userActivity,
            variables: {id:'',activityType: 'ISONLINE'},
            updateQuery: (prev,{subscriptionData}) => {
                  if(!subscriptionData.data) return prev;
                  const newUserObj = subscriptionData.data.userActivity;

                  if(!newUserObj) return prev;

                  const { userData } = newUserObj;

                  if(!userData || !this.props.currUser.id) return prev;

                   console.log("user id in user list "+this.props.currUser.id);

                  if(this.props.currUser.id === userData.id ) return prev;
                                    
                  const objIndex = prev.getAllUsers.findIndex(item => item.id === userData.id);
                  if(objIndex === -1) {
                      return {...prev,getAllUsers: [userData,...prev.getAllUsers]};    
                  }
                  return prev;
            }
        });
    }

    loadContactUserItems(targetInfoList,contactUser) {
        return (
            <Subscription subscription ={personChatActivity} 
                                      variables={{firstUserId:this.props.currUser.id,
                                        secondUserId:contactUser.id,
                                        targetUserIDs:_.map(targetInfoList,'id')}}> 
                {
                    ({data}) => {
                            return (
                             <CollectionItem className='onlineUser'>  
                                <ContactUser user = {contactUser} currentuser={this.props.currUser}
                                                 personSubsData = {data}/>
                             </CollectionItem>
                            );
                    }
                } 
                  
            </Subscription>
        );
    }

    loadUserList() {
      if(this.props.getAllUsers){
            const {loading,error,getAllUsers} = this.props.getAllUsers;
            if(loading) {
                return (<Preloader />)
            }
            if(error) {
            return (<div>Error :( {error.message}</div>)
            }
            return getAllUsers.filter(user => this.props.currUser.id!==user.id).map(user=> {
                    return (<Query query = {getLatestTargetUserInfo} key = {user.id}> 
                            {
                                ({loading,error,data}) => {
                                    if (loading) return <Preloader />;
                                    if(error) return `Error ${error.message}`;
    
                                    //  console.log("data for targetinfolist "+JSON.stringify(data));
                                    return this.loadContactUserItems(data.getLatestTargetUserInfo.targetInfoList,user);
                                }
                            }
                            </Query>)
            });
      }  
    }

    render() {
        return (
           <React.Fragment>    
                <Collection className='userListStyle'>
                <div className='contactsBar'>Contacts</div>
                {this.loadUserList()}  
                </Collection>   
           </React.Fragment>  
         );
    } 
    
}

export default compose(
   graphql(getAllUsers,{name: 'getAllUsers',
        options: (props) => ({
            variables :{
                userId:props.currUser.id
            },
            fetchPolicy: "network-only"
        })
   }) 
)(withRouter(UserList));

