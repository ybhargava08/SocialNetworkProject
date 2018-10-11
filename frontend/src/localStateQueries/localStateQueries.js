import gql from 'graphql-tag';

const getCurrentUser = gql`
     query {
         getCurrentUser @client {
             id
             authId
             name
             username
             imageDataURL
         }
     }
`;

const addCurrentUser = gql`
    mutation($id:String!,$authId: String!,$name: String!,$username:String!,$imageDataURL: String) {
        addCurrentUser(id:$id,authId:$authId,name:$name,username: $username,imageDataURL: $imageDataURL) @client
    }
`;

const getLatestTargetUserInfo = gql`
   query {
    getLatestTargetUserInfo @client {
        targetInfoList 
    }
   }
`;

const getUserSearchResult = gql`
      query {
        getUserSearchResult @client {
            userSearchResult {
                id
                name
                username
                isOnline
                imageDataURL
            }
        }
      }
`;

const getShowView = gql`
     query {
        getShowView @client{
            view
        }
     }
`;

const addUpLatestTargetUserInfo = gql`
       mutation($id:ID!,$name:String!,$isOnline:Boolean!,$lastActiveDate:String!,$opType:String!) {
        addUpLatestTargetUserInfo (id:$id,name:$name,isOnline:$isOnline,lastActiveDate:$lastActiveDate,opType:$opType) @client 
       }
`;

const updateCurrentUserImage = gql`
   mutation($imageDataURL: String!) {
            updateCurrentUserImage(imageDataURL: $imageDataURL) @client
   }
`;

const addUserSearchResult = gql`
    mutation($searchResult: [User]){
        addUserSearchResult(searchResult: $searchResult) @client
    }
`;

const updateShowView = gql`
      mutation($view: String!) {
         updateShowView(view: $view) @client
      }
`;

export {getCurrentUser,addCurrentUser,getLatestTargetUserInfo,addUpLatestTargetUserInfo, updateCurrentUserImage, getUserSearchResult,
    addUserSearchResult, getShowView, updateShowView};