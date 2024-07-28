import { OpenAIFiles } from "langchain/experimental/openai_files";

async function main() {
  const openAIFiles = new OpenAIFiles();
  const result = await openAIFiles.listFiles({
    purpose: "assistants"
  });
}

main()
  .then(async () => {
    
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
