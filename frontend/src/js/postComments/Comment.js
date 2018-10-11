import React from 'react';
import { getDateNoSecs } from '../FormatDate';
import { userActivity } from '../../clientQueries/queries';
import { graphql,compose } from 'react-apollo';
import { getImage } from '../../js/constants/constants';

class Comment extends React.Component {

    constructor(props){
      super(props);
      this.state = {
         comment: this.props.comment
      }
    }

    
    componentWillReceiveProps(props) {
      if(props.userActivity && !props.userActivity.loading) {
         const { userData } = props.userActivity.userActivity;
         if(userData) {
             this.setState(prevState => ({
                comment : {
                      ...prevState.comment,
                      users:{
                          ...prevState.comment.users,
                          imageDataURL:userData.imageDataURL     
                      }
                  }
             }));
         }
      }
}
     
    render() {
          return (
            <React.Fragment>
              <span className='CommentDisplayUserImg'><img src = {getImage(this.state.comment.users)}/></span>
              <div className="commentsDisplay">
                <span>{this.state.comment.users.name}</span>
                <span style={{fontSize:'0.9em'}}> {this.state.comment.text}</span>
              </div>    
              <div className="commentsDate">{getDateNoSecs(this.state.comment.commentDate)}</div>
          </React.Fragment>
        );
    }
    
}

export default compose(
  graphql(userActivity,{name: 'userActivity',
    options: (props) =>({
        variables: {
               id:props.comment.users.id,
               activityType: ['CHANGE_PICTURE']
        }
    })
 })
)(Comment);