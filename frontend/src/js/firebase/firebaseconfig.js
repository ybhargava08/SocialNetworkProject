import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';

const config = {
    apiKey: "AIzaSyBVWv5euOfNTyc0Cf0wTQILA80JZWMKG1U",
    authDomain: "basic-gql-chat-authentication.firebaseapp.com",
    databaseURL: "https://basic-gql-chat-authentication.firebaseio.com",
    projectId: "basic-gql-chat-authentication",
    storageBucket: "basic-gql-chat-authentication.appspot.com",
    messagingSenderId: "950145805548"
  };

  firebase.initializeApp(config);

 const storage = firebase.storage();
 const auth = firebase.auth();  
 export { auth, storage } ;
