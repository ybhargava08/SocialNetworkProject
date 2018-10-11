import elasticsearchclient from './elasticsearchclient';

function createUserIndex(indexName) {
   if(!doesIndexExists(indexName)){
        elasticsearchclient.indices.create({
            index:indexName
        },function(err,resp,status){
            if(err) {
                console.log("error while creating users index "+err);
            }else{
                console.log("users index created "+resp);
            }
        });
   } 
    
}

function addUserToIndex(user) { 
    const newUser = JSON.parse(user);
    console.log("in addUserToIndex "+JSON.stringify(user));
    elasticsearchclient.index({
         index: 'users',
         id:newUser._id,
         type: 'users',
         body: {
             name:newUser.name,
             username: newUser.username,
             authId:newUser.authId,
             lastActiveDate: newUser.lastActiveDate,
             isOnline:newUser.isOnline,
             imageDataURL:newUser.imageDataURL
         }
    },function(err,resp,status){
        if(err) {
            console.log("error while adding user to Index "+err);
        }else{
            console.log("user added to Index "+resp);
        }
    });
}

function searchUserIndex(searchParam,searchValue) {
    const userPrefix = {};
    userPrefix[searchParam] = searchValue;
   return elasticsearchclient.search({
        index: 'users',
        type:'users',
        body: {
            query: {
                prefix:userPrefix
            }
        }
    }).then(function(resp){
            console.log("got search resp "+JSON.stringify(resp));
            return resp.hits;
    },function(err){
        console.log('got error while searching '+err);
    })
}

function doesIndexExists(indexName) {
   return  elasticsearchclient.indices.exists({
         index:indexName
     },function(err,resp,status){
         if(err) console.log(err);
         return resp;
     });
}

export { createUserIndex,addUserToIndex,searchUserIndex };