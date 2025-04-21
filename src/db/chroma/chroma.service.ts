import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChromaClient } from 'chromadb';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChromaService {
  private readonly logger = new Logger(ChromaService.name);
  private readonly embeddings = {
    generate: async (texts: string[]) => {
      // Simple embedding function that returns random embeddings
      // This is just for testing - in production use a proper embedding model
      return texts.map(() =>
        Array(384)
          .fill(0)
          .map(() => Math.random()),
      );
    },
  };

  constructor(
    @Inject('CHROMA_CLIENT')
    private readonly client: ChromaClient,
  ) {}

  async getOrCreateCollection(name: string) {
    try {
      // Try to get the collection first
      const collection = await this.client.getCollection({
        name,
        embeddingFunction: this.embeddings,
      });
      this.logger.log(`Using existing collection: ${name}`);
      return collection;
    } catch (error) {
      // If collection doesn't exist, create it
      this.logger.log(`Creating new collection: ${name}`);
      const collection = await this.client.createCollection({
        name,
        embeddingFunction: this.embeddings,
      });
      return collection;
    }
  }
}
