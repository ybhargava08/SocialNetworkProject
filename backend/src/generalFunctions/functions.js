import mongoose from 'mongoose';
import { getNewSession } from './neo4j';
import { v1 as neo4j } from 'neo4j-driver';
import _ from 'lodash';

let userIndexConstraintCreated=false;

function getCommentsFromPromise (model,postId,cursorPointer,limit) {

    const maxCursorPointer = mongoose.Types.ObjectId(Number.MAX_SAFE_INTEGER);
    if(cursorPointer){
        cursorPointer = mongoose.Types.ObjectId(cursorPointer);
    }else{
        cursorPointer = maxCursorPointer;
    }

    const promise = new Promise((resolve,reject) => {
             let commentArray = [];
            // console.log("got more comments query "+cursorPointer+" post id "+postId);
               const findObj = {
                    '_id': {"$lt":cursorPointer},
                    'postId': mongoose.Types.ObjectId(postId)
               } 
              
             const cursor = model.find(findObj).sort({'_id':-1}).limit(limit).populate('users').cursor();
           
             cursor.on('data', res => {
                   commentArray.push(res);
                   if(!cursorPointer || (res.id < cursorPointer)){
                      cursorPointer = mongoose.Types.ObjectId(res.id);
                   }
             });

             cursor.on('end',()=> {
                if(cursorPointer && cursorPointer !== maxCursorPointer) {
                 async function checkForMore() {
                    return await model.where('postId').equals(postId).where('_id').lt(cursorPointer).countDocuments();
                 }
                
                    checkForMore().then(count=> {
                                resolve({
                                    comments: commentArray,
                                    commentInfo:{
                                        commentCursor:String(cursorPointer),
                                        hasMoreComments:(count > 0)?true:false,
                                    }
                                })
                        });
                }else if(cursorPointer === maxCursorPointer){
                    resolve({
                        comments: commentArray,
                        commentInfo:{
                            commentCursor:"",
                            hasMoreComments:false,
                        }
                    })
                }
         });
    });

     async function getCommentsData() {
         return await Promise.all([promise]).then(values => {return values});
     }

     return getCommentsData().then(data => {
        // console.log("found return data "+JSON.stringify(data[0]));
         return data[0];
        });
}

function updateUserIndexConstraintCreated() {
      if(!userIndexConstraintCreated) {userIndexConstraintCreated=true;}
}

function getNumberFromNeo4jNumber(neo4jNumber) {
     if(neo4j.isInt(neo4jNumber)){
         return neo4j.int(neo4jNumber).toNumber();
     }
     return neo4jNumber;
}

function getResultOfTypeParts(query,hasMoreQuery,props) {
     const arr = [];  
     const session = getNewSession();
     let cursor = Number.MAX_SAFE_INTEGER;
    let execQueryPromise = new Promise((resolve,reject) => {
        session.run(query,props).subscribe({
            onNext: (record) => {
                 arr.push(record);
                 let idx=0;
                 if(record.length ===3 ){
                       idx=1;
                 }
                 const currId = getNumberFromNeo4jNumber(record._fields[idx].identity);
                 if(cursor > currId) {
                     cursor = currId;
                 }
            },
            onError: (err) => {
                console.log(err);
            },
            onCompleted: () => {
                let total = 0;
                session.run(hasMoreQuery,{cursor}).then(res => {
                    total = getNumberFromNeo4jNumber(neo4j.int(res.records[0]._fields[0]));
                      resolve({
                          arr,
                          cursor,
                          total
                      })

                }).catch(err => {
                    session.close();
                    console.log(err);
                    reject({
                        arr:[],
                        cursor:-1,
                        total:0
                    })
                })
                session.close();
            }
        })
    })

    const returnResult = async () => {
        return Promise.all([execQueryPromise]).then(values => {
            return values[0];
        })
    }

    return returnResult().then(res => {
       // console.log("final subs result "+JSON.stringify(res));
        return res;
    })
}

function getResultFromNeo4jQuery(query,props) {
    let returnResult;
    const session = getNewSession();
    async function executeQuery(query,props) {
      await session.run(query,props).then(result => {
            session.close();
            returnResult= result;
        }).catch(err => {
            session.close();
            console.log(err);
        })
        return returnResult;
    }

    return executeQuery(query,props).then(result => {
       // console.log("final result is "+JSON.stringify(result));
        return result;
    })
}

function getImageURLFromUserId(users,UserModel) {

    if(users instanceof Array) {
        const _idArr = [];
         const newUserArr = [];
        users.filter(user => {if(user.hasImage) return user}).forEach(user => {
            _idArr.push(mongoose.Types.ObjectId(user._id));
        });
        if(!_idArr || _idArr.length <= 0) return users; 

        async function getImageFromUserArr() {
            return await UserModel.find({'_id':{'$in':_idArr}},(err,obj) => {
                if (err) return users;
                users.forEach(user => {
                    const newUser = {
                        ...user,
                        imageDataURL:_.find(obj,{_id:user._id})
                    }
                    newUserArr.push(newUser);
                });
                return newUserArr;
         });
        }

        return getImageFromUserArr().then(result => {
            if(result && result.length > 0) {
                return result;
            }
            return users;

        });
        
    }else{
        if(!user.hasImage) return users;

        async function getImageURLFromObject() {
           
                return await UserModel.findById(users._id,(err,obj) => {
                    if(err) return users;
                    const newUser = {
                        ...users,
                        imageDataURL:obj.imageDataURL
                    }
                    return newUser;     
            });
        }

        return getImageURLFromObject().then(res => {
            if(res) return res;
            return users;
        })
    }
}

export {getCommentsFromPromise,updateUserIndexConstraintCreated,userIndexConstraintCreated, getResultFromNeo4jQuery, 
        getResultOfTypeParts,getNumberFromNeo4jNumber,getImageURLFromUserId};
