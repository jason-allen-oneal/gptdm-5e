import Anthropic from "@anthropic-ai/sdk";
import sysPrompt from "@/files/sysPrompt"
import { getMessages } from "@/lib/services/room";

export default class AnthropicAI {
  llm: any;
  messages: any[];
  SYSID: number;
  GPTDMId: number;
  
  constructor() {
    this.llm = new Anthropic();
    
    this.SYSID = 3;
    this.GPTDMId = 4;
    
    this.messages = [
      {
        "role": "user",
        "content": "Why is the ocean salty?"
      }
    ];
  }
  
  async init(rid: number) {
    const msgs = await getMessages(rid);
    
    for (const msg of msgs) {
      let role = "user";
      if (msg.authorId == this.GPTDMId) {
        role = "assistant";
      }
      
      const obj = {
        rid: rid,
        id: msg.author.id,
        name: msg.author.name,
        socket: msg.author.socket,
        content: msg.message,
      };
      
      this.messages.push({
        "role": role,
        "content": JSON.stringify(obj)
      });
    }
  }
  
  async interact(query) {
    const obj = {
      rid: query.rid,
      id: query.id,
      name: query.name,
      socket: query.socket,
      content: query.content,
    };
    
    this.messages.push({
      "role": "user",
      "content": JSON.stringify(obj)
    });
    
    const msg = await this.llm.messages.create({
      model: "claude-3-5-sonnet-20240620",
      temperature: 0.8,
      system: sysPrompt,
      messages: this.messages
    });
    
    return msg;
  }
}






