const defaults = {
    getCurrentUser: {
     id: '',
     authId: '',
     username: '',
     name:'',
     imageDataURL:'dummy',
     __typename: 'CurrentUser'
 },
    getLatestTargetUserInfo : {
        targetInfoList :[],
        __typename: 'TargetInfoList'
    },
    getUserSearchResult: {
        userSearchResult:[],
        __typename: 'UserSearchResult'
    },
    getShowView:{
        view:'post',
        __typename:'View'
    }
 }

 export default defaults;