import { getNewSession } from '../generalFunctions/neo4j';
import { userIndexConstraintCreated,updateUserIndexConstraintCreated,getResultFromNeo4jQuery,
            getResultOfTypeParts,getNumberFromNeo4jNumber, getImageURLFromUserId } from '../generalFunctions/functions';
import { addUser, updateUser, getAllUsers,createPost, getPostsInParts,postHasMore,addComment,updateImageStatus,
        getCommentsInParts, hasMoreComments,addPersonChat,offlineMsgTotalCount , offLineMsgDetailCount,
        getPersonChats, addLike, getLikes,createFriendRequest,updateFriendRequest,getFriends,} from '../neo4jqueries/neo4jqueries';
import { PubSub,withFilter } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import UserModel from '../mongomodels/UserModel';

const pubsub = new PubSub();

const USER_ACTIVITY = 'USER_ACTIVITY';
const PERSON_CHAT_ACTIVITY = 'PERSON_CHAT_ACTIVITY';
const POST_ACTIVITY = 'POST_ACTIVITY';
const COMMENT_ACTIVITY = 'COMMENT_ACTIVITY';
const UNREADMSG_ACTIVITY = "UNREADMSG_ACTIVITY";

const resolvers = {
    Query: {
        getAllUsers: (parent,args) => {
            console.log("getall users "+args.userId);
            async function getUsers() {
               return await getResultFromNeo4jQuery(getAllUsers,{userId:args.userId}); 
            }

            return getUsers().then(res => {
                const users = [];
                res.records.forEach(element => {
                    users.push(element._fields[0].properties);
                });
                return getImageURLFromUserId(users,UserModel);
            });
        },
        getPersonChats: (parent,args) => {
           if(args.firstUserId!==args.secondUserId){
                    async function getChats() {
                        return await getResultFromNeo4jQuery(getPersonChats,
                             {firstUserId:args.firstUserId,secondUserId:args.secondUserId});
                    }

                    return getChats().then(res => {
                        const chatResultArr = [];
                        res.records.forEach(item => {
                            let chat = {
                                id: getNumberFromNeo4jNumber(item._fields[0].identity),
                                ...item._fields[0].properties,
                                fromUser:item._fields[1].properties,
                                toUser:item._fields[2].properties
                            }
                            chatResultArr.push(chat);
                        });
                        return chatResultArr;
                    });
           }  
           return [];
        },
        getAllPostsInParts: (parent,args) => {
            let postId = Number.MAX_SAFE_INTEGER;
            if(args.postCursor){
                postId = args.postCursor;
            }
             async function getPosts() {
                 return await getResultOfTypeParts(getPostsInParts,postHasMore,
                     {postId,limit:args.postLimit});
             }

            return getPosts().then(res=> {
                     let posts = [];

                     const {arr,cursor,total} = res;

                     arr.forEach(item => {
                         let post = {
                             id:getNumberFromNeo4jNumber(item._fields[0].identity),
                             ...item._fields[0].properties,
                             users: getImageURLFromUserId(item._fields[1].properties,UserModel)
                         }
                         posts.push(post);
                     });
                     let postResult = {
                        posts,
                        postInfo: {
                            cursorPointer:cursor,
                            hasMorePosts: (total > 0)?true:false
                        }
                     }
                     return postResult;
             });
        },
        getCommentsInParts: (parent,args) => {
            let commentId = Number.MAX_SAFE_INTEGER;
            if(args.commentCursor) {
                commentId = args.commentCursor;
            } 
            async function getComments() {
                return await getResultOfTypeParts(getCommentsInParts,hasMoreComments,{postId:args.postId,commentId,
                 limit:args.commentLimit});
            }

            return getComments().then(res => {
                let comments = [];

                const {arr,cursor,total} = res;

                arr.forEach(item => {
                    let comment = {
                        postId: getNumberFromNeo4jNumber(item._fields[0]),
                        id:getNumberFromNeo4jNumber(item._fields[1].identity),
                        ...item._fields[1].properties,
                        users: getImageURLFromUserId(item._fields[2].properties,UserModel)
                    }
                    comments.push(comment);
                });
                let commentResult = {
                   comments,
                   commentInfo: {
                       commentCursor:cursor,
                       hasMoreComments: (total > 0)?true:false
                   }
                }
                return commentResult; 
            });
        },
        getOfflineMsgs: (parent,args) => {
              let query;
              console.log("getOfflineMsgs "+args.toUser);
            if(args.type === 'TOTALCOUNT') {
                query = offlineMsgTotalCount;
            }else if(args.type === 'DETAILCOUNT') {
                query = offLineMsgDetailCount;
            } 
            async function getMsgs() {
                return await getResultFromNeo4jQuery(query,{userId:args.toUser,isRead:false});
            }      
            return getMsgs().then(res => {
                const resultArr = [];
                if(args.type === 'TOTALCOUNT') {
                     let obj = {
                         count: getNumberFromNeo4jNumber(res.records[0]._fields[0])
                     } 
                     resultArr.push(obj);
                }else if(args.type === 'DETAILCOUNT') {
                    res.records.forEach(item => {
                        let obj = {
                            _id:item._fields[0],
                            name:item._fields[1],
                            isOnline:item._fields[2],
                            lastActiveDate:item._fields[3],
                            count: getNumberFromNeo4jNumber(item._fields[4])
                        }
                        resultArr.push(obj);
                    })
                }
                 return resultArr;
            });
        },
        getLikes: (parent,args) => {
            async function likes() {
                return await getResultFromNeo4jQuery(getLikes(args.type),{typeId:args.typeId});
            }

            return likes().then(res => {
                   const likeResult = [];
                   res.records.forEach(item => {
                         let like = {
                             typeId: getNumberFromNeo4jNumber(item._fields[0]),
                             userId: item._fields[1],
                             name: item._fields[2],
                             type:args.type
                         };
                         likeResult.push(like);
                   });
                   return likeResult;
            });
        },
        getFriends: (parent,args) => {
                async function friends() {
                    return await getResultFromNeo4jQuery(getFriends,{inputUserId:args.inputUserId,status:args.status});
                }

                return friends().then(res => {
                     const userArr= [];
                     res.records.forEach(item => {
                         userArr.push(item._fields[0].properties);
                     })
                     return userArr;
                });
        }
    },
    Mutation: {
        addUser: (parent,args) =>{
            let resultObj;
            const session = getNewSession();
            async function createUser() {
              await session.run(
                        addUser
                      ,{name:args.name,username:args.username,authId:args.authId,isOnline:true,
                        lastActiveDate:String(Date.now()),hasImage:false}
                ).then((result) => {
                    if(!userIndexConstraintCreated) {
                        console.log("calling index and constraint creation");
                        session.run(
                            'CREATE CONSTRAINT ON (user:USER) ASSERT user.id IS UNIQUE'
                        ).then(result => {
                            updateUserIndexConstraintCreated();
                        }).catch(err => {
                            session.close();
                            console.log(err)}
                        );
                    }
                    session.close();
                    resultObj= result.records[0]._fields[0].properties; 
                }).catch((err) => {
                    session.close();
                    console.log(err);
                });
                const newObj = {
                    activityType: 'ISONLINE',
                    userData:resultObj
                };
                pubsub.publish(USER_ACTIVITY,{userActivity:newObj});    

                return resultObj;
            }

            return createUser().then(result => {
                return result;
            })
        },
        updateUser: (parent,args) => {
            async function getResult() {
                return await getResultFromNeo4jQuery(updateUser,
                     {id:args.authId,isOnline:args.isOnline,lastActiveDate:String(Date.now())});
            }

            return getResult().then(result => {
                let resultObj = result.records[0]._fields[0].properties;
                const newObj = {
                    activityType: 'ISONLINE',
                    userData:resultObj
                };
                pubsub.publish(USER_ACTIVITY,{userActivity:newObj});    
                return resultObj;
            });
        },
        updateImage: (parent,args) => {

          async function updateImageStatus() {
              getResultFromNeo4jQuery(updateImageStatus,{hasImage:true});
          }

           const _id = mongoose.Types.ObjectId(args.id); 
           const user = {
               _id,
               imageDataURL:args.imageDataURL
           }

           return UserModel.findOneAndUpdate(_id,user,{upsert:true,new:true,_id:false},(err,obj) => {
                    const newObj = {
                        activityType:'CHANGE_PICTURE',
                        userData:obj
                    };
                    pubsub.publish(USER_ACTIVITY,{userActivity:newObj});
                    updateImageStatus();
                 return userObj;
           });

          /*  async function getResult() {
                return await getResultFromNeo4jQuery(updateImage,{id:args.id,imageDataURL:args.imageDataURL});
            }

            return getResult().then(result => {
                let userObj = {
                     id:result.records[0]._fields[0],
                     imageDataURL:result.records[0]._fields[1] 
                };

                const newObj = {
                    activityType:'CHANGE_PICTURE',
                    userData:userObj
                };
                pubsub.publish(USER_ACTIVITY,{userActivity:newObj});
                return userObj; 
            }); */
        },
        addPost: (parent,args) => {
            async function getPostRes() {
                 return await getResultFromNeo4jQuery(createPost,{text:args.text,postDate:String(Date.now()),id:args.fromUser});
            }
            return getPostRes().then(res => {
                let obj = {
                    id:getNumberFromNeo4jNumber(res.records[0]._fields[0].identity),
                    ...res.records[0]._fields[0].properties,
                    users: res.records[0]._fields[2].properties
                }
                pubsub.publish(POST_ACTIVITY,{postActivity:obj});
                return obj;
            });
        },
        addComment: (parent,args) => {
            async function getCommentRes() {
                return await getResultFromNeo4jQuery(addComment,{text:args.text,postId:args.postId,
                     commentDate:String(Date.now()),fromUser:args.fromUser});
            }

            return getCommentRes().then(res => {
                 let commentResult = {
                     id:getNumberFromNeo4jNumber(res.records[0]._fields[1].identity),
                     ...res.records[0]._fields[1].properties,
                     users:res.records[0]._fields[2].properties,
                     postId: getNumberFromNeo4jNumber(res.records[0]._fields[0])
                 };
                 pubsub.publish(COMMENT_ACTIVITY,{commentActivity:commentResult});
                 return commentResult;
            });
        },
        addPersonChat: (parent,args) => {
            async function addChat(){
                return await getResultFromNeo4jQuery(addPersonChat,{fromUser:args.fromUser,toUser:args.toUser,text:args.text
                ,chatDate:String(Date.now()),isRead:args.isRead});
            } 

            return addChat().then(res => {
                  let chatResult = {
                      id:getNumberFromNeo4jNumber(res.records[0]._fields[0].identity),
                      ...res.records[0]._fields[0].properties,
                      fromUser:res.records[0]._fields[1].properties,
                      toUser:res.records[0]._fields[2].properties
                  };
                  pubsub.publish(PERSON_CHAT_ACTIVITY,{personChatActivity:chatResult});
                  return chatResult;
            });
        },
        addLike: (parent,args) => {
            async function createLike() {
                return await getResultFromNeo4jQuery(addLike(args.type),{userId:args.userId,typeId:args.typeId,
                    likedDate:String(Date.now())});
            }

            return createLike().then(res => {
                  let likeResult = {
                      typeId: getNumberFromNeo4jNumber(res.records[0]._fields[0]),
                      userId:res.records[0]._fields[1],
                      name:res.records[0]._fields[2],
                      type:args.type
                  }
                  return likeResult;
            });
        },
        friendRequest: (parent,args) => {
            let query;
            if(args.type === 'AWAITING_CONFIRMATION'){
                query = createFriendRequest;
            }else{
                query = updateFriendRequest;
            }
            async function frRequest() {
                return await getResultFromNeo4jQuery(query,{fromUser:args.fromUser,toUser:args.toUser,status:args.type});
            } 

            return frRequest().then(res => {
                  let friendReqResult = {
                      fromUser:res.records[0]._fields[0].properties,
                      toUser:res.records[0]._fields[1].properties,
                      status: res.records[0]._fields[2]
                  }

                  return friendReqResult;
            });
        }
    },
    Subscription: {
        userActivity: {
            subscribe: withFilter(() => pubsub.asyncIterator(USER_ACTIVITY),
             (payload,variables) => {
                  
                  if(!payload) return false;
                  const { userActivity } = payload;

                  if(!userActivity) return false;

                  const { activityType,userData } = userActivity;

                  if(!activityType || !userData) return false;

                 // console.log("in user activity "+JSON.stringify(variables.activityType) +" "+activityType);

                  if(variables.activityType && variables.activityType.indexOf(activityType) >=0) {
                       if (activityType === 'ISONLINE' && !variables.id) return true;
                       if (activityType === 'CHANGE_PICTURE' && !variables.id) return false;
                       
                       const { id } = userData;
                       return variables.id === id;
                  } 
                  return false;    
             }
            )
        },
        personChatActivity: {
            subscribe: withFilter( () => pubsub.asyncIterator(PERSON_CHAT_ACTIVITY),
             (payload,variables) => {
                 if(!payload) return false;

                 const { personChatActivity } = payload;

                    if(!personChatActivity) return false;
                 if (!variables.targetUserIDs){
                      return ((personChatActivity.fromUser.id===variables.firstUserId && personChatActivity.toUser.id === variables.secondUserId) || 
                      (personChatActivity.fromUser.id === variables.secondUserId && personChatActivity.toUser.id === variables.firstUserId))
                 }
                 if(variables.targetUserIDs.indexOf(personChatActivity.fromUser.id) === -1 
                           && variables.firstUserId === personChatActivity.toUser.id 
                           && variables.secondUserId === personChatActivity.fromUser.id) {
                 
                     return true;
                 }
                 return false;
             })
        },
        postActivity: {
            subscribe: withFilter(()=> 
               pubsub.asyncIterator(POST_ACTIVITY),
               (payload,variables) => {
                      return true;
               })
        },
        commentActivity: {
            subscribe: withFilter(()=> pubsub.asyncIterator(COMMENT_ACTIVITY),(payload,variables) => {
                if (!payload || !variables.postId) return false;

                 const { commentActivity } = payload;

                 if(!commentActivity) return false;

                return (parseInt(variables.postId) === parseInt(commentActivity.postId));
            })
        },
        unreadMsgCountActivity: {
              subscribe: withFilter(() => pubsub.asyncIterator(UNREADMSG_ACTIVITY),(payload,variables) => {
                     if(!payload || !variables.userId) return false;

                      console.log("unread msg activity payload "+JSON.stringify(payload) +" variables "+JSON.stringify(variables));

                     const { unreadMsgCountActivity } = payload;

                     if( !unreadMsgCountActivity ) return false;

                     return (variables.userId === unreadMsgCountActivity._id);
              })
        }
    }
}

export default resolvers;