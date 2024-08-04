import { Server } from 'socket.io';
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from 'next';
import { nextAuthConfig } from '@/lib/auth';
import { getUser, updateUser } from "@/lib/services/user";
import { addMessage, getRoom, addRoom } from '@/lib/services/room';
import { getPlayer, updatePlayer } from "@/lib/services/player";
import { formatModelInput, formatModelOutput, normalize } from "@/lib/utils";
import AI from "@/lib/AI";

async function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, nextAuthConfig);
  console.log('session', session);
  if (!session) {
    return res.send({status: "error", message: "No session!"});
  }
  
  if (!(res.socket as any).server.io) {
    console.log('*First use, starting socket.io');

    let player: any = {};
    let ai: any = null;
    let user: any = null;
    let room: any = null;

    const io = new Server((res.socket as any).server);

    io.use(async (socket, next) => {
      const { u, r } = socket.handshake.auth.query;

      user = u;
      room = r;

      if (!user) {
        return next(new Error("invalid user"));
      }
      
      user.socket = socket.id;
      socket.user = await updateUser(user);

      player = await getPlayer(user.id, room.id);

      next();
    });

    io.on('connection', async (socket) => {
      console.log(`${socket.id} connected`);

      const ai = new AI(room, user);
      await ai.init();

      socket.join(room.name);

      io.in(room.name).emit('user-joined', socket.user);
      
      const welcome = await ai.welcome(socket.user);
      
      io.in(socket.id).emit('new-message', welcome);
      
      socket.on('new-private-message', async (data) => {
        
      });

      // Listen for new messages
      socket.on('new-message', async (data) => {
        const obj = {
          room: room.id,
          author: data.user.id,
          recipient: null,
          message: data.message,
          type: ai.creationMode ? "creation" : "chat"
        };
        
        const message = await addMessage(obj);
        console.log('message', message);
        ai.addMessageToStack(message);
        
        io.in(socket.id).emit('new-message', message);

        try {
          console.log('ai.messages', ai.messages);
          const aiResult = await ai.interact(ai.messsges);
          console.log('socket aiResult', aiResult);
          if (Array.isArray(aiResult)) {
            const msg = aiResult[0].output;
            const obj = {
              rid: room.id,
              author: 4,
              recipient: null,
              message: msg,
              type: "chat"
            };
            const aiObj = formatModelOutput(obj);
            const aiMessage = await addMessage(aiObj);
            io.in(room.name).emit('new-message', aiMessage);
          } else {
            if (aiResult.imgOnly) {
              const imgUrl = await ai.getImage(aiResult.content);
              io.in(room.name).emit('new-image', imgUrl);
            } else {
              console.log("aiResult.player", aiResult.player)
              if (JSON.stringify(aiResult.player) != "{}" && JSON.stringify(aiResult.player) != undefined) {
                player = await updatePlayer(aiResult.player);
              }
            
              const aiObj = formatModelOutput(aiResult);
            
              const aiMessage = await addMessage(aiObj);
              
              io.in(room.name).emit('new-message', aiMessage);
            }
          }
        } catch (error) {
          console.error("Error during AI interaction:", error);
        }
      });
      
      socket.on('new-room', async (data) => {
        let returnData = {};
        const { name, privacy, prompt } = data;
        const slug = normalize(name);
        
        const exists = await prisma.room.findFirst({
          where: {
            slug: slug,
          },
        });
        
        if (exists) {
          returnData = {
            status: "error",
            message: "A room already exists with this name.",
            result: "error",
          };
        } else {
          const thread = await ai.createThread();
          
          const data = {
            name: name,
            slug: slug,
            creatorId: user.id,
            private: privacy,
            thread: thread.id,
            prompt: prompt,
          };
          
          const result = await prisma.room.create({
            data: data,
          });
      
          user.roomId = result.id;
          const newUser = await updateUser(user);
      
          returnData = {
            status: "ok",
            message: "You have successfully created a new room!",
            result: {
              user: newUser,
              room: result
            }
          };
        }
        
        socket.emit('new-room', returnData);
      });

      socket.on('typing-start', (data) => {
        io.in(room.name).emit('typing-start', data);
      });

      socket.on('typing-stop', (data) => {
        io.in(room.name).emit('typing-stop', data);
      });
      
      socket.on('get-users', async (rid) => {
        const room = await getRoom(rid);
        
        const users: any[] = [];
        const sockets = await res.socket.server.io.in(room.name).fetchSockets();
        
        for (const sock of sockets) {
          users.push({
            id: sock.id,
            user: sock.user
          });
        }
    
        json = {
          status: 'ok',
          data: {
            users: users
          }
        };
        
        io.in(room.name).emit('bulk-users', json);
      });
      
      socket.on("change-room", async (rid) => {
        user.roomId = rid;
        user = await updateUser(user);
        room = await getRoom(rid);
    
        socket.emit('change-room', { status: "ok" });
      });

      socket.on("disconnect", () => {
        io.in(room.name).emit('user-left', socket.user);
        socket.leave(room.name);
      });
    });

    (res.socket as any).server.io = io;
  } else {
    console.log('socket.io already running');
  }
  res.send({ status: "ok" });
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler;





