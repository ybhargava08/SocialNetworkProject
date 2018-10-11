import elasticsearch from 'elasticsearch';

const elasticlient = elasticsearch.Client({
    hosts: ['http://elastic:qwerty@192.168.99.100:9200']
});

export default elasticlient;