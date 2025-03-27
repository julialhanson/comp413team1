import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken'

dotenv.config();
console.log("MONGO_URL:", process.env.MONGO_URL);

const app = express()
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL)

const userSchema = new mongoose.Schema(
	{
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		email: {type: String, required: true, unique: true},
		displayName: {type: String, required: true},
		organization: [{ type: String }],
		role: { type: String, required: true},
		organization_permissions: {
				type: Map,
				of: String,
				default: {}
		}
	})

const User = mongoose.model('User', userSchema)

// app.post('/register', async(req, res)=> {
// 	try {
// 		const hashedPassword = await bcrypt.hash(req.body.password, 10)
// 		const user = new User({
// 			username: req.body.username,
// 			password: hashedPassword,
// 			email: req.body.email,  
// 			displayName: req.body.displayName,
// 			role: req.body.role || "user"
// 		})
// 		const result = await user.save();
// 		res.status(201).json({ message: "User registered successfully", user: result });
// 	} catch (err) {
// 		res.status(500).json({
// 			error: err.message
// 		});
// 	} 
// })

app.post('/login', async(req, res) => {
    const user = await User.findOne({username: req.body.username})
    if (user){
        const isValidPassword = await bcrypt.compare(req.body.password, user.password)
        if(isValidPassword) {
            const token = jwt.sign(
                {
                    username: user.username,
                    role: user.role
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }, (err, token) => {
                    if(err) { console.log(err) }    
                    res.send(token)
                });
        }
        else {
            res.send('Inncorect Password')
        }
    }
    else {
        res.send('Incorrect Username')
    }
})

app.listen(process.env.PORT, () => {console.log('this is port', process.env.PORT)})