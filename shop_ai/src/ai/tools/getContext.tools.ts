import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { io } from '../../index.js'
import type { ToolsResponse } from '../../types/toolsResponse.js'
import cleanHtmlAttributes from '../helpers/cleanHtmlAttributes.js'

const ContextType = ['cart', 'products', 'user', 'theme']

const createGetContextTool = tool(
  async function (input, config) {
    const { contextType } = input as { contextType?: string }
    console.log('tool called with input:', input)

    if (contextType && !ContextType.includes(contextType)) {
      return `Invalid context type. Available types are: ${ContextType.join(
        ', '
      )}`
    }

    const socketId = config?.metadata?.socketId
    console.log(socketId, 'socketId in getContext tool')

    if (!socketId) {
      return 'No socket connection available to get context'
    }

    // Get the specific socket instance
    const socket = io.sockets.sockets.get(socketId)
    if (!socket) {
      return 'Socket connection not found'
    }

    // Create a promise to wait for the context response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.off('context', contextHandler)
        reject(new Error('Timeout waiting for context response'))
      }, 5000)

      const contextHandler = async (data: any) => {
        clearTimeout(timeout)
        socket.off('context', contextHandler)

        const { pageData, cart, theme, user } = data.data

        if (pageData) {
          const cleanedHtml = cleanHtmlAttributes(pageData)
          resolve(`Current app context (structured): ${cleanedHtml}`)
        }

        if (cart) {
          resolve(`Current cart contents: ${JSON.stringify(cart)}`)
        }

        if (theme) {
          resolve(`Current theme: ${theme}`)
        }

        if (user) {
          resolve(`User information: ${JSON.stringify(user)}`)
        }
      }

      // Listen for the context response
      socket.on('context', contextHandler)

      // Request context from client
      socket.emit('wantContext', {
        name: 'wantContext',
        data: { contextType: contextType },
      } satisfies ToolsResponse)
    })
  },
  {
    name: 'getContext',
    description:
      'If user asked about page, cart, products, user, theme you must use this tool to get the current context from the client application, such as current page, products being viewed, cart contents, user state, etc.',
    schema: z.object({
      contextType: z
        .string()
        .optional()
        .describe(
          `Optional: Specific type of context to request. Available types: ${ContextType.join(
            ', '
          )}. If not specified, say: "I can't help for this question"`
        ),
    }),
  }
)

export default createGetContextTool
