import React from 'react';
import ReactDom from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { split,ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { withClientState } from 'apollo-link-state';
import resolvers from '../localResolvers/resolvers';
import defaults from '../localStateDefaults/localStateDefaults';
import ShowView from './mainview/ShowView';
import { BrowserRouter } from 'react-router-dom';
import '../css/app.css';
import '../css/ChatArea.css';
import '../css/SingleUserChat.css';
import '../css/Post.css';
import '../css/PostComment.css';
import '../css/AllImgCss.css';
import '../css/loginpage.css';
import '../css/UnreadMessage.css';
import '../css/usersearch.css';
import '../css/navmenuitems.css';
import '../css/displayFriends.css';

const cache = new InMemoryCache();

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql'
});

const wsLink = new WebSocketLink({
    uri: 'ws://localhost:5000/chatsubscription',
    options:{
        reconnect:true
    }
});

const stateLink = withClientState({
    cache,
    defaults,
    resolvers
})

const splitLink = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
     wsLink,
     ApolloLink.from([stateLink,httpLink]) 
);

const client = new ApolloClient({
    link: splitLink,
    cache
});

ReactDom.render( 
   <BrowserRouter>
     <ApolloProvider client = {client}>                
        <ShowView />     
     </ApolloProvider>
   </BrowserRouter>
,document.getElementById('root'));