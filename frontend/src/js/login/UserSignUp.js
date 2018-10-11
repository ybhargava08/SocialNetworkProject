import React , { Component } from 'react';
import { Row, Input , Button, Preloader } from 'react-materialize';
import { auth } from '../firebase/firebaseconfig';
import { graphql,compose } from 'react-apollo';
import { addUser } from '../../clientQueries/queries';
import { addCurrentUser } from '../../localStateQueries/localStateQueries';

class UserSignUp extends Component {

   constructor(props) {
       super(props);
       this.state = {
           newUsername: '',
           newPassword: '',
           name: '',
           isLoading:false,
       }
   }

   componentWillUnmount() {
        this.setState({isLoading:false});
   }

   signup(e) {
      e.preventDefault();
      if(this.state.newUsername && this.state.newPassword && this.state.name) {
         this.setState({isLoading:true}); 
        auth.createUserWithEmailAndPassword(this.state.newUsername,this.state.newPassword).
        then(data => {
                if(data) {
                    const { user } = data;
                    this.props.addUser({variables: {name:this.state.name,username: user.email, authId: user.uid}}).then(({data}) => {
                           const { id,authId,name,username,imageDataURL } = data.addUser;
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
           return (<Button s={12}>Sign Up</Button>);
       }
       return (<Preloader />);
   }

   render() {
       return (
            <section className = "userSignUp">  
              <Row>
                <h4 s= {6}>New User ? Sign Up !</h4> 
                <form onSubmit = {(e) => this.signup(e)}>
                    <Input s={12} label = "New Username" value = {this.state.newUsername} 
                    onChange = {(e) => this.setState({newUsername:e.target.value})} />
                    <Input s={12} type = "password" label = "New Password" value = {this.state.newPassword} 
                    onChange = {(e) => this.setState({newPassword:e.target.value})} />
                    <Input s={12} label = "Name" value = {this.state.name} 
                    onChange = {(e) => this.setState({name:e.target.value})} />
                    {this.loadButton()}      
                </form>
              </Row>
            </section>   
       );
   }
}

export default compose(
    graphql(addCurrentUser,{name: 'addCurrentUser'}),
    graphql(addUser,{name: 'addUser'})
)(UserSignUp);