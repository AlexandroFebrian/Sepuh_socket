require("dotenv/config");

const { Server } = require("socket.io");

const io = new Server({ cors: process.env.FRONTEND_HOST });

let onlineUsers = [];

io.on("connection", (socket) => {
    socket.on("addNewUser", (userId) => {
        !onlineUsers.some((ou) => ou.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id
            });

        io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find((u) => u.userId === message.recipientId);

        if (user) {
            io.to(user.socketId).emit("getMessage", message);
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

const port = 5000;
io.listen(port);