import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import sysPrompt from "@/files/sysPrompt"; // Ensure this is correctly imported and not null/undefined
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default class AnthropicAI {
  model: any;
  chain: any;
  memory: any;
  SYSID: number;
  GPTDMId: number;

  constructor() {
    this.model = new ChatAnthropic({
      temperature: 0.8,
      model: "claude-3-opus-20240229",
    });

    this.SYSID = 3;
    this.GPTDMId = 4;
  }

  async init(rid: number) {
    await this.loadConversation(rid);

    const p = await this._buildPrompt();
    
    const chatPrompt = ChatPromptTemplate.fromMessages(p);
    
    this.chain = new ConversationChain({
      memory: this.memory,
      prompt: chatPrompt,
      llm: this.model,
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
      const obj = {
        room: rid,
        uid: msg.authorId,
        uname: msg.author.name,
        content: msg.message
      };

      const json = JSON.stringify(obj);

      if (obj.uid === this.GPTDMId) {
        conversation.push(new AIMessage(json));
      } else if (obj.uid != this.GPTDMId && obj.id != this.SYSID) {
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
    if (!sysPrompt) {
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
      ["system", sysPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"], // Ensure this matches the variable name in the input
    ];
  }

  async getResponse(query) {
    try {
      console.log('anthropic query', JSON.stringify(query));
      
      const response = await this.chain.invoke({
        input: query,
      });

      if (!response || !response.response) {
        throw new Error("Invalid response structure");
      }

      console.log('anthropic response', response);
      return response.response;
    } catch (error) {
      console.error('Error in getResponse:', error.message, error.stack);
      return {
        user: {},
        rid: "",
        content: "There was an error processing your request.",
        imgOnly: false
      };
    }
  }
}





