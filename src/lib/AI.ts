import OpenAI from "openai";
import sysPrompt from "@/files/sysPrompt";
import prompts from "@/files/prompts";
import { strFormat, formatModelOutput } from "@/lib/utils";
import { getMessages, addMessage } from "@/lib/services/room";

export default class AI {
  model: string;
  llm: any;
  SYSID: number;
  GPTDMId: number;
  messages: any[];
  room: any;
  user: any;
  tools: any[];
  creationMode: boolean;
  
  constructor(room, user) {
    this.llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.model = "gpt-4o-mini";
    this.room = room;
    this.user = user;
    
    this.SYSID = 3;
    this.GPTDMId = 4;
    
    this.creationMode = false;
    
    this.tools = [
      {
        "type": "function",
        "function": {
          "name": "diceRoll",
          "description": "Roll some dice",
          "parameters": {
            "type": "object",
            "properties": {
              "num": {
                "type": "number",
                "description": "How many dice to roll",
              },
              "sides": {
                "type": "number",
                "description": "How many sides on each die"
              },
            },
            "required": ["num", "sides"],
          },
        }
      }
    ];
    
    this.messages = [
      {
        role: "system",
        content: sysPrompt,
      },
    ];
  }
  
  async init() {
    await this.getRoomHistory();
  }
  
  async getRoomHistory() {
    const messages = await getMessages(this.room.id);
    
    for (const msg of messages) {
      const obj = {
        id: msg.author.id,
        name: msg.author.name,
        socket: msg.author.socket,
        player: msg.author.player.length > 0 ? msg.author.player[0] : {},
        rid: this.room.id,
        content: msg.message
      };
      
      const json = JSON.stringify(obj);

      if (obj.id === this.GPTDMId) {
        this.messages.push({
          role: "assistant",
          content: json
        });
      } else if (obj.id !== this.GPTDMId && obj.id !== this.SYSID) {
        this.messages.push({
          role: "user",
          content: json
        });
      }
    }
  }
  
  async welcome(user) {
    const result = await this.sendEvent({
      type: "user-join",
      data: {
        user: user,
      }
    });
    if (result.type == "creation") {
      this.creationMode = true;
    }
    return result;
  }
  
  async sendEvent(data) {
    console.log("event data", data);
    let p = "";
    
    if (data.type == "user-join") {
      if (this.room.id == 1) {
        p = strFormat(prompts["user-join"], this.user.name, this.room.id, this.user.id);
      } else {
        p = strFormat(prompts["user-join-room"], this.user.name, this.room.id, this.user.id);
      }
    }
    
    console.log('prompt', p);
    const prompt = [
      {
        role: "system",
        content: sysPrompt + "\n\n" + p
     }
    ];
    
    return await this.interact(prompt);
  }
  
  async sendMessage(msg) {
    console.log("msg data", data);
    
    const obj = {
      room: this.room.id,
      author: this.user.id,
      recipient: null,
      message: msg,
      type: this.creationMode ? "creation" : "chat"
    };
    
    const message = await addMessage(obj);
    this.addMessageToStack(message);
    
    prompt = this.messsges;
    console.log('prompt', prompt);
    return await this.interact(prompt);
  }
  
  async interact(prompt) {
    console.log('interact prompt', prompt);
    const response = await this.llm.chat.completions.create({
      model: this.model,
      messages: prompt,
      tools: this.tools,
      tool_choice: "auto",
    });
    
    const result = response.choices[0];
    
    if (result.finish_reason == "stop") {
      const content = JSON.parse(result.message.content);
      const aiResult = formatModelOutput(content);
      console.log('aiResult', aiResult);
      const message = await addMessage(aiResult);
      console.log("inserted ai", message);
      this.addMessageToStack(message);
      return message;
    } else if (result.finish_reason == "tool_calls") {
      // handle tool call
      console.log('response', response);
    } else {
      console.log('response', response);
    }
  }
  
  async addMessageToStack(msg) {
    const hasPlayer = msg.author.hasOwnProperty("player");
    const obj = {
      id: msg.author.id,
      name: msg.author.name,
      socket: msg.author.socket,
      player: (hasPlayer && msg.author.player.length > 0) ? msg.author.player[0] : {},
      rid: this.room.id,
      content: msg.message,
      type: msg.type,
    };
    
    const json = JSON.stringify(obj);
    
    if (obj.id === this.GPTDMId) {
      this.messages.push({
        role: "assistant",
        content: json
      });
    } else if (obj.id !== this.GPTDMId && obj.id !== this.SYSID) {
      this.messages.push({
        role: "user",
        content: json
      });
    }
  }
}




