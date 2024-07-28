import UserSocket from '@/lib/controllers/UserSocket';
import RoomSocket from '@/lib/controllers/RoomSocket';

export default class SocketManager {
  constructor(io, socket, ai) {
    this.io = io;
    this.socket = socket;
    this.ai = ai;
    this.userSocket = new UserSocket(io, socket);
    this.roomSocket = new RoomSocket(io, socket, ai);
  }

  async init() {
    await this.doWelcome();
    this.setHandlers();
  }

  async doWelcome() {
    const roomName = this.socket.room.name;
    this.socket.join(roomName);

    this.io.in(roomName).emit('user-joined', this.socket.user);

    const welcomeData = await this.ai.welcome({
      event: "user-join",
      room: this.socket.room.id,
      data: {
        user: this.socket.user
      }
    });

    const aiWelcome = await addMessage(welcomeData);
    this.io.in(roomName).emit('new-message', aiWelcome);
  }

  setHandlers() {
    this.socket.on('typing-start', (data) => {
      this.userSocket.typingStart(data);
    });

    this.socket.on('typing-stop', (data) => {
      this.userSocket.typingStop(data);
    });

    this.socket.on('new-room', async (data) => {
      await this.roomSocket.newRoom(data);
    });
    
    this.socket.on('new-message', async (data) => {
      await this.roomSocket.newMessage(data);
    });
  }
}






