import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useNotification } from "@/lib/contexts/notification";

export default function useChat(u: any, r: any) {
  const router = useRouter();
  const { toast } = useNotification();
  const [user, setUser] = useState(u);
  const [ready, setReady] = useState<boolean>(false);
  const [serverReady, setServerReady] = useState<boolean>(false);
  const [room, setRoom] = useState<any>({ name: "Default" });
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  
  const socketRef = useRef<any>();
  
  const getUsers = useCallback(async () => {
    const request = await fetch('/api/users', {
      method: "POST",
       body: JSON.stringify({r: room.id}),
    });
    
    const result = await request.json();
    if(result.status == "ok") {
      setUsers(result.data.users);
    } else {
      // an error
    }
  }, [setUsers, room.id]);
  
  useEffect(() => {
    if (!user) {
      return;
    }
    
    async function connect() {
      const request = await fetch('/api/socket');
      const response = await request.json();
      
      if (response.status == "ok") {
        setServerReady(true);
        const socketAuth = {
          query: {
            u: user,
            r: room,
          }
        };
        
        socketRef.current = io("http://172.235.158.51:3000/", {
          autoConnect: false,
          forceNew: true,
        });
        
        socketRef.current.auth = socketAuth;
        socketRef.current.connect();
        
        socketRef.current.on("connect", async () => {
          console.log("connected as", socketRef.current.id);
        });
        
        socketRef.current.on("new-room", (room: any) => {
          console.log('new-room', JSON.stringify(room));
          /*
          setRoom(room);
          toast("success", "You have created a new room and will be taken there now.", async () => {
            router.push("/chat");
          });
          */
        });
        
        socketRef.current.on("user-joined", (user: any) => {
          
          getUsers();
        });
            
        socketRef.current.on("user-left", (user: any) => {
          setUsers((users) => users.filter((u) => u.id !== user.id));
        });
        
        socketRef.current.on("new-message", (message: any) => {
          console.log("new message", JSON.stringify(message));
          const incomingMessage = {
            ...message,
            ownedByCurrentUser: message.senderId === socketRef.current.id,
          };
          setMessages((messages) => [...messages, incomingMessage]);
        });
          
        socketRef.current.on("typing-start", (typingInfo: any) => {
          if (typingInfo.senderId !== socketRef.current.id) {
            const usr = typingInfo.user;
            setTypingUsers((users) => [...users, usr]);
          }
        });
          
        socketRef.current.on("typing-stop", (typingInfo: any) => {
          if (typingInfo.senderId !== socketRef.current.id) {
            const usr = typingInfo.user;
            setTypingUsers((users) => users.filter((u) => u.name !== usr.name));
          }
        });
          
        return () => {
          socketRef.current.disconnect();
        };
      }
    }
    
    connect();
  }, [room, user, getUsers]);
  
  useEffect(() => {
    async function getMessages() {
      const request = await fetch('/api/messages', {
        method: "POST",
        body: JSON.stringify({rid: room.id}),
      });
      
      const response = await request.json();
      
      if (response.status == "ok") {
        const msgs = [];
        
        for(const m of response.data.messages) {
          const msg = {
            id: m.id,
            room: m.roomId,
            authorId: m.authorId,
            recipientId: m.recipientId,
            message: m.message,
            type: m.type,
            time: m.time,
            author: m.author,
          };
        }
        setMessages(response.data.messages);
      } else {
        console.log('error', response.error);
      }
    }
    
    if (serverReady) {
      getUsers();
      getMessages();
    }
  }, [room, serverReady, getUsers]);

  const sendMessage = (messageBody: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("new-message", {
      message: messageBody,
      senderId: socketRef.current.id,
      user: user,
    });
  };
    
  const startTypingMessage = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("typings-start", {
      senderId: socketRef.current.id,
      user,
    });
  };
    
  const stopTypingMessage = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing-stop", {
      senderId: socketRef.current.id,
      user,
    });
  };

  return {
    room,
    setRoom,
    messages,
    user,
    setUser,
    users,
    typingUsers,
    sendMessage,
    startTypingMessage,
    stopTypingMessage
  };
}





