import { v1 as neo4j } from 'neo4j-driver';


const driver = neo4j.driver('bolt://192.168.99.100:7687',neo4j.auth.basic('neo4j','qwerty'));


function getNewSession () {
    return driver.session();
} 

export { getNewSession };
