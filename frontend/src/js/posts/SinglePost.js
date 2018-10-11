import React from 'react';
import { Row,Col,Preloader } from 'react-materialize';
import { getDateNoSecs } from '../FormatDate';
import CommentSection from '../postComments/CommentSection';
import { userActivity } from '../../clientQueries/queries';
import { graphql,compose } from 'react-apollo';
import { getImage } from '../../js/constants/constants';

class SinglePost extends React.Component {

    constructor(props) {
       super(props);
       this.state = {
           postData : this.props.post,
           commentCount:this.props.post.commentsCount,
           isMediaLoaded:false
        }
    }

    componentWillReceiveProps(props) {
             if(props.userActivity && !props.userActivity.loading) {
                const { userData } = props.userActivity.userActivity;
                if(userData) {
                    this.setState(prevState => ({
                         postData : {
                             ...prevState.postData,
                             users:{
                                 ...prevState.postData.users,
                                 imageDataURL:userData.imageDataURL     
                             }
                         }
                    }));
                }
             }
    }

    showCommentCount = () => {
        if(this.state.commentCount > 0) {
            const verbiage = (this.state.commentCount > 1)?'Comments':'Comment';
            return (<div className = 'showCommentCount'>{this.state.commentCount} {verbiage}</div>)
        }
        return null;
    }

    updateCommentCount = (count) => {
        this.setState(prevState => ({commentCount:prevState.commentCount+count}));
    }

    showPostType() {
        if (this.state.postData.type === 'TEXT') {
            return (<Row className='postText'><strong>{this.state.postData.text}</strong></Row>);
        }else if (this.state.postData.type === 'IMAGE') {
                return (<Row><img className='postImg' style = {this.state.isMediaLoaded?{}:{'display':'none'}} 
                   src = {this.state.postData.text} onLoad = {() => {this.setState({isMediaLoaded:true})}}/>
                   {this.showLoader()}
                   </Row>); 
        }else if (this.state.postData.type === 'VIDEO') {
            return (<Row><video className='postImg' controls>
                        <source src = {this.state.postData.text}></source>
                        </video> 
                    </Row>); 
    }
        return null;
    }

    showLoader() {
        if(!this.state.isMediaLoaded) {
            return (<Preloader />);
        }
        return null;
    }

    render() {
        return (
            <React.Fragment>
                <Row>
                    <span className='PostUserImg'><img src = {getImage(this.state.postData.users)}/></span>
                    <span className='postName'>{this.state.postData.users.name}</span>
                    <span className = 'postTime'>{getDateNoSecs(this.state.postData.postDate)}</span>
                    <div style = {{width:'100%',border:'0.5px solid lightgray',marginTop:'2%'}}></div>
                </Row>
                {this.showPostType()}
                <div style = {{width:'100%',border:'0.5px solid lightgray',marginTop:'2%'}}></div>
                {this.showCommentCount()}
                <Row><Col s= {10}><CommentSection postId = {this.state.postData.id} 
                       updateCommentCount = {this.updateCommentCount} /></Col></Row>
             </React.Fragment>   
         );
    }
     
}

export default compose(
    graphql(userActivity,{name: 'userActivity',
      options: (props) =>({
          variables: {
                 id:props.post.users.id,
                 activityType: ['CHANGE_PICTURE']
          }
      })
   })
)(SinglePost);