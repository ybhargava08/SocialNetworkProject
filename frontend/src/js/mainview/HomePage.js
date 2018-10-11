import React, { Fragment } from 'react';
import { getCurrentUser } from '../../localStateQueries/localStateQueries';
import { graphql,compose } from 'react-apollo';
import UserList from '../user/UserList';
import { Row,Col } from 'react-materialize';
import SingleUserChatBoxes from '../singleuserchat/SingleUserChatBoxes';
import WhatToShow from '../mainview/WhatToShow';
import SearchUser from '../user/SearchUser';
import NavMenu from '../navmenus/NavMenu';
import DisplayFriends from '../navmenus/friendnav/DisplayFriends';

const rowStyle = {
    margin: '0 0 0 0.5%'
}

const HomePage = (props) => {
      
        return (
                <Fragment> 
                    <NavMenu currUser ={props.getCurrentUser.getCurrentUser}/>     
                    <Row style={rowStyle}>
                        <Col style={{marginTop:'8.5%'}} s={3}><DisplayFriends currUser = {props.getCurrentUser.getCurrentUser}/></Col>
                        <Col style={{margin:'4.5% 0 0 -15%'}} s={9}>
                            <SearchUser />
                            <WhatToShow />
                        </Col>
                        <Col s={3}>
                            <UserList currUser = {props.getCurrentUser.getCurrentUser}/>
                        </Col> 
                        </Row> 
                        <Row>
                            <SingleUserChatBoxes />
                        </Row> 
                </Fragment> 
          );    
}

export default compose(
    graphql(getCurrentUser,{name: 'getCurrentUser'})
)(HomePage);