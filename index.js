require("dotenv/config");

const { Server } = require("socket.io");

const io = new Server({ cors: process.env.FRONTEND_HOST });

let onlineUsers = [];

io.on("connection", (socket) => {
    socket.on("addNewUser", (user_id) => {
        !onlineUsers.some((ou) => ou.user_id === user_id) &&
            onlineUsers.push({
                user_id,
                socket_id: socket.id
            });

        io.emit("getOnlineUsers", onlineUsers);
    });

    socket.on("sendMessage", (data) => {
        const user = onlineUsers.find((u) => u.user_id === data.receiver_id);

        if (user) {
            io.to(user.socket_id).emit("getMessage", data); 
            // data isinya message, chat_id, dan receiver_id
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((u) => u.socket_id !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    });
});

const port = process.env.PORT ? process.env.PORT : 5000;
io.listen(port);