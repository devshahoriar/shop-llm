import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { io } from '../../index.js'
import type { ToolsResponse } from '../../types/toolsResponse.js'

const urls = ['/', '/products', '/about','/login',"/product/:id"]

const createNavigateRouteTool = tool(
  async function (input, config) {
    const { route } = input as { route: string }

    // Extract base route from URL (remove query params for validation)
    const baseRoute = route.split('?')[0]
    
    // Check if route matches any allowed URLs or dynamic patterns
    const isValidRoute = urls.some(url => {
      if (url === baseRoute) return true
      
      // Handle dynamic routes like /product/:id
      if (url.includes(':')) {
        const urlParts = url.split('/')
        const routeParts = baseRoute.split('/')
        
        if (urlParts.length !== routeParts.length) return false
        
        return urlParts.every((part, index) => {
          return part.startsWith(':') || part === routeParts[index]
        })
      }
      
      return false
    })
    
    if (!isValidRoute) {
      return `Invalid route. Available routes are: ${urls.join(', ')}`
    }

    const socketId = config?.metadata?.socketId
    console.log(socketId, 'socketId in navigate tool')

    io.to(socketId).emit('tools', {
      name: 'navigate',
      data: { value: route },
    } satisfies ToolsResponse)

    return `Navigated to ${route}`
  },
  {
    name: 'navigateRoute',
    description: 'Navigate to a specific route/page in the application. The /products page supports query params like /products?sort=price-low&search=gold. When user asks to search products, you can use query parameters.',
    schema: z.object({
      route: z
        .string()
        .describe('The route to navigate to. Base routes: /, /products, /about, /login. The /products route supports query params like ?sort=price-low&search=gold, /product/:id to view a specific product.'),
    }),
  }
)

export default createNavigateRouteTool
