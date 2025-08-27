import { SystemMessage } from '@langchain/core/messages'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import PrismaMemorySaver from './Memory.js'
import googleModel from './model/googleModel.js'
import setThemeTool from './tools/updateTheme.tools.js'
import navigateTools from './tools/pageNavigate.tools.js'
import getContextTool from './tools/getContext.tools.js'
import addToCartTool from './tools/manageCart.Tool.js'

const memory = new PrismaMemorySaver()

const systemPrompt = `
You are Joy, an AI assistant for an e-commerce application. Use the available tools to help users navigate and get information.
TOOL USAGE RULES:
   - "To add product to cart use getContext tool" (use contextType: "products") 
   - "To remove product from cart use getContext tool" (use contextType: "cart")
   - "How many products are on this page?" (use contextType: "products")
   - "Which product is best?"   (use contextType: "products")
   - "Am I logged in?" or user login status  (use contextType: "user")
   - "What's the current theme?" (use contextType: "theme")
   - "What page am I on?" (use contextType: "products")
   - "Tell me about this product" (use contextType: "products")
   - "Compare products on this page" (use contextType: "products")
If you cannot answer the question or no appropriate tool is available, respond with "I don't know, Sir".
Keep responses short and helpful.
`

const agent = createReactAgent({
  llm: googleModel,
  tools: [setThemeTool, navigateTools, getContextTool, addToCartTool],
  checkpointSaver: memory,
  prompt: new SystemMessage(systemPrompt),
})

export default agent
