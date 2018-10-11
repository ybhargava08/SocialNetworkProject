import React , { Component } from 'react';
import { Input, Row, Button, Preloader } from 'react-materialize';
import { auth } from '../firebase/firebaseconfig';
import { graphql,compose } from 'react-apollo';
import { updateUser } from '../../clientQueries/queries';
import { addCurrentUser } from '../../localStateQueries/localStateQueries';

class UserSignIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username:'',
            password:'',
            isLoading:false
        }
    }

    componentWillUnmount() {
        this.setState({isLoading:false});
    }

    submit(e) {
        e.preventDefault();
        if(this.state.username && this.state.password) {
            this.setState({isLoading:true}); 
             auth.signInWithEmailAndPassword(this.state.username,this.state.password).
             then(data => {
                 if(data) {
                        const { user } = data;
                        this.props.updateUser({variables: {authId: user.uid,isOnline:true}}).then(({data}) => {
                            const { id,authId,name,username,imageDataURL } = data.updateUser;
                            this.props.addCurrentUser({variables:{id,authId,name,username,imageDataURL}}).then(() => {
                                this.props.updateUserLoadedInCache(true);
                            });
                        });
                 }
             }).catch(err => {
                this.props.setErrorMsg(err.message);
                this.setState({isLoading:false}); 
             });
        }
    }

    loadButton() {
        if(!this.state.isLoading){
            return (<button className = "signButton">Log In</button>);
        }
        return (<Preloader />);
    }
 

    render() {
       return (
         <Row>  
          <form onSubmit = {(e) => this.submit(e)}>
              <input className = "signInput" placeholder="email" value = {this.state.username} 
                   onChange = {(e) => this.setState({username: e.target.value})} />
               <input className = "signInput" type = "password"  placeholder="password" value = {this.state.password} 
                   onChange = {(e) => this.setState({password: e.target.value})} />   
               {this.loadButton()}      
          </form>
         </Row>        
       );
    }
}

export default compose(
    graphql(addCurrentUser,{name: 'addCurrentUser'}),
    graphql(updateUser,{name: 'updateUser'})
)(UserSignIn);