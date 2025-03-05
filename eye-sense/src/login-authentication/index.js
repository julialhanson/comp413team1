import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';


dotenv.config();

const app = express()
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	  })

const userSchema = new mongoose.Schema(
	{
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		email: {type: String, required: true, unique: true},
		displayName: {type: String, required: true},
		organization: [{ type: String }],
		role: { type: String, required: true },
		organization_permissions: {
				type: Map,
				of: String,
				default: {}
		}
	})

const User = mongoose.model('User', userSchema)

app.post('/register', async(req, res)=> {
	try {
		const hashedPassword = await bcrypt.hash(req.body-password, 10)
		const user = new User({
			username: req.body.username,
			password: hashedPassword
		})
		const result = await user.save();
		res.send("User registered")
	}
	catch(err) {
		res.send(err)
	}
})

app.post('/login', async(req, res) => {
	const user = await User.findOne({username: req.body-username})
	if (user){
		const isValidPassword = await bcrypt.compare(req.body-password, user-password)
		if(isValidPassword) {
			res.send ('Logged in')
		}
		else {
			res.send('Inncorect Password')
		}
	}
	else {
		res.send('Incorrect Username')
	}
})

app.listen(3000, () => {console.log('this is port 3000')})

