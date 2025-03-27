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

app.post('/register', async(req, res)=> {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		const user = new User({
			username: req.body.username,
			password: hashedPassword,
			email: req.body.email,  
			displayName: req.body.displayName,
			role: req.body.role || "user"
		})
        // to avoid duplicate usernames or email
        const result = await user.save(); 
        // const token = jwt.sign(
        //     {id: user._id, email: user.email},process.env.JWT_SECRET,
        //     { expiresIn: '1h' });
        // user.token = token
        // user.password = undefined
		res.status(201).json({ message: "User registered successfully"});

	} catch (err) {
		res.status(500).json({
			error: err.message
		});
	} 
})

app.post('/login', async(req, res) => {
    try {
        const {password, username} = req.body
        if (!(username && password)) {
            res.status(400).send("Username and password required.")
        }
        const user = await User.findOne({username: req.body.username})
        if (user && await bcrypt.compare(req.body.password, user.password)) {
                const token = jwt.sign({id: user._id, email: user.email},process.env.JWT_SECRET,{ expiresIn: '1h' });
                user.token = token
                user.password = undefined
                res.status(200).json({token})
            }
            else {
                res.send('Inncorect Username or Password')
            }
    } catch (error) {
        console.log(error);
}})

app.listen(process.env.PORT, () => {console.log('this is port', process.env.PORT)})