import mongoose from 'mongoose';

const schema = mongoose.Schema;

const userSchema = new schema({
    name: String,
    username: String,
    authId: String,
    isOnline:Boolean,
    lastActiveDate: {type:String,default:String(Date.now)},
    imageDataURL: String
});

export default mongoose.model('UserSchema',userSchema,'users');