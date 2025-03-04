import express from "express";
import cors from "cors";
import users from "./routes/user.js"

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", users);
app.use("/question", question);
app.use("/survey", survey);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})