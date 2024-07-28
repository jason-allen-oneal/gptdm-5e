import NextAuth, { DefaultSession, JWT, DefaultUser, User } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      joined: number;
      admin: number;
      email: string;
      socket: string;
      room: number;
      lastOnline: number;
    };
    room: {
      id: number;
      name: string;
      slug: string;
      creatorId: number;
      date: any;
      private: boolean;
      count: number;
    };
  }

  interface User extends Omit<DefaultUser, "id"> {
    id: number;
    name: string;
    joined: number;
    admin: number;
    email: string;
    socket: string;
    room: number;
    lastOnline: number;
  }
  
  interface Room {
    id: number;
    name: string;
    slug: string;
    creatorId: number;
    date: any;
    private: boolean;
    count: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: number;
      name: string;
      joined: number;
      admin: number;
      email: string;
      socket: string;
      room: number;
      lastOnline: number;
    };
    room: {
      id: number;
      name: string;
      slug: string;
      creatorId: number;
      date: any;
      private: boolean;
      count: number;
    };
  }
}





