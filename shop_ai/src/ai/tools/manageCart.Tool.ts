import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { io } from '../../index.js'
import type { ToolsResponse } from '../../types/toolsResponse.js'

const createAddToCartTool = tool(
  async function (input, config) {
    const { productId, action } = input as {
      productId: string
      action: 'add' | 'remove'
    }

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
      name: 'cart',
      data: {
        productId: productId,
        action: action,
      },
    } satisfies ToolsResponse)

    return `Product with ID ${productId} has been ${action === 'add' ? 'added to' : 'removed from'} the cart.`
  },
  {
    name: 'addToCart',
    description:
      'Add a product to the shopping cart use getContext tool to get product details before adding and Remove a product from the cart.',
    schema: z.object({
      productId: z.string().describe('The ID of the product to add to cart'),
      action: z
        .enum(['add', 'remove'])
        .describe('Action to perform: add or remove'),
    }),
  }
)

export default createAddToCartTool
