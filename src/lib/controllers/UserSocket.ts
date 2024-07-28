export default class UserSocket {
  constructor(io, socket) {
    this.io = io;
    this.socket = socket;
  }

  typingStart(data) {
    this.io.in(this.socket.room.name).emit('typing-start', data);
  }

  typingStop(data) {
    this.io.in(this.socket.room.name).emit('typing-stop', data);
  }
}