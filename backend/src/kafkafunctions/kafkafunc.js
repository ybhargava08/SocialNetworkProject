import kafka from 'kafka-node';
import { addUserToIndex } from '../elasticsearch/elasticsearchfunc';

const Client = kafka.KafkaClient;
const Producer = kafka.HighLevelProducer;
const Consumer = kafka.Consumer;
const KeyedMsg = kafka.KeyedMessage;
const kafkaHost = '192.168.99.100:9092';
let client;

const ELASTIC_SEARCH_TOPIC = 'elasticsearch_topic';

let elasticSearchConsumer;
let producer;

const consumeroptions = {
    autoCommit: true,
    fromOffset: false,
    fromBeginning: false,
}

process.on('SIGINT',function(){
    consumer.close(true,function(){
        console.log('consumer closed SIGINT');
        process.exit();
    })
})
process.on('SIGUSR1',function(){
   consumer.close(true,function(){
       console.log('consumer closed SIGUSR1');
       process.exit();
   })
})
process.on('SIGUSR2',function(){
    consumer.close(true,function(){
    console.log('consumer closed');
    process.exit();
    })
})

function startKafkaClient() {
    client = new Client({
        kafkaHost,
        connectTimeout: 3000,
        requestTimeout: 3000,
        connectRetryOptions: {
            retries: 1
        }
      });

    client.on('ready',function(){  
        console.log("kafka broker up !!");
        checkTopicExists(ELASTIC_SEARCH_TOPIC);
    });

    client.on('error',function(err){
            console.log("kafka broker down xx "+err);
            process.exit();
    })
}

 function checkTopicExists(topicName) {
      
      client.loadMetadataForTopics([topicName],(err,resp) => {
          if(resp instanceof Array) {
              const obj = resp[1];
              if(!obj.error) {
                 // console.log('not creating topic '+ELASTIC_SEARCH_TOPIC);
                getProducerReady(false);
                getConsumerReady(false);
              }else{
               // console.log('creating topic '+ELASTIC_SEARCH_TOPIC);
                getProducerReady(true);
              }
          }
      })
}

function getProducerReady(isCreateTopic) {
    producer = new Producer(client);

    if(isCreateTopic){
        producer.createTopics([ELASTIC_SEARCH_TOPIC],true,(err,data) => {
            console.log('topics created '+ data); 
            getConsumerReady();
        });
    } 
     producer.on('ready',function() {
         console.log("kafka producer is ready creating topics");
     });
 
     producer.on('error',(err) => {
           console.log('error while starting kafka producer '+err);
     });
}

function getConsumerReady() {

   elasticSearchConsumer = new Consumer(client,[{topic:ELASTIC_SEARCH_TOPIC}],consumeroptions);

   elasticSearchConsumer.on('ready',() => {
        console.log("kafka consumer is ready");
    });

    elasticSearchConsumer.on('error',(err) => {
          console.log('error while starting kafka consumer '+err);
    });

    elasticSearchConsumer.on('offsetOutOfRange',function(err) {
            console.log('offsetOutOfRange '+err);
    });

    elasticSearchConsumer.on('message',(message) => {      
        console.log("kafka consumer got message "+JSON.stringify(message));
        if(message.key === 'AddUser' || message.key === 'UpdateUser'){
            addUserToIndex(message.value);
        }
    });
}

function sendMessageToProducer(msgType,msg) {
       if(producer.ready){
            const message = JSON.stringify(msg);
            const km = new KeyedMsg(msgType,message);
                producer.send([{topic:ELASTIC_SEARCH_TOPIC,messages:km,attributes:1}],(err,data) => {
                    if(err) console.log('error while sending '+err);
                })
       }
}

export { startKafkaClient, sendMessageToProducer };



