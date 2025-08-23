import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { io } from '../../index.js'
import type { ToolsResponse } from '../../types/toolsResponse.js'

const createSetThemeTool = tool(
  async function (input: { theme: 'light' | 'dark' }, config) {
    const { theme } = input

    const socketId = config?.metadata?.socketId
    console.log(socketId, 'socketId in setTheme tool')
    io.to(socketId).emit('tools', {
      name: 'theme',
      data: { value: theme },
    } satisfies ToolsResponse)

    return `Theme changed to ${theme}`
  },
  {
    name: 'setTheme',
    description: 'Change the webpage theme to light or dark.',
    schema: z.object({
      theme: z
        .enum(['light', 'dark'])
        .describe('The theme to set (light or dark)'),
    }),
  }
)

export default createSetThemeTool
