import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  AIMessage,
} from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import prisma from "@/lib/prisma";
import { formatModelInput } from "@/lib/utils";

export default class OAI {
  SYSBOT: number;
  DMBOT: number;
  sysPrompt: string;
  llm: any;
  memory: any;
  
  constructor(){
    this.llm = new ChatOpenAI({
      temperature: 0.9,
    });
    
    this.SYSBOT = 3;
    this.DMBOT = 4;
    this.sysPrompt = sysPrompt;
    this.memory = null;
  }
  
  async init(rid: number) {
    await this.loadConversation(rid);

    const p = await this._buildPrompt();
    
    const chatPrompt = ChatPromptTemplate.fromMessages(p);
    
    this.chain = new ConversationChain({
      memory: this.memory,
      prompt: chatPrompt,
      llm: this.llm,
    });
  }
  
  async _getRoomHistory(rid: number) {
    const messages = await prisma.message.findMany({
      where: {
        AND: [
          { roomId: rid },
          { type: "chat" }
        ]
      },
      include: {
        author: true,
      }
    });
    
    const conversation = [];

    for (const msg of messages) {
      const obj = formatModelInput(msg);

      const json = JSON.stringify(obj);

      if (obj.uid === this.DMBOT) {
        conversation.push(new AIMessage(json));
      } else if (obj.uid != this.DMBOT && obj.id != this.SYSBOT) {
        conversation.push(new HumanMessage(json));
      }
    }

    return conversation;
  }

  async loadConversation(rid: number) {
    const conversation = await this._getRoomHistory(rid);

    this.memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(conversation),
      returnMessages: true,
      memoryKey: "history"
    });
  }

  async _buildPrompt() {
    if (!this.sysPrompt) {
      throw new Error("System prompt is undefined or null.");
    }
    
    const directoryLoader = new DirectoryLoader("src/files/source/", {
      ".txt": (path: string) => new TextLoader(path),
    });
    
    const docs = await directoryLoader.load();
    
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    return [
      ["system", this.sysPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"], // Ensure this matches the variable name in the input
    ];
  }
  
  async interact(query: string) {
    const response = await this.chain.invoke({
      input: query,
    });
    
    return response.response;
  }
  
  
  
  async generateResponse(prompt: string) {
    const completion = await this.llm.chat.completions.create({
      messages: 
        {
          role: "system",
          content: sysPrompt
        }
      ],
      model: "gpt-4o",
    });
    
    console.log(completion.choices[0]);
  }
  
  async generateImage(prompt: string) {
    const image = await this.llm.images.generate({
      model: "dall-e-3",
      prompt: prompt
    });
    
    console.log(image.data);
  }
}









