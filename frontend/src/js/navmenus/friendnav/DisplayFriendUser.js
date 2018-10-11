import React,{ Component, Fragment } from 'react';
import { getImage } from '../../constants/constants';
import { compose,graphql } from 'react-apollo';
import { userActivity } from '../../../clientQueries/queries';

class DisplayFriendUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user:this.props.friend
        } 
    }

    componentWillReceiveProps(props) {
        if(props.userActivity && !props.userActivity.loading) {
            const { activityType,userData } = props.userActivity.userActivity;

            if(activityType && userData) {

                 if('CHANGE_PICTURE' === activityType){
                      this.setState(prevState => ({
                            user:{
                                ...prevState.user,
                                imageDataURL:userData.imageDataURL
                            }
                      }));

                 }
            }
        }
    }

     getColorImagePresent = (imageData,name) => {
        return (<div className='userFriendImageText' style={{color: (imageData)?'white':'peru'}}><strong>{name}</strong></div>)
    }

    render() {
        return (
            <Fragment>
                <img src = {getImage(this.state.user)} />
                {this.getColorImagePresent(this.state.user.imageDataURL,this.state.user.name)}
            </Fragment>
        );
    }
}

export default compose(
    graphql(userActivity,{name: 'userActivity',
     options: (props) =>({
         variables:{
             id: props.friend.id,
             activityType: ['CHANGE_PICTURE']
         }
     })
  })
)(DisplayFriendUser);