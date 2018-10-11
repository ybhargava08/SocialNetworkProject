import React, { Component } from 'react';
import { Preloader } from 'react-materialize';
import { graphql,compose } from 'react-apollo';
import { getFriends, friendReqActivity } from '../../../clientQueries/queries';
import DisplayFriendUser from './DisplayFriendUser';

class DisplayFriends extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.getFriends.subscribeToMore({
            document: friendReqActivity,
            variables: {userId: this.props.currUser.id, type: 'FRIENDS'},
            updateQuery: (prev,{subscriptionData}) => {
                if(!subscriptionData) return prev;

                const friendActivity = subscriptionData.data.friendReqActivity;
                let newFriend; 
                if(this.props.currUser.id === friendActivity.id) {
                      newFriend = {
                          status:friendActivity.status,
                          ...friendActivity.secondUser,
                          secondUser:null
                      }
                }else if (this.props.currUser.id === friendActivity.secondUser.id){
                      newFriend = {
                            ...friendActivity,
                            status:friendActivity.status,
                            secondUser:null,
                      }
                }

                return {...prev,getFriends: [newFriend,...prev.getFriends]};    
            }
        })
    }

    getCol = (obj) => {
        if(obj) {
            return (<div key = {obj.id} className = 'userFriendCol' s={1}><DisplayFriendUser currUser = {this.props.currUser} 
                friend = {obj}/></div>)
        }
        return null;
    } 

    loadFriends = () => {
        let res =[];
        const { loading ,error , getFriends } = this.props.getFriends;
        if(loading) return (<Preloader />);
        if(error) return (<div>{error.message}</div>);

        for (let i=0;i<getFriends.length;i+=3) {
            res.push((<div key = {i} className = 'userFriendsRow'>
            {this.getCol(getFriends[i])}
            {this.getCol(getFriends[i+1])}
            {this.getCol(getFriends[i+2])}
            </div>))
        }

        return res.map(item => {
            return item;
        });
    }

    render() {
        return (
            <div className = 'userFriends'>
                <span><i className='fa fa-group'></i><strong>Friends</strong></span>
                {this.loadFriends()}
           </div>
        );
    }
}

export default compose(
    graphql(getFriends,{name:'getFriends',
      options:(props) => ({
          variables: {
               id:props.currUser.id,
               status: 'FRIENDS'
          },
          fetchPolicy:"network-only"
      })
    })
)(DisplayFriends);