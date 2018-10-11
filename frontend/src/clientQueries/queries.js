import gql from 'graphql-tag';

const getAllUsers = gql`
   query($userId:ID!){
        getAllUsers(userId:$userId){
            id
            name
            isOnline
            lastActiveDate
            imageDataURL
            username
        }
   }
`;

const getUserByAuthId = gql`
     query($authId: String!){
        getUserByAuthId(authId: $authId) {
            id
            authId
            name
            username
            isOnline
            lastActiveDate
            imageDataURL
        }
     }
`;

const getPersonChats = gql`
      query($firstUserId: ID!,$secondUserId: ID!){
        getPersonChats(firstUserId: $firstUserId,secondUserId: $secondUserId){
            id
            text
            fromUser{
                id
                name
                username
            }
            toUser{
                id
                name
                username
            }
            chatDate
        }
      }
`;

const getAllPostsInParts = gql`
      query($postCursor:String,$postLimit:Int!){
        getAllPostsInParts(postCursor: $postCursor,postLimit: $postLimit){
            posts{
                id
                text
                type
                postDate
                users{
                    id
                    name
                    isOnline
                    imageDataURL
                    username
                }
                commentsCount
            }
            postInfo{
              cursorPointer
              hasMorePosts
            }
        }
      }
`;

const getCommentsInParts = gql`
      query($postId:ID!,$commentCursor:String,$commentLimit:Int!){
        getCommentsInParts(postId: $postId,commentCursor: $commentCursor,commentLimit: $commentLimit){
            comments{
                id
                postId
                text
                commentDate
                users{
                  id
                  name
                  imageDataURL
                  username
                }
              }
              commentInfo{
                commentCursor
                hasMoreComments
              }
        }
      }`;

const getOfflineMsgs = gql`
   query($toUser: ID!,$type: offlineMsgType!) {
     getOfflineMsgs(toUser: $toUser,type: $type) {
            _id
            name
            isOnline
            lastActiveDate
            count
     }
   }
`;    

const getUserSearchResult = gql`
    query($text: String!) {
        getUserSearchResult(text: $text){
            id
            name
            username
            isOnline
            imageDataURL
        }
    }
`;

const getFriendRelationship = gql`
     query($id: ID!,$targetUserList:[FriendRelationshipInput]){
        getFriendRelationship(id: $id,targetUserList: $targetUserList){
            id
            name
            username
            authId
            isOnline
            lastActiveDate
            imageDataURL
            status
            secondUser{
                id
            }
        }
     }
`;

const getFriends = gql`
    query($id:ID!,$status:FriendRequestType!) {
        getFriends(id:$id,status:$status){
            id
            name
            username
            authId
            isOnline
            lastActiveDate
            imageDataURL
            status
            secondUser{
                id
            }
        }
    }
`;

const getFriendRequestCount = gql`
      query($id:ID!,$status:FriendRequestType!) {
        getFriendRequestCount(id:$id,status:$status) {
            count
        }
      }
`;

const addUser = gql`
    mutation($name: String!, $username: String!, $authId:String!){
        addUser(name: $name, username: $username, authId:$authId) {
            id
            authId
            username
            name
            lastActiveDate
            imageDataURL
        }
    }   
`;

const updateUser = gql`
        mutation($authId:String!,$isOnline:Boolean!){
            updateUser(authId:$authId,isOnline:$isOnline) {
                id
                authId
                username
                name
                lastActiveDate
                imageDataURL
            }
        }
`;

const updateImage = gql`
    mutation($id: ID!,$imageDataURL: String!) {
        updateImage(id: $id,imageDataURL: $imageDataURL){
            id
            imageDataURL
        }
    }
`;

const addPersonChat = gql`
     mutation ($text: String!,$fromUser: ID!,$toUser: ID!,$isRead:Boolean!) {
        addPersonChat(text: $text,fromUser: $fromUser,toUser: $toUser,isRead:$isRead) {
            id
            text
            fromUser{
                id
                name
            }
            toUser{
                id
                name
            }
            chatDate
        }
     }
`; 

const addPost = gql`
      mutation ($text:String,$type: PostType!,$fromUser:ID!){
           addPost(text: $text,type: $type,fromUser: $fromUser){
               id
           }
      }
`;

const userLeft = gql`
    mutation($id: ID!) {
        userLeft(id:$id) {
            id
            name
            isOnline
            lastActiveDate
        }
    }
`;

const addComment = gql`
   mutation($text: String,$postId: ID!,$fromUser: ID!){
        addComment(text: $text,postId: $postId,fromUser: $fromUser){
            id
        }
   }`;

const friendRequest = gql`
       mutation($fromUser:ID!,$toUser:ID!,$type:FriendRequestType!) {
            friendRequest(fromUser:$fromUser,toUser:$toUser,type:$type){
                id
                name
                username
                authId
                isOnline
                lastActiveDate
                imageDataURL
                status
                secondUser{
                    id
                }
            }
       }
`;   
   
const userActivity = gql`
      subscription($id: ID, $activityType: [UserActivityType]!) {
          userActivity (id: $id,activityType: $activityType) {
              activityType
              userData{
                id
                name
                isOnline
                lastActiveDate
                imageDataURL
              }
          }
      }
`;

const chatActivity = gql`
    subscription {
        chatActivity {
            id
            text
            chatDate
            user{
                id
                name
                imageDataURL
            }
        }
    }
`;

const personChatActivity = gql`
     subscription onPersonChatActivity($firstUserId: ID,$secondUserId: ID,$targetUserIDs: [ID]) {
        personChatActivity (firstUserId: $firstUserId,secondUserId: $secondUserId,targetUserIDs:$targetUserIDs) {
            id
            text
            fromUser{
                id
                name
            }
            toUser{
                id
                name
            }
            chatDate
        }
     }
`;

const postActivity = gql`
     subscription {
         postActivity{
                id
                text
                type
                postDate
                users{
                    id
                    name
                    username
                    isOnline
                    imageDataURL
                }
               commentsCount 
            }
     }
`;

const commentActivity = gql`
     subscription onCommentActivity($postId: ID!){
        commentActivity(postId: $postId){
            id
            postId
            text
            commentDate
            users{
              id
              name
              imageDataURL
            }
        }
     }
`;

const unreadMsgCountActivity = gql`
      subscription unreadMsgCountActivity($userId: ID!){
        unreadMsgCountActivity(userId: $userId){
            _id
            count
        }
      }
`;

const friendReqActivity = gql`
       subscription friendReqActivity($userId: ID!,$type: FriendRequestType!){
        friendReqActivity(userId: $userId,type: $type){
                id
                name
                username
                authId
                isOnline
                lastActiveDate
                imageDataURL
                status
                secondUser{
                    id
                    name
                    username
                    authId
                    isOnline
                    lastActiveDate
                    imageDataURL
                }
            }
       }
`;

export {getAllUsers,getUserByAuthId,getPersonChats,getOfflineMsgs,addUser,updateUser,updateImage,userLeft,addPersonChat,
        chatActivity,userActivity,personChatActivity,getUserSearchResult,getFriendRelationship,friendRequest,getFriends,
        getAllPostsInParts,addPost,postActivity,addComment,getCommentsInParts,commentActivity,unreadMsgCountActivity,
        getFriendRequestCount,friendReqActivity};