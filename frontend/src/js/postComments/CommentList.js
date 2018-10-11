import React from 'react';
import { Collection,CollectionItem,Preloader } from 'react-materialize';
import { graphql,compose } from 'react-apollo'; 
import { getCommentsInParts,commentActivity } from '../../clientQueries/queries';
import { commentLimit } from '../constants/constants';
import Comment from './Comment';

class CommentList extends React.Component {

      componentDidMount() {
          this.props.getCommentsInParts.subscribeToMore({
                 document: commentActivity,
                 variables: {postId: this.props.postId},
                 updateQuery: (prev,{subscriptionData}) => {
                     if(!subscriptionData) return prev;

                     const newComment = subscriptionData.data.commentActivity;
                     this.props.updateCommentCount(1);  
                     const result = {
                         ...prev,
                         getCommentsInParts:{
                             ...prev.getCommentsInParts,
                             comments: [newComment,...prev.getCommentsInParts.comments]
                         }
                     }
                     return result;
                 }
          });
      }

      loadMoreComments() {
         if(this.props.getCommentsInParts && this.props.getCommentsInParts.getCommentsInParts &&
            this.props.getCommentsInParts.getCommentsInParts.commentInfo) {
                this.props.getCommentsInParts.fetchMore({
                     variables: {
                         commentCursor: this.props.getCommentsInParts.getCommentsInParts.commentInfo.commentCursor
                     },
                     updateQuery: (prev,{fetchMoreResult}) => {
                        if(!fetchMoreResult || !fetchMoreResult.getCommentsInParts || !fetchMoreResult.getCommentsInParts.comments ||
                            fetchMoreResult.getCommentsInParts.comments.length === 0) {
                            return prev;
                        } 

                        const result = {
                            ...prev,
                            getCommentsInParts:{
                                ...prev.getCommentsInParts,
                                comments:[...prev.getCommentsInParts.comments,...fetchMoreResult.getCommentsInParts.comments],
                                commentInfo:{
                                    ...prev.getCommentsInParts.commentInfo,
                                    commentCursor:fetchMoreResult.getCommentsInParts.commentInfo.commentCursor,
                                    hasMoreComments:fetchMoreResult.getCommentsInParts.commentInfo.hasMoreComments
                                }
                            }     
                       }
                        return result;
                     }
                })
         }
     }

     loadComments() {
        const {loading,error,getCommentsInParts} = this.props.getCommentsInParts;
        if(loading) return (<Preloader />);
        if(error) return (<div>error :( {error.message}</div>);
        
        return getCommentsInParts.comments.map(comment => {
                 return <CollectionItem key = {comment.id}><Comment  comment={comment}/></CollectionItem>
        });
    }

      checkForMoreComments() {
        const { loading ,getCommentsInParts } = this.props.getCommentsInParts;
           if(!loading && getCommentsInParts && getCommentsInParts.commentInfo){
                const hasMore = getCommentsInParts.commentInfo.hasMoreComments;
                if(hasMore) {
                    return (<a onClick = {() => {this.loadMoreComments()}}>View More Comments</a>);
                }
           }
           return null;    
    }

      render(){
        return (
            <React.Fragment>
                 <Collection className="comments">
                     {this.loadComments()}
                 </Collection>
                 {this.checkForMoreComments()} 
            </React.Fragment>
         );
      }
}

export default compose(
    graphql(getCommentsInParts,{name: 'getCommentsInParts' ,
           options: (props) => ({
               variables: {
                    postId: props.postId, 
                    commentCursor:"",
                    commentLimit
               },
               fetchPolicy:"network-only"
           })
    })
)(CommentList);