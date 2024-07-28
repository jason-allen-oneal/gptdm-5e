import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";

async function getChatMessages(req: NextApiRequest, res: NextApiResponse) {
  const { rid } = JSON.parse(req.body);
  let json: any = {};
  
  const messages = await prisma.message.findMany({
    where: {
      AND: [
        { roomId: rid },
        { type: "chat" }
      ],
    },
    include: {
      author: true
    }
  });
  
  json = {
    status: "ok",
    data: {
      messages: messages
    }
  };
  
  res.send(json);
}

export default getChatMessages;




