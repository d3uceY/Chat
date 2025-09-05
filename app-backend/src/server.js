import express from "express"
import mongoose from "mongoose";
import { Server } from "socket.io";
import { createServer } from "http"
import env from "dotenv"
import { Message } from './models/messageModel.js'

env.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } })

io.on('connection', (socket) => {
    console.log("user is connected");

    // Send all messages on connect
    Message.find().sort({ createdAt: 1 }).then(messages => {
        socket.emit('message', messages);
    });

    // New chat message
    socket.on('message', async (text) => {
        const msg = await Message.create({ text });
        io.emit('message', [msg]);
    });

    // like and unlike
    socket.on('likeMessage', async ({ messageId, clientId }) => {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (msg.likedBy.includes(clientId)) {
            msg.likedBy = msg.likedBy.filter(id => id !== clientId);
        } else {
            msg.likedBy.push(clientId);
        }
        msg.likes = msg.likedBy.length;
        await msg.save();
        io.emit('message', [msg]);
    });

    // comment
    socket.on('commentMessage', async ({ messageId, text }) => {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        msg.comments.push({ text });
        await msg.save();
        io.emit('message', [msg]);
    });

    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB error:', err));

app.get('/', (req, res) => {
    res.send('<h1>this is working properly </h1>')
})



export default httpServer;