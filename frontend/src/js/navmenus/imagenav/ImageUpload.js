import React, { Component } from 'react';
import { getImage, getCompressedImageDataURL } from '../../constants/constants';
import { graphql,compose } from 'react-apollo'; 
import { updateImage } from '../../../clientQueries/queries';
import { updateCurrentUserImage } from '../../../localStateQueries/localStateQueries';
import { Button,Icon } from 'react-materialize';
import { NavItem,Dropdown,DropdownMenu, DropdownToggle } from 'mdbreact';
import { addUserImgtoFirebase } from '../../firebasestorage/firebasestoragefunc';

class ImageUpload extends Component {

    constructor(props) {
        super(props);
        this.state = {
            uploadedImgSrc:getImage(this.props.currUser)
        }
        this.fileUploadRef = React.createRef();
        this.imgReactRef = React.createRef();
    }

    changeImage = (e) => {
        console.log('change image clicked');
        const file = e.target.files[0];
        getCompressedImageDataURL(file,0.150,300).then(res => {
                  this.setState({uploadedImgSrc:res});        
        });
    }  

    uploadImageToServer() {
        console.log('save button clicked');
           const imgRef = addUserImgtoFirebase(this.props.currUser.username);
                imgRef.put(this.state.uploadedImgSrc).then((snapshot) => {
                    console.log('image uploaded to firebase '+snapshot.ref.fullPath);
                    snapshot.ref.getDownloadURL().then((url) => {
                          console.log('image available at : '+url);
                          this.props.updateImage({variables:{id:this.props.currUser.id,imageDataURL:url}}).
                          then((response) => {
                            const { data:{updateImage:{imageDataURL}} } = response;
                                    this.props.updateCurrentUserImage({variables:{imageDataURL}});
                          });
                    });
                });
    }

    showImageUploadSection() {
        return (
            <div className="imageupload">
                <img src = {this.state.uploadedImgSrc} />
                <div className="imageuploadicon" onClick = {() => {this.fileUploadRef.current.click()}}>
                   <Icon>add_a_photo</Icon>&nbsp;&nbsp;<span>Upload Photo</span>
                   <input type ="file" style =  {{'display':'none'}} s={6} onChange = {e => this.changeImage(e)} 
                     ref = {this.fileUploadRef} /> 
                   </div>
                <Button style = {{'zIndex':'2'}} s={6} onClick = {() => this.uploadImageToServer()}>Save</Button>
           </div>
     );
    }

    render() {
        return (
          <NavItem>
            <Dropdown>
              <DropdownToggle className='userIconImage' nav>
                      <img src = {getImage(this.props.currUser)} />
                  </DropdownToggle>
                  <DropdownMenu className = 'dropdownimageupload'>
                          {this.showImageUploadSection()}
                  </DropdownMenu>
              </Dropdown>
          </NavItem>
        ); 
    }
}

export default compose(
    graphql(updateImage,{name: 'updateImage'}),
    graphql(updateCurrentUserImage,{name: 'updateCurrentUserImage'})
)(ImageUpload);