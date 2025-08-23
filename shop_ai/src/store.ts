class SocketStore {
  private static instance: SocketStore
  private store = new Map<string, string>()
  private reverseStore = new Map<string, string>()

  private constructor() {}

  static getInstance(): SocketStore {
    if (!SocketStore.instance) {
      SocketStore.instance = new SocketStore()
    }
    return SocketStore.instance
  }

  set(socketId: string, threadId: string): void {
    const existingThreadId = this.store.get(socketId)
    const existingSocketId = this.reverseStore.get(threadId)
    
    if (existingThreadId) this.reverseStore.delete(existingThreadId)
    if (existingSocketId) this.store.delete(existingSocketId)
    
    this.store.set(socketId, threadId)
    this.reverseStore.set(threadId, socketId)
  }

  delete(socketId: string): void {
    const threadId = this.store.get(socketId)
    if (threadId) {
      this.store.delete(socketId)
      this.reverseStore.delete(threadId)
    }
  }

  getThreadId(socketId: string): string | undefined {
    return this.store.get(socketId)
  }

  getSocketId(threadId: string): string | undefined {
    return this.reverseStore.get(threadId)
  }
}

const socketStore = SocketStore.getInstance()

export default socketStore
