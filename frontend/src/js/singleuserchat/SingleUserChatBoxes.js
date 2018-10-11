import React from 'react';
import SingleUserChatBox from './SingleUserChatBox';
import { Preloader,CollectionItem,Row } from 'react-materialize'; 
import { getLatestTargetUserInfo,getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql,compose,Query } from 'react-apollo';
import { getPersonChats } from '../../clientQueries/queries';

class SingleUserChatBoxes extends React.Component {

   constructor(props) {
       super(props);
   }

   loadChatBoxes(loading,error,data) {
       if(loading) return (<Preloader />)
       if(error) return (<div>Error - {error.message}</div>)

      // console.log("received "+JSON.stringify(data));
       return data.getLatestTargetUserInfo.targetInfoList.map(item => {
           return ( 
            <Query key = {item.id} query = {getPersonChats} variables = {{firstUserId: this.props.getCurrentUser.getCurrentUser.id,
                secondUserId: item.id}} fetchPolicy="network-only">
               {
                   (result) => {return (<CollectionItem><SingleUserChatBox item={item} result = {result}/></CollectionItem>) }
               }  
           </Query>
        );
       });
   }

   render() {
        return (
            <Row>
                <div className='singleuserchatboxes'>
                  <Query query = {getLatestTargetUserInfo}>
                     {
                         ({loading,error,data}) => this.loadChatBoxes(loading,error,data)
                     }
                  </Query>
                </div>
            </Row>     
        );
   }
};  

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'})
)(SingleUserChatBoxes);