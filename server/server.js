import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import userRouter from './routers/userRouter.js';
import uploadMediaRouter from './routers/uploadMediaRouter.js';
import getUserDetailsFromToken from "./helpers/getUserDetailsFromToken.js";
import conversationRouter from './routers/conversationRouter.js'

import { app, server } from "./socket/socket.js";


mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("mongoDB connected ..."));

const port = process.env.PORT || 5000;

// const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', userRouter)
app.use('/api/upload', uploadMediaRouter)
app.use('/api/message', conversationRouter)

// getUserDetailsFromToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDJkM2M2ZjJkN2QyYTJhMGFmYzhlZSIsInJvbGUiOiJ1c2VyIiwiZW1haWwiOiJ1c2VyMUBnbWFpbC5jb20iLCJ1c2VyTmFtZSI6InVzZXIxIiwiaWF0IjoxNzMwODg0ODQ1LCJleHAiOjE3MzA4ODg0NDV9.D9phOrq4BCXB6VPAmg8yQxD99cZAlSORGn-MYpbjayE')

server.listen(port, () => console.log(`server is running at port ${port}`));
