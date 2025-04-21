import { Injectable, Logger } from '@nestjs/common';
import { ChromaService } from 'src/db/chroma/chroma.service';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatDeepSeek } from '@langchain/deepseek';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);
  private vectorStores: Map<string, MemoryVectorStore> = new Map();
  private chains: Map<string, RunnableSequence> = new Map();

  constructor(
    private readonly chromeService: ChromaService,
    private readonly configService: ConfigService,
  ) {}

  async handleScanCV(cvPdfLink: string, fileName: string) {
    try {
      // Download PDF from URL
      const pdfPath = await this.downloadFile(cvPdfLink);

      // Load PDF document
      const loader = new PDFLoader(pdfPath);
      const docs = await loader.load();

      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
        separators: ['\n\n', '\n', ' ', ''],
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: this.configService.get('OPENAI_API_KEY'),
        modelName: 'text-embedding-3-small',
      });

      const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
      );

      this.vectorStores.set(fileName, vectorStore);

      const model = new ChatDeepSeek({
        apiKey: this.configService.get('AI_API_KEY'),
        modelName: this.configService.get('AI_MODEL'),
      });

      // Create RAG prompt
      const SYSTEM_TEMPLATE = `You are an AI assistant specialized in analyzing CVs and resumes.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Always answer in the same language as the question.

Context: {context}`;

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_TEMPLATE],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      // Create chain
      const chain = RunnableSequence.from([
        async (input: string) => {
          const relevantDocs = await vectorStore.similaritySearch(input, 4);
          return {
            input,
            context: relevantDocs.map((doc) => doc.pageContent).join('\n\n'),
            chat_history: [],
          };
        },
        prompt,
        model,
        new StringOutputParser(),
      ]);

      this.chains.set(fileName, chain);

      // Clean up downloaded file
      fs.unlinkSync(pdfPath);

      return {
        success: true,
        message: `CV processed successfully and saved as "${fileName}". You can now ask questions using *askCV ${fileName} [question]`,
        fileName: fileName,
      };
    } catch (error) {
      this.logger.error('Error processing CV:', error);
      return {
        success: false,
        message: `Error processing CV: ${error.message}`,
      };
    }
  }

  async askAboutCV(fileName: string, question: string) {
    try {
      const vectorStore = this.vectorStores.get(fileName);
      const chain = this.chains.get(fileName);

      if (!vectorStore || !chain) {
        return {
          success: false,
          message: `No CV found with name "${fileName}". Please scan a CV first using *scanCV [pdf_link] [file_name]`,
        };
      }

      const response = await chain.invoke(question);

      return {
        success: true,
        message: response,
      };
    } catch (error) {
      this.logger.error('Error asking about CV:', error);
      return {
        success: false,
        message: `Error asking about CV: ${error.message}`,
      };
    }
  }

  private async downloadFile(url: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, `${uuidv4()}.pdf`);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);

      https
        .get(url, (response) => {
          response.pipe(file);

          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });
        })
        .on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
    });
  }
}
