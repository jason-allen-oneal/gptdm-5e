// @ts-nocheck

import { PrismaClient } from "@prisma/client";
import https from "https";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Inserting basic database data");
  
  const hashedPassword = await bcrypt.hash('P455w3rd3d!123', 8);

  const admins = await prisma.user.createMany({
    data: [
      {
        email: "chaoskreator@gmail.com",
        name: "chaos",
        password: hashedPassword,
        admin: true,
        roomId: 1
      },
      {
        email: "jason.allen.oneal@gmail.com",
        name: "jason",
        password: hashedPassword,
        admin: false,
        roomId: 2
      },
      {
        email: "system@gptdm.com",
        name: "System",
        password: hashedPassword,
        admin: true,
        roomId: 0
      },
      {
        email: "ai@gptdm.com",
        name: "DMBot",
        password: hashedPassword,
        admin: true,
        roomId: 0
      },
    ],
  });
  
  const chatRooms = await prisma.room.createMany({
    data: [
      {
        name: "Global",
        slug: "global",
        creatorId: 1,
        thread: "",
      },
      {
        name: "Test Chat",
        slug: "test-chat",
        creatorId: 2,
        thread: "",
      },
    ],
  });
  
  try {
  const messages = await prisma.message.createMany({
    data: [
      {
        roomId: 1,
        authorId: 1,
        message: "This is a test.",
        recipientId: null,
      },
      {
        roomId: 1,
        authorId: 2,
        message: "This is only a test.",
        recipientId: null,
      },
      {
        roomId: 2,
        authorId: 1,
        message: "Holy Shit another test.",
        recipientId: null,
      },
      {
        roomId: 1,
        authorId: 2,
        recipientId: 1,
        type: "private",
        message: "Private message?!?!",
        recipientId: 1,
      }
    ]
  });
  
  
  } catch(e) {
    console.log('message insert error', e);
  }
  console.log("Seed completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
