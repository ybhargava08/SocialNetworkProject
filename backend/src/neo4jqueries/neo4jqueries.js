import { POST_CREATED_BY,COMMENTED_ON_POST,COMMENTED_BY,CHAT_SENT_BY, LIKED_BY, IS_FRIENDS_WITH,CHAT_RECEIVED_BY } 
         from '../generalFunctions/constants';

const addUser = 'MERGE (n:USER {id:$authId}) ON CREATE SET n = {id:$authId,name:$name,username:$username,authId:$authId,'
                +'isOnline:$isOnline,lastActiveDate:$lastActiveDate,hasImage:$hasImage} '
                +'ON MATCH SET n+={isOnline:$isOnline} RETURN n';

const updateUser = 'MATCH (n:USER {id:$id}) SET n += { isOnline:$isOnline,lastActiveDate:$lastActiveDate } RETURN n';

const updateImageStatus = 'MATCH (n:USER {id:$id}) SET n += { hasImage:$hasImage } RETURN n.id,n.hasImage';                         
const getAllUsers = 'MATCH (n:USER) RETURN n,ID(n) as nodeID';

const getUsers = 'MATCH (n:USER) WHERE ID(n) <> toInteger($userId) RETURN u';

const createPost = 'MATCH (u:USER {id:$id}) CREATE (p:POST {text:$text,postDate:$postDate})-[post_rel:'+POST_CREATED_BY+']-> '+
                     '(u) RETURN (p),type(post_rel),(u)';

const getPersonChats = 'MATCH (fromUser:USER)-[:CHAT_SENT_BY]->(pc:PERSONCHAT)<-[:CHAT_RECEIVED_BY]-(toUser:USER) '+
                       'WHERE (fromUser.id=$firstUserId AND toUser.id=$secondUserId) '+
                       'OR (fromUser.id=$secondUserId AND toUser.id=$firstUserId) SET pc+={isRead:true} '
                       +'RETURN pc,fromUser,toUser';

const getPostsInParts = 'MATCH (p:POST)-[:'+POST_CREATED_BY+']->(u:USER) WHERE ID(p) < toInteger($postId) WITH p,u '
                                +'ORDER BY ID(p) DESC LIMIT $limit RETURN (p),(u)';  

const postHasMore = 'MATCH (p:POST) WHERE ID(p) < $cursor RETURN count(p) as total';   

const addComment = 'MATCH (p:POST),(u:USER {id:$fromUser}) WHERE ID(p) = toInteger($postId) '
                    +'CREATE (c:COMMENT {text:$text,commentDate:$commentDate})'
                    +'-[:'+COMMENTED_ON_POST+']-> (p) CREATE (c)-[:'+COMMENTED_BY+']->(u) RETURN ID(p),c,u';

const getCommentsInParts = 'MATCH (c:COMMENT)-[:'+COMMENTED_ON_POST+']-> (p:POST),(c)-[:'+COMMENTED_BY+']->(u:USER) '
                        +'WHERE ID(c) < toInteger($commentId) AND ID(p) = toInteger($postId) WITH ID(p) as postId, '+
                        ' ID(c) as commentId,c,u ORDER BY commentId DESC LIMIT $limit RETURN postId,c,u'; 
                        
const hasMoreComments = 'MATCH (c:COMMENT) WHERE ID(c) < $cursor RETURN count(c) as total';    

const addPersonChat = 'MATCH (userFrom:USER {id:$fromUser}),(userTo:USER {id:$toUser}) '
                      +'CREATE (userFrom)-[:'+CHAT_SENT_BY+']->(pc:PERSONCHAT {text:$text,chatDate:$chatDate,isRead:$isRead})'
                      +'<-[:'+CHAT_RECEIVED_BY+']-(userTo) RETURN (pc),(userFrom),(userTo)';

const addLike = (TYPE) => {
    return 'MATCH (n:'+TYPE+'),(u:USER {id:$userId}) WHERE ID(n) = toInteger($typeId) CREATE (n) - '+
     '[liked:'+LIKED_BY+' {likedDate:$likedDate}]->(u) RETURN ID(n),u.id,u.name';
};

const getLikes = (TYPE) => {
    return 'MATCH (n:'+TYPE+')-[:'+LIKED_BY+']->(u:USER) WHERE ID(n) = toInteger($typeId) RETURN ID(n),u.id,u.name';  
}

const getFriends = (status) => {
    if (status === 'ALL'){
        return 'MATCH (toUser:USER {id:$id})<-[f:FRIENDS {status:"AWAITING"}]-(fromUser:USER) SET f+={isSeen:true} '+
        'RETURN fromUser.id,f.status ORDER BY f.currDate DESC '
        +'UNION MATCH (toUser:USER {id:$id})-[f:FRIENDS {status:"FRIENDS"}]-(fromUser:USER) '+
        'SET f+={isSeen:true} RETURN fromUser.id,f.status ORDER BY f.currDate DESC'; 
    }else if(status === 'FRIENDS'){
        return 'MATCH (toUser:USER {id:$id})-[f:'+IS_FRIENDS_WITH+' {status:$status}]-(fromUser:USER) SET f+={isSeen:true} '+
        'RETURN fromUser.id,f.status ORDER BY f.currDate DESC';   
    }else{
        return 'MATCH (toUser:USER {id:$id})<-[f:'+IS_FRIENDS_WITH+' {status:$status}]-(fromUser:USER) SET f+={isSeen:true} '+
        'RETURN fromUser.id,f.status ORDER BY f.currDate DESC';   
    }
  }
const countFriendRequests = 'MATCH (inputUser:USER {id:$id})<-[:'+IS_FRIENDS_WITH+' {status:$status,isSeen:$isSeen}]-(u:USER) '
                            +'RETURN COUNT(u)'; 

const offlineMsgTotalCount = 'MATCH (u:USER {id:$userId})-[:CHAT_RECEIVED_BY]->(pc:PERSONCHAT {isRead:$isRead}) RETURN COUNT(pc)';

const offLineMsgDetailCount = 'MATCH (u:USER {id:$userId})-[:CHAT_RECEIVED_BY]->(pc:PERSONCHAT {isRead:$isRead})'+
                              '<-[:CHAT_SENT_BY]-(u1:USER) RETURN u1.id,u1.name,u1.isOnline,u1.lastActiveDate,COUNT(u1.id)';

const createFriendRequest = 'MERGE (fromUser:USER {id:$fromUser}) MERGE (toUser:USER {id:$toUser}) '+
                            'MERGE (fromUser)-[f:'+IS_FRIENDS_WITH+' {status:$status,isSeen:$isSeen,currDate:$currDate}]->(toUser) '+
                            'return toUser.id,f.status,fromUser.id';
                           
const updateFriendRequest = 'MATCH (fromUser: USER {id:$fromUser})<-[fr:'+IS_FRIENDS_WITH+']-(toUser: USER {id:$toUser})'
                            +' SET fr+={status:$status,isSeen:$isSeen,currDate:$currDate} RETURN toUser.id,fr.status,fromUser.id';    
                            
const getFriendRelationship = 'MATCH (n:USER {id: $id})-[f:'+IS_FRIENDS_WITH+']-(u:USER) where u.id in $targetUserIdList '+
                              'return u.id,f.status';

export { addUser, updateUser ,getAllUsers,createPost,getPostsInParts,postHasMore,addComment, getCommentsInParts, hasMoreComments
       ,addPersonChat,addLike,getLikes, getFriends,getUsers,offlineMsgTotalCount, offLineMsgDetailCount,getPersonChats,
       createFriendRequest,updateFriendRequest,updateImageStatus,getFriendRelationship,countFriendRequests };