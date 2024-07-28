import sysPrompt from "@/files/sysPrompt";
import prisma from "@/lib/prisma";
import { getMessages } from "@/lib/services/room";
import { formatModelInput, formatModelOutput, diceRoll } from "@/lib/utils";
import OpenAI from "openai";

export default class AI {
  model: string;
  llm: any;
  assistant: any;
  sourceDir: string;
  SYSID: number;
  GPTDMId: number;
  thread: any;

  constructor() {
    this.sourceDir = "src/files/source/";
    
    this.llm = new OpenAI({
      organization: "org-KwT9TRXftjDS0P3W5z2HsBAw",
      project: "proj_y5wkfAAQFCkvxG7Tvo895TqV",
    });
    this.model = "gpt-4o-mini";

    this.SYSID = 3;
    this.GPTDMId = 4;
  }
  
  async createThread() {
    return await this.llm.beta.threads.create();
  }

  async init(rid: number) {
    // gather previous messages
    const msgs = await this.loadConversation(rid);
    
    await this.getAssistant();
    
    this.thread = await this.llm.beta.threads.create({
      messages: msgs
    });
  }
  
  async getAssistant() {
    const assistants = await this.llm.beta.assistants.list({
      order: "desc",
      limit: "20",
    });
    
    this.assistant = await this.llm.beta.assistants.retrieve(assistants.data[0].id);
  }

  async _getRoomHistory(rid: number) {
    const messages = await getMessages(rid);
    const conversation = [];

    for (const msg of messages) {
      const obj = {
        id: msg.author.id,
        name: msg.author.name,
        socket: msg.author.socket,
        player: msg.author.player.length > 0 ? msg.author.player[0] : {},
        rid: rid,
        content: msg.message
      };
      
      const json = JSON.stringify(obj);

      if (obj.id === this.GPTDMId) {
        conversation.push({
          role: "assistant",
          content: json
        });
      } else if (obj.id !== this.GPTDMId && obj.id !== this.SYSID) {
        conversation.push({
          role: "user",
          content: json
        });
      }
    }

    return conversation;
  }

  async loadConversation(rid: number) {
    const conversation = await this._getRoomHistory(rid);

    return conversation;
  }
  
  async welcome(data: any) {
    
    const welcomeData = await this.event({
      event: "user-join",
      room: data.room,
      data: data.data
    });
    
    const welcome = formatModelOutput(welcomeData);
    
    return welcome;
  }
  
  async event(query: any) {
    const json = JSON.stringify(query);
    let prompt = sysPrompt;
    
    if (query.event === "user-join") {
      prompt = sysPrompt + "\n\nA new user has joined a room. Please welcome them in D&D style if the room ID is not 1. If the room ID is 1, a simple greeting will suffice. Do not use HTML or icons. Only markdown is allowed. If the room ID is not 1, the user will need a character to continue, and a player should be created if the player is an empty object."
    }
    
    return await this.interact(json, prompt);
  }
  
  async interact(query: string, prompt = null) {
    const message = await this.llm.beta.threads.messages.create(
      this.thread.id,
      {
        role: "user",
        content: query
      }
    );
    
    let run = await this.llm.beta.threads.runs.createAndPoll(
      this.thread.id,
      {
        assistant_id: this.assistant.id,
        instructions: (prompt != null) ? prompt : sysPrompt
      }
    );
    
    if (run.status === 'completed') {
      let messages = await this.llm.beta.threads.messages.list(
        run.thread_id
      );
      messages = messages.data.reverse();
      
      const [lastItem] = messages.slice(-1);
      return JSON.parse(lastItem.content[0].text.value);
    } else {
      if (run.status == "requires_action") {
        return await this.handleRequiresAction(run);
      } else {
        console.log('ai run.status', run.status);
      }
    }
  }
  
  async handleRequiresAction(run) {
    // Check if there are tools that require outputs
    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      // Loop through each tool in the required action section
      const args = JSON.parse(run.required_action.submit_tool_outputs.tool_calls[0].function.arguments);
      
      const toolOutputs = run.required_action.submit_tool_outputs.tool_calls.map((tool) => {
        if (tool.function.name === "diceRoll") {
          return {
            tool_call_id: tool.id,
            output: diceRoll(args.num, args.sides),
          };
        }
      });
      
      // Submit all tool outputs at once after collecting them in a list
      if (toolOutputs.length > 0) {
        run = await this.llm.beta.threads.runs.submitToolOutputsAndPoll(
          this.thread.id,
          run.id,
          {
            tool_outputs: toolOutputs
          },
        );
        
        console.log("Tool outputs submitted successfully.");
        console.log('tool_output', toolOutputs);
        return toolOutputs;
      } else {
        console.log("No tool outputs to submit.");
      }
      
      // Check status after submitting tool outputs
      console.log("run status", run.status);
    }
  }
}





