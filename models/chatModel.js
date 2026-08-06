const { default: mongoose } = require("mongoose");

const chatSchema = new mongoose.Schema({
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    is_read:{
        type:Number,
        default:0,
        required:true
    },
    message:{
        type:String,
        required:true
    }
    
},
{
    timestamp:true
});

module.exports = mongoose.model('Chat',chatSchema); 