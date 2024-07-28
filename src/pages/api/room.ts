import { getRoom } from '@/lib/services/room';
import type { NextApiRequest, NextApiResponse } from 'next';

async function getChatRoom(req: NextApiRequest, res: NextApiResponse) {
  let json: any = {};
  try {
    const { r } = req.body;
    const room = await getRoom(r);
    
    json = {
      status: 'ok',
      data: {
        room: room
      }
    };
  } catch (e) {
    console.log(e);
    
    json = {
      status: "error",
      message: e
    };
  }
  
  res.send(json);
}

export default getChatRoom;




