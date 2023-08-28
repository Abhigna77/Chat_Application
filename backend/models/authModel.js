const {model,Schema}=require('mongoose')


const registerSchema=new Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        // if select is false,we do not want to return password in our query results
    },
    image:{
        type:String,
        required:true
    }

},{timestamps:true});
// gives two variables,when the document was created and when it was last updated
module.exports=model('user',registerSchema);