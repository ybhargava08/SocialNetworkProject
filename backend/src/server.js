import express from 'express';
import cors from 'cors';
import { graphqlExpress,graphiqlExpress} from 'apollo-server-express';
import schema from './queries/query';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import mongoose from 'mongoose';
import { startKafkaClient } from './kafkafunctions/kafkafunc';
import elasticlient from './elasticsearch/elasticsearchclient';
import { createUserIndex } from './elasticsearch/elasticsearchfunc';
import { getNewSession } from './generalFunctions/neo4j';

const app = express();

const PORT = 5000;

mongoose.connect('mongodb connection');
mongoose.connection.on('error',function(err) {
          console.log('mongod db down xx '+err);
          process.exit();
});

mongoose.connection.once('open',() => {
   console.log('mongo db up !!');
  // mongoose.set('debug',true);
  startKafkaClient();
  checkElasticSearchUp();   
  checkNeo4jUp();
});

function checkNeo4jUp() {
    const session = getNewSession();
    if(session) {
        session.run('MATCH (n) RETURN 1',{}).then(res => {
            console.log("neo4j up !! ");     
            session.close();    
        }).catch(err => {
            session.close();
            console.log('neo4j down xx'+err);
            process.exit();
        })
    }else{
        console.log('neo4j down xx');
        process.exit();
    }
}

function checkElasticSearchUp() {
    elasticlient.ping({
        requestTimeout:30000
    },function(err){
        if(err){
            console.log('elastic search down xx '+err);
            process.exit();
        }else{
            console.log('elastic search up !!');
            createUserIndex('users');
           //  searchUserIndex('name','yash');
        }  
    });
}


app.use(cors());

app.use('/graphql',bodyParser.json(),graphqlExpress({
    schema
}));

app.use('/graphiql',graphiqlExpress({
    endpointURL:'/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/chatsubscription`
}));

const server = createServer(app);

server.listen(PORT,()=> {
    console.log(`app listening on port ${PORT}`);
    new SubscriptionServer({
           execute,
           subscribe,
           schema
    },
    {
        server,
        path: '/chatsubscription'
    }
  )
});



