const {model,Schema}=require('mongoose')

const messageSchema=new Schema({
    senderId:{
        type:String,
        required:true
    },
    senderName:{
        type:String,
        required:true
    },
    receiverId:{
        type:String,
        required:true,
        // if select is false,we do not want to return password in our query results
    },
    message:{
        text:{
            type:String,
            default:''
        },
        image:{
           type:String,
           default:''
        }
    },
     status:{
        type:String,
        default:'unseen'
     }
},{timestamps:true});
// gives two variables,when the document was created and when it was last updated
module.exports=model('message',messageSchema);