import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import userRouter from './routers/userRouter.js';
import uploadMediaRouter from './routers/uploadMediaRouter.js';
import conversationRouter from './routers/conversationRouter.js'
import statusRouter from './routers/statusRouter.js';
import callRouter from './routers/callRouter.js';


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
app.use('/api/status', statusRouter)
app.use('/api/call', callRouter)

server.listen(port, () => console.log(`server is running at port ${port}`));
