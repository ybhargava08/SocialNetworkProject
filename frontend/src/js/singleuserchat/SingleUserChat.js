import React from 'react';
import { graphql,compose } from 'react-apollo';
import { getCurrentUser } from '../../localStateQueries/localStateQueries';
import { getDateNoSecs } from '../FormatDate';

const SingleUserChat = (props) => {

    return (
           <div style={{marginLeft: (props.getCurrentUser.getCurrentUser.id === props.item.fromUser.id)?'50%':'0',
                 backgroundColor: (props.getCurrentUser.getCurrentUser.id === props.item.fromUser.id)?'#CCFFFF':'#CCFFCC'}} 
                    className='singleUserChatDiv'>
              <span className='singleUserChatDivChat'>{props.item.text}</span>
              <span className='singleUserChatDivDate'><i>{getDateNoSecs(props.item.chatDate)}</i></span>
           </div> 
    );

};

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'})
)(SingleUserChat);