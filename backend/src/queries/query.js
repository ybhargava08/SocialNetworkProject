import resolvers from '../resolvers/resolvers';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = `

type User {
    id: ID
    name: String
    username: String
    authId: String
    isOnline: Boolean
    lastActiveDate: String
    imageDataURL: String
}

enum UserActivityType{
    ISONLINE
    CHANGE_PICTURE
}

enum offlineMsgType{
    TOTALCOUNT
    DETAILCOUNT
}

enum typesLike{
    POST
    COMMENT
    REPLY
}

enum FriendRequestType {
    AWAITING
    FRIENDS
    ALL
}

enum PostOutputType {
    GET
    ADD
}

enum PostType {
    TEXT
    VIDEO
    IMAGE
}

type UserSubscriptionType{
    activityType: UserActivityType!
    userData: User!
}

type PersonChat {
    id: ID!
    text: String!
    fromUser: User!
    toUser: User!
    chatDate: String!
}

type Post {
    id: ID!
    text: String!
    users: User!
    type: PostType
    postDate: String!
    commentsCount: Int
}

type Comment{ 
    id: ID!
    text: String!
    users: User!
    commentDate:String!
    postId:ID!
}

type CommentInfo{
    commentCursor: String!
    hasMoreComments: Boolean!
}

type CommentOutput{
    comments: [Comment]
    commentInfo: CommentInfo
}

input UserInput {
    id: ID!,
    name: String!
}

type PostInfo{
    cursorPointer: String!
    hasMorePosts: Boolean!
}

type PostOutput{
    posts: [Post]
    postInfo: PostInfo
}

type MsgUserType {
    _id: ID
    name: String
    isOnline: Boolean
    lastActiveDate: String
    count: Int
}

type LikeOutput{
    typeId:ID
    userId:ID
    name:String
    type:typesLike
}

type FriendRelationshipOutput {
    id: ID
    name: String
    username: String
    authId: String
    isOnline: Boolean 
    lastActiveDate: String
    imageDataURL: String
    status:FriendRequestType
    secondUser: User
}

input FriendRelationshipInput {
    id: ID
    name: String
    username: String
    authId: String
    isOnline: Boolean
    lastActiveDate: String
    imageDataURL: String
}

type FriendRequestCount {
    id:ID
    count: Int
}

type Query {
    getAllUsers(userId:ID!): [User]
    getUserByAuthId(authId: String!): User
    getPersonChats(firstUserId: ID!,secondUserId: ID!): [PersonChat] 
    getAllPostsInParts(postCursor:String,postLimit:Int!): PostOutput
    getCommentsInParts(postId:ID!,commentCursor:String,commentLimit:Int!): CommentOutput
    getOfflineMsgs(toUser: ID!,type: offlineMsgType!): [MsgUserType]
    getLikes(typeId:ID!,type:typesLike!): [LikeOutput]
    getFriends(id:ID!,status:FriendRequestType!): [FriendRelationshipOutput]
    getUserSearchResult(text: String!): [User]
    getFriendRelationship(id: ID!,targetUserList: [FriendRelationshipInput]): [FriendRelationshipOutput]
    getFriendRequestCount(id:ID!,status:FriendRequestType!): FriendRequestCount
}

type Mutation {
    addUser(name: String!,username: String!,authId: String!): User
    updateUser(authId: String!,isOnline:Boolean!): User
    addPersonChat(text: String!,fromUser: ID!,toUser: ID!,isRead:Boolean!): PersonChat
    addPost(text: String,type:PostType,fromUser: ID!): Post
    addComment(text: String,postId: ID!,fromUser: ID!): Comment
    updateImage(id: ID!,imageDataURL: String!): User
    addLike(type:typesLike!,userId:ID!,typeId:ID!): LikeOutput
    friendRequest(fromUser:ID!,toUser:ID!,type:FriendRequestType!): FriendRelationshipOutput
}

type Subscription {
    userActivity(id: ID,activityType: [UserActivityType]!): UserSubscriptionType
    personChatActivity(firstUserId: ID,secondUserId: ID,targetUserIDs: [ID]): PersonChat
    postActivity: Post
    commentActivity(postId: ID!): Comment
    unreadMsgCountActivity (userId: ID!): MsgUserType
    friendReqActivity(userId: ID!,type:FriendRequestType!) : FriendRelationshipOutput
}
`;

const schema = makeExecutableSchema({typeDefs,resolvers});

export default schema;
