import mongoose from 'mongoose';

const schema = mongoose.Schema;

const personChatSchema = new schema({
     text: String,
     fromUser: {type:schema.Types.ObjectId,ref:'UserSchema',index:true},
     toUser: {type:schema.Types.ObjectId,ref:'UserSchema',index:true},
     isRead:Boolean,
     chatDate:{type:String,default:String(Date.now())}
});

export default mongoose.model('personChatSchema',personChatSchema,'personchat');