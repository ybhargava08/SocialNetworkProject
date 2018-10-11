import React from 'react';
import LoginPage from '../login/LoginPage';
import HomePage from '../mainview/HomePage';
import { Switch, Route } from 'react-router-dom';
import { auth } from '../firebase/firebaseconfig';
import { USER_DETAILS, accessLocalStorage, removeFromLocalStorage } from '../constants/constants';
import { addCurrentUser, getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql, compose } from 'react-apollo';
import { Preloader } from 'react-materialize';
 
class ShowView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redirectToHome:false,
            isLoding:true,
            isUserLoadedInCache:false
        }
    }

    componentDidMount() {
        console.log("chat show view did mount");
        this.authChangeListener = auth.onAuthStateChanged(user => {
                  if(user) {
                      console.log(" got user");
                      const userdetails = JSON.parse(accessLocalStorage(USER_DETAILS));
                          if(userdetails) {
                            
                                const { id,authId,name,username,imageDataURL } = userdetails;
                                console.log("id "+id+" name "+name+" authid "+authId+" username "+username);
                                 this.props.addCurrentUser({variables:{id,authId,name,username,imageDataURL}}).then(() => {
                                        this.setState({isUserLoadedInCache:true},() => {
                                            this.setState({redirectToHome:true},() => {
                                                this.setState({isLoding:false});
                                            });
                                        })
                                 });
                          }
                          /*if (this.state.isUserLoadedInCache){
                            this.setState({redirectToHome:true},() => {
                                this.setState({isLoding:false});
                            });
                          } */                
                  }else{
                    console.log(" no user");
                    removeFromLocalStorage(USER_DETAILS);
                    this.setState({redirectToHome:false},() => {
                        this.setState({isLoding:false});
                        this.setState({isUserLoadedInCache:false});
                      });
                  }
        });
    }

    componentWillUnmount() {
        this.authChangeListener();
    }

    updateUserLoadedInCache = (boolValue)=> {
        this.setState({isUserLoadedInCache:boolValue},() => {
            console.log("setting redirect to home true");
            this.setState({redirectToHome:true},() => {
                this.setState({isLoding:false});
            });
        });
    }

    redirect() {
        if(!this.state.isLoding){
             if(this.state.redirectToHome){
                 return (<HomePage />);
             }else{
                 return (<LoginPage updateUserLoadedInCache = {this.updateUserLoadedInCache}/>);
             }
        }
        return (<Preloader />);
    }

     render() {
        return (
                  <Switch>
                      <Route exact path='/' render = {() => this.redirect()} />
                  </Switch>    
        );
     }  
}

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'}),
    graphql(addCurrentUser,{name: 'addCurrentUser'})
)(ShowView);