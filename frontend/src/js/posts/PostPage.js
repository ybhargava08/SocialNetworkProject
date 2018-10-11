import React from 'react';
import { graphql,compose }  from 'react-apollo';
import { getAllPostsInParts,postActivity } from '../../clientQueries/queries';
import { getCurrentUser } from '../../localStateQueries/localStateQueries';
import { Collection,CollectionItem,Row,Col,Preloader } from 'react-materialize';
import SinglePost from './SinglePost';
import InputPost from './InputPost';
import { postLimit } from '../constants/constants';

class PostPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lastCursorFetched:""
        }
    }

    componentDidMount() {
         this.props.getAllPostsInParts.subscribeToMore({
             document: postActivity,
             updateQuery : (prev,{subscriptionData}) => {
                 if(!subscriptionData) return prev;
                 const newPost = subscriptionData.data.postActivity;
            
                 let result = prev;
                 if(newPost) {
                            result = {
                                ...prev,
                                getAllPostsInParts:{
                                         ...prev.getAllPostsInParts,
                                        posts:[newPost,...prev.getAllPostsInParts.posts]
                                }
                            }
                 }
                 return result;
             }
         });
    }

    fetchMorePosts () {
        if(this.props.getAllPostsInParts && this.props.getAllPostsInParts.getAllPostsInParts && 
            this.props.getAllPostsInParts.getAllPostsInParts.postInfo 
             && this.props.getAllPostsInParts.getAllPostsInParts.postInfo.cursorPointer) {
                    this.props.getAllPostsInParts.fetchMore({
                        variables: {
                            postCursor: this.props.getAllPostsInParts.getAllPostsInParts.postInfo.cursorPointer
                        },
                        updateQuery: (prev,{fetchMoreResult}) => {  
                            if(!fetchMoreResult || !fetchMoreResult.getAllPostsInParts || !fetchMoreResult.getAllPostsInParts.posts ||
                                fetchMoreResult.getAllPostsInParts.posts.length === 0) {
                                return prev;
                            }

                                    const result = {
                                        ...prev,
                                        getAllPostsInParts:{ 
                                            ...prev.getAllPostsInParts,
                                            posts:[...prev.getAllPostsInParts.posts,...fetchMoreResult.getAllPostsInParts.posts],
                                            postInfo:{
                                                ...prev.getAllPostsInParts.postInfo,
                                                cursorPointer:fetchMoreResult.getAllPostsInParts.postInfo.cursorPointer,
                                                hasMorePosts:fetchMoreResult.getAllPostsInParts.postInfo.hasMorePosts
                                            }
                                        }     
                                }
                                return result;
                            
                        }
                    })
             }
    }

   
    loadPosts() {
        const {loading,error,getAllPostsInParts} = this.props.getAllPostsInParts;

        if(loading) return (<Preloader />);
        if(error) return (<div>Error {error.message}</div>);


        return getAllPostsInParts.posts.map(post => {
            return (<CollectionItem key = {post.id}><SinglePost post = {post}/></CollectionItem>);
        });
    }

    checkForMorePosts() {
           const { loading ,getAllPostsInParts } = this.props.getAllPostsInParts;
           if(!loading && getAllPostsInParts && getAllPostsInParts.postInfo){
                const hasMore = getAllPostsInParts.postInfo.hasMorePosts;
                if(hasMore) {
                    return (<a onClick = {() => {this.fetchMorePosts()}}>View More Posts</a>);
                 }
           }
           
           return null;
     }

    render() {
        return (
          <React.Fragment>  
            <Row className='postinput'>
               <Col s = {7}> 
                <InputPost currentuser = {this.props.getCurrentUser.getCurrentUser} /> 
               </Col>    
            </Row>
            <Row>
                <Col s ={7}>
                    <Collection className='post'>
                    {this.loadPosts()}
                    </Collection>
                </Col>
            </Row>    
            {this.checkForMorePosts()}
         </React.Fragment>   
        );
    }
}

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'}),
    graphql(getAllPostsInParts,{name: 'getAllPostsInParts',
        options: (props) => ({
            variables: {
                postCursor:"",
                postLimit
            },
            fetchPolicy:"network-only"
    })
 })
)(PostPage);