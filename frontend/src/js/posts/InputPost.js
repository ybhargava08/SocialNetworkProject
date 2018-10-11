import React, { Component, Fragment } from 'react';
import { Input,ProgressBar, Col } from 'react-materialize';
import { addPost } from '../../clientQueries/queries';
import { graphql,compose } from 'react-apollo';
import { getImage } from '../constants/constants';
import { addPostMediatoFirebase } from '../firebasestorage/firebasestoragefunc';
import { getCompressedImageDataURL } from '../constants/constants';

class InputPost extends Component {

      constructor(props) {
          super(props);
          this.state = {
              postText:'',
              showProgressBar:false,
              progressPercent:0
          }
          this.fileUploadRef = React.createRef();
      }

     addPost(e) {
         e.preventDefault();
         this.props.addPost({variables:{text:this.state.postText,type:'TEXT',fromUser:this.props.currentuser.id}});
         this.setState({postText:''});
     }  

     showHideProgressBar = () => {
         if (this.state.showProgressBar) {
             return (<Col s = {12}><ProgressBar progress = {this.state.progressPercent}/></Col>);
         }
         return null;
     }

     uploadPostImg(e) {
        this.setState({showProgressBar:true}); 
        const file = e.target.files[0];
        const fileName = file.name;
        const extension = fileName.substring(fileName.lastIndexOf('.')+1,fileName.length);
        if ('jpg' === extension || 'jpeg' === extension || 'png' === extension) {
            getCompressedImageDataURL(file,0.5,500).then(res => {
                const postImgRef = addPostMediatoFirebase(this.props.currentuser.username,extension);
                const uploadTask = postImgRef.put(res);
                uploadTask.on('state_changed',(snapshot) => {
                    const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                    this.setState({progressPercent:progress});
                },
                (err) => {
                    console.log('error while uploading '+err);
                    this.setState({showProgressBar:false});
                },() => {
                     uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                        console.log('post image available at : '+url);
                        this.props.addPost({variables:{text:url,type:'IMAGE',fromUser:this.props.currentuser.id}}).then(() => {
                            this.setState({showProgressBar:false});
                        });
                      });
                });            
          });
        }else{
            const postMediaRef = addPostMediatoFirebase(this.props.currentuser.username,extension);
            const uploadTask = postMediaRef.put(file);
            uploadTask.on('state_changed',(snapshot) => {
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                this.setState({progressPercent:progress});
            },
            (err) => {
                console.log('error while uploading '+err);
                this.setState({showProgressBar:false});
            },() => {
                 uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                    console.log('post image available at : '+url);
                    this.props.addPost({variables:{text:url,type:'VIDEO',fromUser:this.props.currentuser.id}}).then(() => {
                        this.setState({showProgressBar:false});
                    });
                  });
            });
        }
     }

      render() {
          return (
            <Fragment>
                <form onSubmit = {(e) => this.addPost(e)}>
                  <fieldset disabled = {this.state.showProgressBar}>  
                    <span style={{float:'left'}} className='InputPostUserImg'><img src = {getImage(this.props.currentuser)}/></span>
                    <Input placeholder='Create a Post' value = {this.state.postText} 
                            onChange = {(e) => this.setState({postText:e.target.value})}>     
                    </Input>   
                   </fieldset>       
                </form>   
                <div className = 'postUploadMedia' onClick = {() => {this.fileUploadRef.current.click()}}> Add Images / Videos </div>
                <input type = "file" style ={{'display':'none'}} disabled = {this.state.showProgressBar} ref = {this.fileUploadRef} 
                        onChange = {(e) => this.uploadPostImg(e)}/>
                {this.showHideProgressBar()}        
            </Fragment>
          );
      }
}

export default compose(
    graphql(addPost,{name: 'addPost'})
)(InputPost);