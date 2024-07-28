import { prisma } from "@/lib/prisma";
import superjson from 'superjson';
import { normalize } from "@/lib/utils";

export async function addRoom(data) {
  const slug = normalize(data.name);
  
  const obj = {
    name: data.name,
    slug: slug,
    creatorId: data.creator,
    thread: data.thread,
    private: data.privacy
  };
  
  const room = await prisma.room.create({
    data: obj
  });
  
  const { json, meta } = superjson.serialize(msg); 
  
  return json;
}

export async function getRoom(id: number) {
  const room = await prisma.room.findFirst({
    where: {
      id: id,
    }
  });
  
  return room;
}

export async function getRooms() {
  return await prisma.room.findMany({
    where: {
      private: false
    }
  });
}

export async function getMessages(rid: number) {
  const messages = await prisma.message.findMany({
    where: {
      AND: [
        {roomId: rid},
        {type: "chat"}
      ]
    },
    include: {
      author: {
        include: {
          player: {
            where: {
              roomId: rid,
            },
          }
        }
      },
    }
  });
  
  return messages;
}

export async function addMessage(data) {
  console.log('addMessage data', data);
  const obj = {
    roomId: data.room,
    authorId: data.author || data.authorId,
    recipientId: data.recipient,
    message: data.message,
    type: data.type,
  };
  
  const msg = await prisma.message.create({
    data: obj,
    include: {
      author: true
    }
  });
  
  const { json, meta } = superjson.serialize(msg); 
  
  return json;
}






