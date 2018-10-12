import { v1 as neo4j } from 'neo4j-driver';


const driver = neo4j.driver('neo4j bolt connection');


function getNewSession () {
    return driver.session();
} 

export { getNewSession };
