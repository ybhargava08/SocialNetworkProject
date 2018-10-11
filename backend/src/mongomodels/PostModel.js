import mongoose from 'mongoose';

const schema = mongoose.Schema;

const postSchema = new schema({
    text: String,
    postDate: String,
    type: String,
    users: {type: schema.Types.ObjectId,ref: 'UserSchema'}
});

export default mongoose.model('PostSchema',postSchema,'posts');