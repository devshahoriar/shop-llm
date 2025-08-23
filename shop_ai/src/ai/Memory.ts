import { AIMessage, HumanMessage } from '@langchain/core/messages'
import type { RunnableConfig } from '@langchain/core/runnables'
import {
    BaseCheckpointSaver,
    type Checkpoint,
    type CheckpointMetadata,
    type CheckpointTuple
} from '@langchain/langgraph'
import type { PrismaClient } from '@prisma/client'
import prisma from '../../prisma/db.js'

// Define types that might not be exported
interface CheckpointListOptions {
    filter?: Record<string, any>
    before?: RunnableConfig
    limit?: number
}

interface ChannelVersions {
    [channel: string]: string | number
}


class PrismaMemorySaver extends BaseCheckpointSaver {
  private prisma: PrismaClient

  constructor() {
    super()
    this.prisma = prisma
  }

  async get(config: RunnableConfig): Promise<Checkpoint | undefined> {
    const tuple = await this.getTuple(config)
    return tuple?.checkpoint
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const { thread_id, checkpoint_id } = config.configurable as any
    
    if (!thread_id) {
      return undefined
    }

    let whereClause: any = { threadId: thread_id }
    
    if (checkpoint_id) {
      whereClause.checkpointId = checkpoint_id
    }

    const record = await this.prisma.checkpoint.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    if (!record) {
      return undefined
    }

    const checkpoint = JSON.parse(record.checkpoint) as Checkpoint
    const metadata = JSON.parse(record.metadata) as CheckpointMetadata
    const parentConfig = record.parentId ? {
      configurable: {
        thread_id: record.threadId,
        checkpoint_id: record.parentId
      }
    } : undefined

    return {
      config: {
        configurable: {
          thread_id: record.threadId,
          checkpoint_id: record.checkpointId
        }
      },
      checkpoint,
      metadata,
      parentConfig
    }
  }

  async *list(
    config: RunnableConfig, 
    options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const { thread_id } = config.configurable as any
    
    if (!thread_id) {
      return
    }

    const limit = options?.limit || 10
    let cursor = options?.before?.configurable?.checkpoint_id

    let whereClause: any = { threadId: thread_id }
    
    if (cursor) {
      const cursorRecord = await this.prisma.checkpoint.findFirst({
        where: { threadId: thread_id, checkpointId: cursor }
      })
      if (cursorRecord) {
        whereClause.createdAt = { lt: cursorRecord.createdAt }
      }
    }

    const records = await this.prisma.checkpoint.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    for (const record of records) {
      const checkpoint = JSON.parse(record.checkpoint) as Checkpoint
      const metadata = JSON.parse(record.metadata) as CheckpointMetadata
      const parentConfig = record.parentId ? {
        configurable: {
          thread_id: record.threadId,
          checkpoint_id: record.parentId
        }
      } : undefined

      yield {
        config: {
          configurable: {
            thread_id: record.threadId,
            checkpoint_id: record.checkpointId
          }
        },
        checkpoint,
        metadata,
        parentConfig
      }
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    newVersions: ChannelVersions
  ): Promise<RunnableConfig> {
    const { thread_id, checkpoint_id } = config.configurable as any
    const finalCheckpointId = checkpoint_id || `checkpoint_${Date.now()}`
    
    await this.prisma.checkpoint.upsert({
      where: {
        threadId_checkpointId: {
          threadId: thread_id,
          checkpointId: finalCheckpointId
        }
      },
      update: {
        checkpoint: JSON.stringify(checkpoint),
        metadata: JSON.stringify(metadata)
      },
      create: {
        threadId: thread_id,
        checkpointId: finalCheckpointId,
        parentId: (metadata as any).parent_config?.configurable?.checkpoint_id,
        type: (metadata as any).type,
        checkpoint: JSON.stringify(checkpoint),
        metadata: JSON.stringify(metadata)
      }
    })

    return {
      configurable: {
        thread_id,
        checkpoint_id: finalCheckpointId
      }
    }
  }

  async putWrites(
    config: RunnableConfig,
    writes: any[],
    taskId: string
  ): Promise<void> {
    const { thread_id, checkpoint_id } = config.configurable as any
    
    if (!thread_id || !checkpoint_id) {
      return
    }

    // Filter out writes with missing required fields and provide defaults
    const validWrites = writes.filter(write => 
      write && 
      typeof write.channel === 'string' && 
      typeof write.type === 'string' &&
      write.value !== undefined
    )

    if (validWrites.length === 0) {
      return
    }

    const writeRecords = validWrites.map(write => ({
      threadId: thread_id,
      checkpointId: checkpoint_id,
      taskId,
      channel: write.channel,
      type: write.type,
      value: JSON.stringify(write.value)
    }))

    await this.prisma.checkpointWrite.createMany({
      data: writeRecords
    })
  }

  async deleteThread(threadId: string): Promise<void> {
    // Delete writes first due to potential foreign key constraints
    await this.prisma.checkpointWrite.deleteMany({
      where: { threadId }
    })

    // Delete checkpoints
    await this.prisma.checkpoint.deleteMany({
      where: { threadId }
    })
  }
}

export default PrismaMemorySaver
