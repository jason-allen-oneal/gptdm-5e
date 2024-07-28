import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { getPlayer, updateUser } from '@/lib/services/user';

export const socketAuth = async (socket, next) => {
  const { u, r } = socket.handshake.auth.query;

  if (!u) {
    return next(new Error("invalid user"));
  }

  try {
    const user = await getPlayer(u.id, r.id);
    socket.user = await updateUser(user);
    socket.room = r;
    socket.player = user;
    next();
  } catch (error) {
    next(error);
  }
};