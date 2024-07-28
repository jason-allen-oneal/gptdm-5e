import { getTimeSince } from "@/lib/utils";
import Image from "next/image";
import Markdown from 'react-markdown';

export default function ChatMessage({ isMe, msg, appendUser, appendTime }: { isMe: boolean, msg: any, appendUser: boolean, appendTime: boolean }) {
  const time = getTimeSince(msg.time);
  let color = "chat-bubble-secondary";
  if (!isMe) {
    color = "chat-bubble-accent";
  }
  
  if (msg.author.id == 3) {
    color = "chat-bubble-info";
  }
  
  if (msg.author.id == 4) {
    color = "chat-bubble-success";
  }
  
  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
      {appendUser && (
      <>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <Image alt="Tailwind CSS chat bubble component" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" width={10} height={10} />
        </div>
      </div>
      <div className="chat-header">
        {msg.author.name}
      </div>
      </>
      )}
      <div className={`chat-bubble ${color}`}>
        <Markdown>{msg.message}</Markdown>
      </div>
      {appendTime && (
      <div className="chat-footer opacity-30">
        <time className="text-xs opacity-50 text-base-content">{time}</time>
      </div>
      )}
    </div>
  );
}




