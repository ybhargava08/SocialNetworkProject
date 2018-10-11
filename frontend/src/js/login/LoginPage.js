import React, { Component, Fragment } from 'react';
import { Row, Navbar,Icon } from 'react-materialize';
import UserSignIn from './UserSignIn';
import UserSignUp from './UserSignUp';

class LoginPage extends Component {
     
   constructor(props) {
       super(props);
       this.state= {
          errorMsg:''
       }
   }

   setErrorMsg =(errorMsg) => {
         this.setState({errorMsg});
   }

   showErrorMsg() {
       if(this.state.errorMsg){
           return (<div className="signUpErrorMsg"><Icon>error</Icon><span>{this.state.errorMsg}</span></div>);
       }
       return null;
   }

    render() {
        return (
            <Fragment>
              <Navbar className="loginNavBar" brand = "Basic Chat" right>
                <Row s = {6}><UserSignIn updateUserLoadedInCache = {this.props.updateUserLoadedInCache} 
                      setErrorMsg = {this.setErrorMsg}/></Row>
              </Navbar>
              {this.showErrorMsg()}
              <UserSignUp updateUserLoadedInCache = {this.props.updateUserLoadedInCache} setErrorMsg = {this.setErrorMsg}/>  
            </Fragment>     
        );
    }
}

export default LoginPage;