import User from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const createToken = (id) =>{
  return jwt.sign({id}, process.env.SECRET_KEY, { expiresIn: '1h' });
}
export const createUser = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Create a new user instance
      const newUser = new User({
        username,
        password
      });
  
      // Save the user to the database
      const user = await newUser.save();
      const token = createToken(user.id)
      res.cookie('sessionID', token)
      // Send response
      res.status(201).json({ message: 'User created successfully', blog: newUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export const loginUser = async(req,res) =>{
  const {username,password} = req.body
  try{
     
    if(!username || !password){
        return res.status(400).json({errorMessage:"input all fields"})
    }

    const existingUser = await User.findOne({username});
    if(!existingUser)
    return res.status(401).json({errorMessage:"Incorrect Email or Password"})

    const passwordCorrect = await bcrypt.compare(password,existingUser.password)

    if(!passwordCorrect)
    return res.status(401).json({errorMessage:"Incorrect Email or Password"})

    //sign token
    const token = createToken(existingUser.id)

    res.cookie("sessionID", token,{})
    res.status(200).json({"username":existingUser.username,message:"Successfully log in"})


    } catch(err){
        console.log(err)
        res.status(500).send()
    }
}
