import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import users from "./routes/user.js";
import questions from "./routes/question.js";
import surveys from "./routes/survey.js";
import choices from "./routes/choice.js";
import responses from "./routes/response.js";
import upload from "./routes/upload.js";

// Load environment variables
dotenv.config();

// Debug environment variables
console.log("Environment variables loaded:");
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
console.log("GOOGLE_CLOUD_PROJECT_ID:", process.env.GOOGLE_CLOUD_PROJECT_ID);

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/v1/users", users);
app.use("/api/v1/questions", questions);
app.use("/api/v1/choices", choices);
app.use("/api/v1/surveys", surveys);
app.use("/api/v1/responses", responses);
app.use("/api/v1/upload", upload);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
