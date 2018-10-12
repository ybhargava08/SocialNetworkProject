import elasticsearch from 'elasticsearch';

const elasticlient = elasticsearch.Client({
    hosts: ['http://<elastic search conn string>']
});

export default elasticlient;
