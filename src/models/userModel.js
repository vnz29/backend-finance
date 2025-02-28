import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },   
},
{
    timestamps:true
}
)

userSchema.pre('save', async function(next){
    console.log(this.password);
    const salt = await bcrypt.genSalt();
    this.password =  await bcrypt.hash(this.password, salt);
    console.log(this.password);
    next();
});

const User = mongoose.model('User', userSchema);

export default User;