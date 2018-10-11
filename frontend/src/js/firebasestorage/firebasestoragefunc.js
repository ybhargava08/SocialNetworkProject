import { storage } from '../firebase/firebaseconfig';

const ref = storage.ref();

const addUserImgtoFirebase = (usernameImg) => {
     
     const path = 'images/userImg/'+usernameImg+'_img.jpg';
     const imgRef = ref.child(path);
     console.log('image path is ' + imgRef.fullPath);
     return imgRef;
}

const addPostMediatoFirebase = (username,extn) => {
       const path = 'images/postMedia/'+username+'_'+Date.now()+'.'+extn;
       const imgRef = ref.child(path);
       console.log('image path is ' + imgRef.fullPath);
       return imgRef;  
}

export { addUserImgtoFirebase, addPostMediatoFirebase };