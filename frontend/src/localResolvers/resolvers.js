import {getCurrentUser,getLatestTargetUserInfo,getUserSearchResult, getShowView} from '../localStateQueries/localStateQueries';
import { USER_DETAILS,addToLocalStorage } from '../js/constants/constants';

const resolvers = {
    Query: {
        getCurrentUser: (_,{},{cache}) => {
            const { getCurrentUser } = cache.readQuery({query :getCurrentUser});
            console.log("USER " +JSON.stringify(getCurrentUser));
            return getCurrentUser;
        },
        getLatestTargetUserInfo: (_,{},{cache}) => {
              const data = cache.readQuery({query:getLatestTargetUserInfo});
              return data.getLatestTargetUserInfo;
        },
        getUserSearchResult: (_,{},{cache}) => {
            const data = cache.readQuery({query:getUserSearchResult});
            return data.getUserSearchResult;
        },
        getShowView: (_,{},{cache}) => {
            const data = ache.readQuery({query: getShowView});
            return data.getShowView;
        }
    },
    Mutation: {
        addCurrentUser: (_,{id,authId,name,username,imageDataURL},{cache}) => {
                if(!imageDataURL) {
                    imageDataURL = 'dummy';
                 } 
                const data = {
                    getCurrentUser: {
                            id,
                            authId,
                            name,
                            username,
                            imageDataURL,
                            __typename: 'CurrentUser'
                    }
                }     
                  addToLocalStorage(USER_DETAILS,JSON.stringify(data.getCurrentUser));
                  cache.writeQuery({query : getCurrentUser,data});    
            return null;
        },
        addUpLatestTargetUserInfo: (_,{id,name,isOnline,lastActiveDate,opType},{cache}) => {
              const data = cache.readQuery({query: getLatestTargetUserInfo});
              if(data && data.getLatestTargetUserInfo  && data.getLatestTargetUserInfo.targetInfoList) {
                  let arr = data.getLatestTargetUserInfo.targetInfoList;
                  let obj = {id,name,isOnline,lastActiveDate,__typename:'TargetUser'};
                  const idx = arr.findIndex((item) => {return item.id===id});
                  if(opType==='add' && idx===-1) {
                      arr = [obj,...arr];
                  }else if(opType==='remove'){
                          arr = arr.filter(item=> item.id!==id);
                  }
                    const newData = {
                        ...data,
                        getLatestTargetUserInfo: {
                            targetInfoList: arr,
                            __typename: 'TargetInfoList'
                        }
                      };
    
                      cache.writeQuery({query:getLatestTargetUserInfo,data:newData});
              }
              return null;
        },
        updateCurrentUserImage: (_,{imageDataURL},{cache}) => {
            const data = cache.readQuery({query :getCurrentUser});
            if(data && data.getCurrentUser && imageDataURL && 'dummy'!==imageDataURL) {
                const newData = {
                    ...data,
                    getCurrentUser:{
                        ...data.getCurrentUser,
                        imageDataURL
                    }
                };
                addToLocalStorage(USER_DETAILS,JSON.stringify(newData.getCurrentUser));
                cache.writeQuery({query: getCurrentUser,data:newData});
            }
            return null;
        },
        addUserSearchResult: (_,{searchResult},{cache}) => {
            const data = {
                getUserSearchResult: {
                    userSearchResult: searchResult,
                    __typename: 'UserSearchResult'
                }
            }
            console.log('added in addUserSearchResult '+JSON.stringify(data));
            cache.writeQuery({query:getUserSearchResult,data});
            return null;
        },
        updateShowView: (_,{view},{cache}) => {
            const data = {
                getShowView:{
                    view,
                    __typename:'View'
                }
            }
            cache.writeQuery({query:getShowView,data});
            return null;
        }
    }
};

export default resolvers;