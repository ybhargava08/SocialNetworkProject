import React,{ Component,Fragment } from 'react';
import PostPage from '../posts/PostPage';
import UserSearchResult from '../user/UserSearchResult';
import { getShowView } from '../../localStateQueries/localStateQueries';
import { graphql,compose } from 'react-apollo';

class WhatToShow extends Component {

    constructor(props) {
        super(props);
    }

    renderWhatToShow() {
        if(this.props.getShowView.getShowView.view === 'post') {
             return (<PostPage />);
        }else{
             return (<UserSearchResult />) 
        }
    }

    render() {
        return (
            <Fragment>
                {this.renderWhatToShow()}
            </Fragment>
        );
    }
}

export default compose(
    graphql(getShowView,{name:'getShowView'})
)(WhatToShow);