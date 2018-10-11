import mongoose from 'mongoose';

const schema = mongoose.Schema;

const postCommentSchema = new schema({
    text: String,
    commentDate: {type: String,default: String(Date.now())},
    users: {type: schema.Types.ObjectId,ref: 'UserSchema'},
    postId: String
}) ;

export default mongoose.model('PostCommentSchema',postCommentSchema,'comments');