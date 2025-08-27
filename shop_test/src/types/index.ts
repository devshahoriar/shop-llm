/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

export type Message = {
  text: string;
  isUser: boolean;
}

export type ToolsResponse = {
  name: 'theme' | 'navigate' | 'wantContext' | 'context' | 'cart'
  data: Record<string, any> 
}