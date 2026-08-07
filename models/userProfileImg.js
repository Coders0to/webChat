const mongoose = require("mongoose");

const userProfileImg = new mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model('userProfileImg',userProfileImg);