const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({

    sender:{

        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },

    receiver:{

        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },

    url:String,

    fileName:String,

    originalName:String,

    mimeType:String,

    size:Number,

    type:String

},{
    timestamps:true
});

module.exports =
mongoose.model(
"Attachment",
attachmentSchema
);