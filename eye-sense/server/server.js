import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import users from "./routes/user.js"
import questions from "./routes/question.js"
import surveys from "./routes/survey.js"
import choices from "./routes/choice.js"

dotenv.config();
console.log("MONGO URI IS ", process.env.ATLAS_URI);

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/users", users);
app.use("/api/v1/questions", questions);
app.use("/api/v1/choices", choices);
app.use("/api/v1/surveys", surveys);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})