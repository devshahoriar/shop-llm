import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { io } from '../../index.js'
import type { ToolsResponse } from '../../types/toolsResponse.js'

const createAddToCartTool = tool(
  async function (input, config) {
    const { productId, quantity = 1 } = input as { productId: string; quantity?: number }

    const socketId = config?.metadata?.socketId
    console.log(socketId, 'socketId in addToCart tool')

    if (!socketId) {
      return 'No socket connection available to add to cart'
    }

    // Get the specific socket instance
    const socket = io.sockets.sockets.get(socketId)
    if (!socket) {
      return 'Socket connection not found'
    }

    // Send add to cart event to client
    io.to(socketId).emit('tools', {
      name: 'addToCart',
      data: { 
        productId: productId,
        quantity: quantity 
      },
    } satisfies ToolsResponse)

    return `Added product ${productId} to cart with quantity ${quantity}`
  },
  {
    name: 'addToCart',
    description: 'Add a product to the shopping cart using the product ID. Use this when user wants to add a specific product to their cart. First you need to use getContext tool to ensure the product is available on the current page.',
    schema: z.object({
      productId: z
        .string()
        .describe('The ID of the product to add to cart'),
      quantity: z
        .number()
        .optional()
        .default(1)
        .describe('The quantity of the product to add (default: 1)'),
    }),
  }
)

export default createAddToCartTool
