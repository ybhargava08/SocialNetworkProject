import React from 'react';
import { graphql,compose } from 'react-apollo';
import { addComment } from '../../clientQueries/queries';
import { Input } from 'react-materialize';
import { getImage } from '../../js/constants/constants';

class CommentInput extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            comment:''
        }
    }
 
    onEnterComments(e) {
        e.preventDefault();
        this.props.addComment({variables:{
            text:this.state.comment,
            fromUser:this.props.currUser.id,
            postId: this.props.postId
           }}).then(() => {
               this.setState({comment:''});
           });
    }

    render() {
        return (
                 <form onSubmit = {(e) => this.onEnterComments(e)}>
                    <span className='CommentUserImg'><img src = {getImage(this.props.currUser)}/></span>
                    <Input s={10} type = "text" className= "commentInput" placeholder="Add Comments" value = {this.state.comment} 
                       onChange = {(e) => this.setState({comment:e.target.value})}></Input>
                 </form>
        );
    }
}

export default compose(
    graphql(addComment,{name: 'addComment'})
)(CommentInput);