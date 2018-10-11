import UserModel from '../mongomodels/UserModel';
import PostModel from '../mongomodels/PostModel';
import PersonChatModel from '../mongomodels/PersonChatModel';
import PostCommentModel from '../mongomodels/PostCommentModel';
import { PubSub,withFilter } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import { getCommentsFromPromise } from '../generalFunctions/functions';
import { sendMessageToProducer } from '../kafkafunctions/kafkafunc';
import { searchUserIndex } from '../elasticsearch/elasticsearchfunc';
import { getFriendRelationship, createFriendRequest,updateFriendRequest,getFriends,countFriendRequests } 
        from '../neo4jqueries/neo4jqueries'; 
import { getResultFromNeo4jQuery } from '../generalFunctions/functions';
import _ from 'lodash';

const pubsub = new PubSub();

const USER_ACTIVITY = 'USER_ACTIVITY';
const PERSON_CHAT_ACTIVITY = 'PERSON_CHAT_ACTIVITY';
const POST_ACTIVITY = 'POST_ACTIVITY';
const COMMENT_ACTIVITY = 'COMMENT_ACTIVITY';
const UNREADMSG_ACTIVITY = "UNREADMSG_ACTIVITY";
const FRIEND_REQ_COUNT_ACTIVITY = "FRIEND_REQ_COUNT_ACTIVITY";

const resolvers =  {
   Query: {
     getAllUsers: (parent,args) => {
         return UserModel.find()
         .catch(err => console.log("error while fetching user list "+JSON.stringify(err)));
     },
     getUserByAuthId: (parent,args) => {
             return UserModel.findOne({authId:args.authId});
     },
     getPersonChats: (parent,args) => {

         return PersonChatModel.find({
            $or: [
                { $and: [{'fromUser':args.firstUserId},{'toUser':args.secondUserId}] },
                { $and: [{'fromUser':args.secondUserId},{'toUser':args.firstUserId}] },
             ]
         },
         function(err,doc){
             async function markChatAsRead() {
                PersonChatModel.update(
                    {$and: [
                     {fromUser: args.secondUserId},
                     {toUser: args.firstUserId} 
                    ]},
                    {$set: {isRead:true}},
                    {multi:true},
                    function(err,doc) {
                        if(err) {console.log("error occured "+JSON.stringify(err));}
                       
                       if(doc.nModified > 0) {
                            const updateObj = {
                                _id:args.firstUserId,
                                count:doc.nModified
                            }
                            pubsub.publish(UNREADMSG_ACTIVITY,{unreadMsgCountActivity:updateObj});
                       } 
                    }
                 );
             }
             markChatAsRead();
         }).sort({'_id':1}).populate('fromUser').populate('toUser').exec();
     },
     getAllPostsInParts: (parent,args) => {
            let cursorPointer ;
            const maxCursorPointer = mongoose.Types.ObjectId(Number.MAX_SAFE_INTEGER);
            if(args.postCursor){
                cursorPointer = mongoose.Types.ObjectId(args.postCursor);
            }else{
                cursorPointer = maxCursorPointer;
            }

            const getPostCommentsCount = async (postId) => {
                   return await PostCommentModel.where('postId').equals(postId).countDocuments();
            }

            const postPromise = new Promise((resolve,reject) => {
                 let postArray = [];
                 const postCursor = PostModel.where('_id').lt(cursorPointer).find().sort({"_id":-1}).limit(args.postLimit).
                 populate('users').cursor();

                 postCursor.on('data',res => {
                     getPostCommentsCount(res._id).then(commentsCount => {
                                     
                           const postObj = {
                                  id:res._id,
                                  text:res.text,
                                  type: res.type,
                                  postDate:res.postDate,
                                  users: res.users,
                                  commentsCount
                           }
                           postArray.push(postObj);
                     });
                     if(!cursorPointer || (res.id < cursorPointer)){
                        cursorPointer = mongoose.Types.ObjectId(res.id);
                    }
                 });
  
                 postCursor.on('end',()=> {
                        if(cursorPointer && cursorPointer !== maxCursorPointer) {
                         
                         async function checkForMorePosts() {
                            return await PostModel.where('_id').lt(cursorPointer).countDocuments();
                         }
                        
                            checkForMorePosts().then(count=> {
                                        resolve({
                                             posts: postArray,
                                             postInfo: {
                                                cursorPointer:String(cursorPointer),
                                                hasMorePosts: (count > 0)?true:false 
                                             }  
                                        })
                                });
                        } else if (cursorPointer === maxCursorPointer){
                            resolve({
                                posts: postArray,
                                postInfo:{
                                    cursorPointer:"",
                                    hasMorePosts:false
                                }
                            })
                        }
                 });     
            });
            async function getPostsData() {
                return await Promise.all([postPromise]).then(values => {return values});
            }

            return getPostsData().then(res => {
                   return res[0];
            });
        },
        getCommentsInParts:(parent,args) => {
            return getCommentsFromPromise (PostCommentModel,args.postId,args.commentCursor,args.commentLimit);
        },
        getOfflineMsgs:(parent,args) => {
               
            if(args.type === 'TOTALCOUNT') {
                const totalCountPromise = new Promise((resolve,reject) => {
                    PersonChatModel.aggregate(
                        [
                            {$match:{
                                $and: [
                                    {'toUser':mongoose.Types.ObjectId(args.toUser)},
                                    {'isRead':false}
                                ]
                             }},
                             {
                                 $group: {
                                     _id: null,
                                     count: {$sum:1}   
                                 }
                             }
                        ],function(err,doc) {
                            if(err) {
                                console.log("error is "+JSON.stringify(err));
                                reject([{
                                    count:0
                                }])
                            }
                            if(doc && doc[0]){
                                const { count } = doc[0];
                                resolve([{
                                    count
                                }]);
                            }else{
                                resolve([{
                                    count:0
                                }]);
                            }
                        }
                    )
                });

                async function getTotalMsgCount() {
                    return await Promise.all([totalCountPromise]).then(values => {
                                return values[0];
                    });
                }
                
                return getTotalMsgCount().then(result => {
                    return result;
                })

            }else if(args.type === 'DETAILCOUNT') {  
                return PersonChatModel.aggregate(
                    [
                       //first param is like where condition 
                        {$match:{
                           $and: [
                               {'toUser':mongoose.Types.ObjectId(args.toUser)},
                               {'isRead':false}
                           ]
                        }},
                        //this is like a join where person chat model's fromUser is joined with user's id and result is an array
                        {$lookup:{
                              from: 'users',
                              localField:'fromUser',
                              foreignField: '_id',
                              as : 'userArr'
                        }},
                        //this will flatten the array obtained above
                        {$unwind: '$userArr'},
                        //group by happens on name property of userArr's object
                        {$group:{
                            _id:"$userArr._id",
                            name: {$first:"$userArr.name"},
                            isOnline:{$first:"$userArr.isOnline"},
                            lastActiveDate:{$first:"$userArr.lastActiveDate"},
                            count: {$sum:1}
                        }} 
                    ],
                    function(err,doc) {
                        if(err) {
                            console.log(JSON.stringify(err));
                            return [];
                        }
                        return doc;
                    }
                )
            }
            return null;
        },
        getUserSearchResult: (parent,args) => {
                 const searchValue = args.text;
                 const searchParam = 'name';
                 async function getResults(searchParam,searchValue){
                         return await searchUserIndex(searchParam,searchValue);
                   }
                 
                   return getResults(searchParam,searchValue).then(res => {
                       const userArr = [];

                       if(res){
                            res.hits.forEach(item => {
                                let obj = {
                                    id:item._id,
                                    ...item._source
                                }
                                userArr.push(obj);
                           });
                       }
                       return userArr;
                   });
        },
        getFriendRelationship:(parent,args) => {
        
           const getRelationship = async(id,targetUserIdList) => {
               return await getResultFromNeo4jQuery(getFriendRelationship,{id,targetUserIdList});
           }

           return getRelationship(args.id,_.map(args.targetUserList,'id')).then(res => {
                  const statusArr = [];
                  const resultArr = [];
                  res.records.forEach(record => {
                      let statusObj = {
                          id:record._fields[0],
                          status:record._fields[1]
                      }
                    statusArr.push(statusObj);
                  });
                  args.targetUserList.forEach(item => {
                       let obj = _.find(statusArr,{id:item.id});
                           let resultObj = {
                               ...item,
                               status: (obj)?obj.status:null
                           }
                           resultArr.push(resultObj);     
                  });
               return resultArr;   
           });
        },
        getFriends: (parent,args) => {

            const getFriendRes = async (id,status) => {
                if(status === 'ALL'){
                    return await getResultFromNeo4jQuery(getFriends(status),{id});
                }else{
                    return await getResultFromNeo4jQuery(getFriends(status),{id,status});
                }
            }
             
            const friendDetailPromise = new Promise((resolve,reject) => {
                getFriendRes(args.id,args.status).then(res => {
                    const idStatusArr = [];
                    const userIDArr = [];
                    const finalResArr =[];
                    res.records.forEach(record => {
                        let obj = {
                            id:record._fields[0],
                            status:record._fields[1]
                        }
                        idStatusArr.push(obj);
                    });
                    res.records.forEach(record => {
                        userIDArr.push(mongoose.Types.ObjectId(record._fields[0]));
                    });
                    UserModel.find({'_id': {$in: userIDArr}},function(err,doc){
                               if(err) reject(finalResArr);
                               doc.forEach(item => {
                                 const idStatusObj = _.find(idStatusArr,function(ele){ return String(ele.id) === String(item._id) });  
                                 let finalRes = {
                                    id: item._id,
                                    name: item.name,
                                    username: item.username,
                                    authId: item.authId,
                                    isOnline: item.isOnline,
                                    lastActiveDate: item.lastActiveDate,
                                    imageDataURL: item.imageDataURL,
                                    status:idStatusObj.status
                                  };
                                  finalResArr.push(finalRes);
                               });
                           resolve(finalResArr);    
                    });
                }).catch(err => {
                    console.log(err);
                    reject([]);
                });
            });

            const getFinalResult = async () => {
                return Promise.all([friendDetailPromise]).then(res => {return res[0]});
            }

            return getFinalResult().then(res => {return res});
        },
        getFriendRequestCount: (parent,args) => {
            

            const getCount = async (id,status,isSeen) => {
                return await getResultFromNeo4jQuery(countFriendRequests,{id,status,isSeen});
            }
 
            return getCount(args.id,args.status,false).then(res => {
                        let obj = {
                            count:res.records[0]._fields[0]
                        };
                        return obj;
            }) ;

        }
   },
    Mutation :{
       addUser: (parent,args) => {
              const newDate = Date.now();
  
              let userObj = {
                  name:args.name,
                  username:args.username,
                  authId:args.authId,
                  isOnline:true,
                  lastActiveDate:String(newDate),
                  imageDataURL:""   
              }

              return UserModel.findOneAndUpdate({authId:args.authId},userObj,{upsert:true,new:true},function(err,obj){
                    if(err) return null;
                    sendMessageToProducer('AddUser',obj);
                    obj.imageDataURL="";
                    const newObj = {
                        activityType: 'ISONLINE',
                        userData:obj
                    };
                    pubsub.publish(USER_ACTIVITY,{userActivity:newObj});
                    return obj;
              });
       },
       updateUser: (parent,args) => {
             const newDate = Date.now();
              return UserModel.findOneAndUpdate({authId:args.authId},
               {"$set":{isOnline:args.isOnline,lastActiveDate:String(newDate)}},function(err,obj){
                        if(err) return null;
                        obj.imageDataURL="";
                        const newObj = {
                            activityType: 'ISONLINE',
                            userData:obj
                        };
                        pubsub.publish(USER_ACTIVITY,{userActivity:newObj});
                        return obj;
               });
       },
       updateImage: (parent,args) => {
           return UserModel.findByIdAndUpdate(args.id,{"$set":{imageDataURL:args.imageDataURL}},{new:true}).
              then(userObj => {
                 const newObj = {
                     activityType:'CHANGE_PICTURE',
                     userData:userObj
                 };
                 sendMessageToProducer('UpdateUser',userObj);
                 pubsub.publish(USER_ACTIVITY,{userActivity:newObj});
                 return userObj;
           });
       },
       addPersonChat: (parent,args)=> {
           const newDate = Date.now();
           const personChat = new PersonChatModel({
               text: args.text,
               fromUser: args.fromUser,
               toUser:args.toUser,
               isRead:args.isRead,
               chatDate: String(newDate)
           });
            personChat.save().
            then(chatObj => {
                  let personChatResult;
                  const populateQuery = [{path:'fromUser',select:'id name'},{path:'toUser',select:'id name'}];
                   async function publishPersonChat() {
                       personChatResult = await PersonChatModel.findById(chatObj._id).populate(populateQuery).exec();
                   }
                   publishPersonChat().then(() => {
                      pubsub.publish(PERSON_CHAT_ACTIVITY,{personChatActivity:personChatResult});
                   })
                   
            }).catch(err => console.log(err)); 
       },
       addPost: (parent,args) => {
           const newDate = Date.now();
           const post = new PostModel({
                text: args.text,
                type: args.type,
                postDate: String(newDate),
                users: args.fromUser
           });
            post.save().then(postObj => {

                  const userPromise = new Promise((resolve,reject) => {
                          UserModel.findById({'_id':mongoose.Types.ObjectId(args.fromUser)},function(err,doc){
                              if (err) resolve({user:{}})
                               resolve({
                                   user:doc
                               })
                          });
                  });
                  const commentCountPromise = new Promise((resolve,reject) => {
                    PostCommentModel.countDocuments({'postId':postObj._id}).exec((err,count) => {
                        if(err) resolve({count:0});
                        resolve({count});
                    });
            });
                   async function getPostAfterSave() {
                       //savePostResult = await PostModel.findById(postObj._id).populate('users').exec();
                       return await Promise.all([userPromise,commentCountPromise]).then(values => {
                              const obj = {
                                  id: postObj._id,
                                  text: postObj.text,
                                  type: postObj.type,
                                  postDate: postObj.postDate,
                                  users:values[0].user,
                                  commentsCount:values[1].count
                              }   
                              return obj;    
                       });

                   }
                    getPostAfterSave().then((result) => {
                       console.log('result for post activity '+JSON.stringify(result));
                       pubsub.publish(POST_ACTIVITY,{postActivity:result});
                   });    
           });
       },
       addComment: (parent,args) => {
            const newDate = Date.now();
              const comment = new PostCommentModel({
                  text: args.text,
                  commentDate: String(newDate),
                  postId:args.postId,
                  users: args.fromUser
              });

              comment.save().then(commentObj => {
                     let saveCommentResult ;
                     async function getCommentAfterSave() {
                        saveCommentResult= await PostCommentModel.findById(commentObj._id).populate('users').exec();
                     }
                     getCommentAfterSave().then(() => {
                        pubsub.publish(COMMENT_ACTIVITY,{commentActivity:saveCommentResult});
                     });
              });
       },
       friendRequest: (parent,args) => {
        let query;
        let isSeen = false;
        const currDate = String(Date.now());
        if(args.type === 'AWAITING'){
            query = createFriendRequest;
        }else{
            query = updateFriendRequest;
            isSeen=true;
        }
        async function frRequest() {
           let finalRes ; 
           const res = await getResultFromNeo4jQuery(query,{fromUser:args.fromUser,toUser:args.toUser,status:args.type,isSeen,currDate});
            await UserModel.findById({'_id':mongoose.Types.ObjectId(res.records[0]._fields[0])},function(err,doc){
                if(err) return {}; 
                finalRes = {
                    id: doc._id,
                    name: doc.name,
                    username: doc.username,
                    authId: doc.authId,
                    isOnline: doc.isOnline,
                    lastActiveDate: doc.lastActiveDate,
                    imageDataURL: doc.imageDataURL,
                    status:res.records[0]._fields[1],
                    secondUser:{
                        id:res.records[0]._fields[2]
                    }
                }
            });
            return finalRes;
        } 

        return frRequest().then(res => {
           
            UserModel.findById({'_id':mongoose.Types.ObjectId(res.secondUser.id)},function(err,docu){
                if(err) return {}; 
                const finalRes = {
                    ...res,
                    secondUser:{
                        id: docu._id,
                        name: docu.name,
                        username: docu.username,
                        authId: docu.authId,
                        isOnline: docu.isOnline,
                        lastActiveDate: docu.lastActiveDate,
                        imageDataURL: docu.imageDataURL
                    }
                }
                pubsub.publish(FRIEND_REQ_COUNT_ACTIVITY,{friendReqActivity:finalRes}); 
            });
           return res; 
        });
     }
   },

   Subscription :{
          userActivity: {
              subscribe: withFilter(() => pubsub.asyncIterator(USER_ACTIVITY),
               (payload,variables) => {
                    
                    if(!payload) return false;
                    const { userActivity } = payload;

                    if(!userActivity) return false;

                    const { activityType,userData } = userActivity;

                    if(!activityType || !userData) return false;

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
                      if (!payload) return false;
                      const { postActivity } = payload;
                      if (!postActivity) return false;
                      console.log('postactivity is '+JSON.stringify(payload));
                      return true;
                 })
          },
          commentActivity: {
              subscribe: withFilter(()=> pubsub.asyncIterator(COMMENT_ACTIVITY),(payload,variables) => {
                  if (!payload || !variables.postId) return false;

                   const { commentActivity } = payload;

                   if(!commentActivity) return false;

                  return (variables.postId === commentActivity.postId);
              })
          },
          unreadMsgCountActivity: {
                subscribe: withFilter(() => pubsub.asyncIterator(UNREADMSG_ACTIVITY),(payload,variables) => {
                       if(!payload || !variables.userId) return false;

                       const { unreadMsgCountActivity } = payload;

                       if( !unreadMsgCountActivity ) return false;

                       return (variables.userId === unreadMsgCountActivity._id);
                })
          },
          friendReqActivity: {
            subscribe: withFilter(() => pubsub.asyncIterator(FRIEND_REQ_COUNT_ACTIVITY),(payload,variables) => {
                if(!payload || !variables.userId || !variables.type) return false;
                
                const { friendReqActivity } = payload;
                if( !friendReqActivity ) return false;

                if('ALL' === variables.type) {
                    return (String(variables.userId) === String(friendReqActivity.id));
                }else if('FRIENDS' === variables.type && variables.type === friendReqActivity.status) {
                    return (String(variables.userId) === String(friendReqActivity.id) || 
                            String(variables.userId) === String(friendReqActivity.secondUser.id));
                }

                return false;
             })
          }  
   }

};

export default resolvers;