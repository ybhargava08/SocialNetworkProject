import defImg from '../../../assets/defaultAccIcon.jpg';
import imageCompression from 'browser-image-compression';

const postLimit = 4;
const commentLimit = 2;
const USER_DETAILS = 'userdetails';


const storage = window.localStorage;

function removeFromLocalStorage(key) {
          storage.removeItem(key);
}

function addToLocalStorage(itemKey,itemToAdd) {
   storage.setItem(itemKey,itemToAdd);
}

function accessLocalStorage(key) {
   return storage.getItem(key);
}

function getImage(user){
    if(user.imageDataURL && 'dummy' !== user.imageDataURL){
        return user.imageDataURL;
    } 
    return defImg;
}

async function getCompressedImageDataURL(file,maxImgSize,maxWidthOrHeight) {
   
    const filePromise = new Promise((resolve,reject) => {
        imageCompression(file,maxImgSize,maxWidthOrHeight).then(compressedFile => {
            console.log("after compression file is "+compressedFile.size/1024 +" Kb");
           /* const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.read
                    reader.onerror = () => {
                        reader.abort();
                        reject(new DOMException("Error parsing file"));
                    }
                    reader.onload = () => {
                        console.log("result is "+reader.result.length);
                        resolve(reader.result);
                    }*/
              resolve(compressedFile);      
         });
    });
    
          async function dataFromPromise(){
              return await Promise.all([filePromise]).then(values => {return values[0]});
          }
          
          return dataFromPromise().then(value => { return value });
}

export {postLimit,commentLimit,USER_DETAILS,removeFromLocalStorage,addToLocalStorage,accessLocalStorage,getImage,
        getCompressedImageDataURL};