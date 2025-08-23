import { serve } from '@hono/node-server'
import { HumanMessage } from '@langchain/core/messages'
import dotenv from 'dotenv'
import { Hono } from 'hono'
import { Server as SocketIOServer } from 'socket.io'
import agent from './ai/index.js'
import socketStore from './store.js'
import { cors } from 'hono/cors'
import prisma from '../prisma/db.js'
import { logger } from 'hono/logger'

dotenv.config()

const app = new Hono()
app.use(cors())
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello, Hono with Socket.IO!')
})

app.get('/get-messages', async (c) => {
  const thread_id = c.req.query('thread_id')
  if (!thread_id) {
    return c.json({ error: 'Thread ID is required' }, 400)
  }
  const state = await agent.getState({ configurable: { thread_id } })
  const rawMessages = state.values.messages || []
  const messages = rawMessages.flatMap((msg: any) => {
    const text = msg.kwargs.content
    if (text instanceof Array) {
      return []
    }
    const messageType = msg.id[msg.id.length - 1]

    if (messageType === 'ToolMessage' || msg.type === 'tool') {
      return []
    }

    const isUser = messageType === 'HumanMessage'

    return {
      text: text,
      isUser: isUser,
    }
  })
  return c.json(messages)
})

app.get('/thread', async (c) => {
  const threadId = crypto.randomUUID().slice(0, 8)
  return c.json({ thread_id: threadId })
})

app.delete('/thread', async (c) => {
  const thread_id = c.req.query('thread_id')

  if (!thread_id) {
    return c.json({ error: 'Thread ID is required' }, 400)
  }

  try {
    await agent.updateState({ configurable: { thread_id } }, { messages: [] })

    await prisma.checkpoint.deleteMany({
      where: { threadId: thread_id },
    })

    await prisma.checkpointWrite.deleteMany({
      where: { threadId: thread_id },
    })

    return c.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return c.json({ error: 'Failed to delete conversation' }, 500)
  }
})

const PORT = 4000

const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  }
)

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  const socketId = socket.id
  console.log('User connected:', socketId)
  socket.on('disconnect', () => {
    socketStore.delete(socketId)
    console.log('User disconnected:', socketId)
  })

  socket.on('message', async (req: { message: string; thread_id: string }) => {
    const { message, thread_id } = req
    socketStore.set(socketId, thread_id)
    console.log('Received message:', message, 'for thread:', thread_id)
    const res = await agent.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      { configurable: { thread_id: thread_id + '', socketId } }
    )

    socket.emit('response', `${res.messages[res.messages.length - 1].content}`)
  })
})

export { app, io }
