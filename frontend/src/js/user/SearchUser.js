import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import Autosuggest from 'react-autosuggest';
import { getUserSearchResult } from '../../clientQueries/queries';
import { addUserSearchResult,updateShowView } from '../../localStateQueries/localStateQueries';
import { graphql,compose } from 'react-apollo';

class SearchUser extends Component{


    constructor(props) {
        super(props);
        this.state = {
            searchText:'',
            suggestions:[]
        }
    }

     getSuggestions = (text) => {
         let resultArr = [];
        const getResult = async(text) => {
                await this.props.client.query({
                        query: getUserSearchResult,
                        variables: {text},
                        fetchPolicy:"network-only"
                    }).then(result => {
        
                    if(!result.loading) {
                        const { getUserSearchResult } = result.data;
                        resultArr = getUserSearchResult;
                        this.props.addUserSearchResult({variables:{searchResult:resultArr}});
                    }
                });
                return resultArr;
         }

         return getResult(text).then(res => {
             return res;
         });
    }

    onSuggestionsFetchRequested = ({value}) => {
         console.log('value is '+value);
          const getRes = async(value) => {
              return await this.getSuggestions(value);
          }
          getRes(value).then(res => {
            this.setState({suggestions:res});
          });
    }

    onSuggestionsClearRequested = () => {
        this.setState({suggestions:[]});
    }

    getSuggestionValue = (suggestion) => {
             return suggestion.name;
    };

    handleSearchResultClick = () => {
        this.setState({searchText:''});
        this.props.updateShowView({variables:{view:'searchResult'}});
    }

    renderSuggestion = (suggestion) => {
       return( <div className = 'usersearchresult' onClick = {() => this.handleSearchResultClick()}>
                   {suggestion.name}</div>);
    }

    shouldRenderSuggestions = (value) => {
        return value.trim().length > 2;
    }

    onValueChange = (event,{newValue}) => {
          console.log('got new value '+newValue);
          if(this.state.searchText !== newValue) {
            this.setState({searchText:newValue});
          }
    } 

    render() {
        const { searchText ,  suggestions } = this.state;
        const inputProps = {
            placeholder: 'type to search',
            value:searchText,
            onChange: this.onValueChange
        }
        return (
            <Autosuggest suggestions = {suggestions} 
            onSuggestionsFetchRequested = {this.onSuggestionsFetchRequested} 
            onSuggestionsClearRequested = {this.onSuggestionsClearRequested} 
            getSuggestionValue = {this.getSuggestionValue} 
            renderSuggestion = {this.renderSuggestion} 
            shouldRenderSuggestions	= {this.shouldRenderSuggestions}
            inputProps = {inputProps} />
        );
    }
}

export default compose(
    graphql(addUserSearchResult,{name:'addUserSearchResult'}),
    graphql(updateShowView,{name:'updateShowView'})
)(withApollo(SearchUser));