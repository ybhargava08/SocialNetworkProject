import React from 'react';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import { getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql,compose } from 'react-apollo';
import { Row,Col } from 'react-materialize';
 
const CommentSection = (props) => {

    return(
        <React.Fragment>    
            <Row className="commentSectionRows">
              <Col s= {10}>
               <CommentInput currUser = {props.getCurrentUser.getCurrentUser} postId = {props.postId}/>
               </Col> 
            </Row>
            <Row className="commentSectionRows">
             <Col s = {10}>
                <CommentList postId = {props.postId} updateCommentCount = {props.updateCommentCount} />
             </Col>   
            </Row>
        </React.Fragment> 
    );
}

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'})
)(CommentSection);