import { prisma } from "@/lib/prisma";
import superjson from 'superjson';

export async function getUser(id) {
  const user = await prisma.user.findFirst({
    where: {
      id: id,
    }
  });
  
  return user;
}

export async function updateUser(u) {
  const user = await prisma.user.update({
    where: {
      id: u.id,
    },
    data: {
      email: u.email,
      name: u.name,
      admin: u.admin,
      roomId: u.roomId || u.room,
      socket: u.socket
    },
  });
  
  return user;
}








