import prisma from '@/lib/prisma';
import { addMessage, addRoom } from '@/lib/services/room';
import { updatePlayer } from '@/lib/services/player';
import { formatModelInput, formatModelOutput } from '@/lib/utils';

export default class RoomSocket {
  constructor(io, socket, ai) {
    this.io = io;
    this.socket = socket;
    this.ai = ai;
  }

  async newRoom(data) {
    const exists = await prisma.room.findFirst({
      where: {
        slug: data.slug,
      },
    });

    if (!exists) {
      data.creator = this.socket.user.id;
      data.thread = await this.ai.createThread();
      const room = await addRoom(data);
      this.io.in(this.socket.room.name).emit('new-room', room);
    }
  }
  
  async newMessage(data) {
    const obj = {
      room: this.socket.room.id,
      author: data.user.id,
      recipient: null,
      message: data.message,
      type: "chat"
    };
    
    const message = await addMessage(obj);

    this.io.in(this.socket.room.name).emit('new-message', message);
    
    const aiInput = formatModelInput(message, this.socket.player);
    
    try {
      const aiResult = await this.ai.interact(aiInput);
      console.log('room', room);
      
      if (Array.isArray(aiResult)) {
        const msg = aiResult[0].output;
        const obj = {
          rid: this.socket.room.id,
          author: 4,
          recipient: null,
          message: msg,
          type: "chat"
        };
        
        const aiObj = formatModelOutput(obj);
        const aiMessage = await addMessage(aiObj);
        
        this.io.in(this.socket.room.name).emit('new-message', aiMessage);
      } else {
        if (aiResult.imgOnly) {
          const imgUrl = await this.ai.getImage(aiResult.content);
          
          this.io.in(this.socket.room.name).emit('new-image', imgUrl);
        } else {
          if (JSON.stringify(aiResult.player) != "{}" && JSON.stringify(aiResult.player) != undefined) {
            player = await updatePlayer(aiResult.player);
          }
          
          const aiObj = formatModelOutput(aiResult);
          
          const aiMessage = await addMessage(aiObj);
          
          this.io.in(this.socket.room.name).emit('new-message', aiMessage);
        }
      }
    } catch (error) {
      console.error("Error during AI interaction:", error);
    }
  }
}





