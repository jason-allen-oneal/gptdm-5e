import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { InferGetServerSidePropsType } from 'next';
import Image from "next/image";
import Modal from "@/components/Modal";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/lib/auth";
import { differenceInSeconds } from "date-fns";
import { io } from "socket.io-client";
import { getMessages, getRoom, getRooms } from '@/lib/services/room';
import { getUser } from "@/lib/services/user";
import { useNotification } from "@/lib/contexts/notification";
import useTyping from "@/lib/useTyping";
import Layout from "@/components/Layout";
import ChatUserCard from "@/components/ChatUserCard";
import ChatMessage from "@/components/ChatMessage";
import RoomForm from "@/components/RoomForm";

export const metadata = {
  title: 'Chat',
  description: 'AI-powered D&D',
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, nextAuthConfig);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  
  const user = await getUser(session.user.id);
  const room = await getRoom(user.roomId);
  const rooms = await getRooms();
  const msgs = await getMessages(room.id);
  
  return {
    props: {
      r: room,
      u: user,
      rs: rooms,
      msgs: msgs
    }
  }
}

export default function ChatPage({ r, u, rs, msgs }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { toast } = useNotification();
  
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  
  const sysBot = useMemo(() => {
    return {
      id: 3,
      email: "system@gptdm.com",
      name: "System",
      admin: true,
      roomId: 0
    };
  }, []);
  
  const dmBot = useMemo(() => {
    return {
      id: 4,
      email: "ai@gptdm.com",
      name: "DMBot",
      admin: true,
      roomId: 0
    };
  }, []);
  
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [rooms, setRooms] = useState<Room[]>(rs);
  const [user, setUser] = useState<any>(u);
  const [room, setRoom] = useState<any>(r);
  const [message, setMessage] = useState<string>("");
  const [serverReady, setServerReady] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>(msgs);
  const [users, setUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  
  const socketRef = useRef<any>();
  
  const addMessageToStack = (message: any) => {
    const incomingMessage = {
      ...message,
      ownedByCurrentUser: message.senderId === socketRef.current.id,
    };
    
    setMessages((messages) => [...messages, incomingMessage]);
  };
  
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
          socketRef.current.emit("get-users", room.id);
          
        });
        
        socketRef.current.on("user-joined", (user: any) => {
          socketRef.current.emit("get-users", room.id);
          
          const timeNow = new Date();
          let time = timeNow.toUTCString(); 

          const msgObj = {
            id: 0,
            roomId: room.id,
            authorId: 3,
            recipientId: null,
            time: time,
            message: user.name + ' has joined.',
            type: 'chat',
            author: sysBot
          };
          
          addMessageToStack(msgObj);
        });
            
        socketRef.current.on("user-left", (user: any) => {
          setUsers((users) => users.filter((u) => u.id !== user.id));
          const timeNow = new Date();
          let time = timeNow.toUTCString(); 

          const msgObj = {
            id: 0,
            roomId: room.id,
            authorId: 3,
            recipientId: null,
            time: time,
            message: user.name + ' has left.',
            type: 'chat',
            author: sysBot
          };
          
          addMessageToStack(msgObj);
        });
        
        socketRef.current.on("new-message", (message: any) => {
          addMessageToStack(message);
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
        
        socketRef.current.on("new-room", (data: any) => {
          if (data.status == "ok") {
            closeModal();
            setRoom(data.result.room);
            toast("success", data.message, async () => {
              router.refresh();
            });
          } else {
            toast("error", data.message);
          }
        });
        
        socketRef.current.on("bulk-messages", (data) => {
          if (data.status == "ok") {
            setMessages(data.data.messages);
          } else {
            toast('error', data.message);
          }
        });
        
        socketRef.current.on("bulk-users", (data) => {
          if(data.status == "ok") {
            setUsers(data.data.users);
          } else {
            // an error
            toast('error', data.message);
          }
        });
        
        socketRef.current.on("change-room", (data) => {
          if (data.status == "ok") {
            router.refresh();
          } else {
            toast("error", data.message);
          }
        });
          
        return () => {
          socketRef.current.disconnect();
        };
      }
    }
    
    connect();
  }, [room, user, sysBot, router]);
  
  
  const sendMessage = (messageBody: string) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit("new-message", {
      message: messageBody,
      senderId: socketRef.current.id,
      user: user,
    });
  };
  
  const handleRoomChange = async (rid: number) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit("change-room", rid);
  };
  
  const startTypingMessage = useCallback(async () => {
    if (!socketRef.current) return;
    
    socketRef.current.emit("typings-start", {
      senderId: socketRef.current.id,
      user,
    });
  }, [socketRef, user]);
    
  const stopTypingMessage = useCallback(async () => {
    if (!socketRef.current) return;
    
    socketRef.current.emit("typing-stop", {
      senderId: socketRef.current.id,
      user,
    });
  }, [socketRef, user]);
  
  
  const scrollTarget = useRef(null);
  const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
  
  const handleSendMessage = () => {
    cancelTyping();
    sendMessage(message);
    setMessage("");
  };
  
  const scrollToBottom = () => {
    if (scrollTarget.current) {
      scrollTarget.current?.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  
  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping, startTypingMessage, stopTypingMessage]);
  
  const btm = messages.length + typingUsers.length;
  useEffect(() => {
    scrollToBottom();
  }, [btm]);
  
  let lastMsgUid: number = 0;
  let lastMsgTime: string = "";
  
  return (
    <Layout data={metadata}>
      <section className="pt-2 bg-neutral-content border border-accent">
        <div className="container">
          <div className="pl-3 text-base-content text-lg"><strong>{room.name}</strong></div>
          <div className="divider"></div>
          
          <div className="grid grid-cols-12 gap-2 divide-x divide-neutral">
            <aside className="p-6 col-span-3">
              <nav className="space-y-4 text-sm join join-vertical">
                <div className="space-y-2 collapse collapse-arrow join-item border-base-300 border">
                  <input type="radio" name="my-accordion-4" />
                  <h2 className="text-sm font-semibold tracking-widest uppercase collapse-title">Rooms</h2>
                  <div className="flex flex-col space-y-1 collapse-content">
                  {rooms && rooms.map((r: any, i: number) => (
                    <a onClick={() => handleRoomChange(r.id)} key={i}>{r.name}</a>
                  ))}
                    <Link href="#" className="mt-8" onClick={openModal}>+ Create Room</Link>
                  </div>
                </div>
              
                <div className="space-y-2 collapse collapse-arrow join-item border-base-300 border">
                  <input type="radio" name="my-accordion-4" defaultChecked />
                  <h2 className="text-sm font-semibold tracking-widest uppercase collapse-title">Users</h2>
                  <div className="flex flex-col space-y-1 collapse-content">
                  {users && users.length > 0 && users.map((u: any, i: number) => {
                  let isMe = (user.id === u.id);
                  return (
                    <ChatUserCard user={user} isMe={isMe} key={i} />
                  );
                  })}
                  </div>
                </div>
              </nav>
            </aside>
          
            <div className="col-span-9">
              <div className="grid grid-rows-8 gap-2 divide-y divide-neutral">
                <div className="row-span-7">
                  <ul className="overflow-y-scroll h-96 px-2">
                  {messages && messages.map((curr: any, i: number) => {
                    const prev = messages[i-1];
                    const next = messages[i+1];
                    
                    let isMe = (user.id === curr.authorId);
                    
                    let appendTime = true;
                    let appendUser = true;
                    
                    if (prev) {
                      if (prev.authorId == curr.authorId) {
                        const diff = differenceInSeconds(new Date(curr.time), new Date(prev.time));
                        if (diff < 60) {
                          appendUser = false;
                        }
                      }
                    }
                  
                    if (next) {
                      if (next.authorId === curr.authorId) {
                        const diff = differenceInSeconds(new Date(next.time), new Date(curr.time));
                        if (diff < 60) {
                          appendTime = false;
                        }
                      }
                    }
                    
                    return (
                      <li key={i}>
                        <ChatMessage isMe={isMe} appendTime={appendTime} appendUser={appendUser} msg={curr} />
                      </li>
                    );
                  })}
                    <li ref={scrollTarget}></li>
                  </ul>
                </div>
                <div className="row-span-1 w-100">
                  <div className="w-100">
                    <input
                      placeholder="Message..."
                      onChange={(e) => setMessage(e.target.value)}
                      type="text"
                      className="input input-bordered join-item"
                      value={message}
                      onKeyPress={startTyping}
                      onKeyUp={stopTyping}
                    />
                    <button className="btn btn-primary join-item rounded-r-full" onClick={handleSendMessage}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <ul>
          {typingUsers.map((usr, i) => (
            <li key={messages.length + i}>
              <div className="">
                <div className="">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={28}
                    height={28}
                    className=""
                  />
                </div>
                <div className="dotsContainer">
                  <span id="dot1"></span>
                  <span id="dot2"></span>
                  <span id="dot3"></span>
                </div>
              </div>
            </li>
          ))}
          </ul>
          
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <RoomForm socket={socketRef} />
        </Modal>
      </section>
    </Layout>
  );
}

ChatPage.auth = true;



