import { Injectable, Logger, Inject } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatDeepSeek } from '@langchain/deepseek';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
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
import { QdrantClient } from '@qdrant/js-client-rest';
import { MezonService } from 'src/mezon/mezon.service';
import { FumoMessageService } from 'src/mezon/fumo-message.module';
import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { EMessageMode } from 'src/common/enums/mezon.enum';
import { Document } from '@langchain/core/documents';
import OpenAI from 'openai';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);
  private vectorStores: Map<string, QdrantVectorStore> = new Map();
  private chains: Map<string, RunnableSequence> = new Map();
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @Inject('QRANDT_CLIENT')
    private readonly qdrantClient: QdrantClient,
    private readonly mezon: MezonService,
    private readonly fumoMessage: FumoMessageService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async handleScanCV(cvPdfLink: string, fileName: string) {
    try {
      const pdfPath = await this.downloadFile(cvPdfLink);

      const fileStats = fs.statSync(pdfPath);

      let docs: Document[] = [];

      // Try reading PDF directly first
      try {
        const loader = new PDFLoader(pdfPath, {
          splitPages: true,
          pdfjs: () => import('pdfjs-dist/legacy/build/pdf.js'),
        });

        const pdfDocs = await loader.load();

        if (pdfDocs.length > 0) {
          const totalContentLength = pdfDocs.reduce(
            (sum, doc) => sum + doc.pageContent.length,
            0,
          );

          if (totalContentLength > 100) {
            docs = pdfDocs;
            this.logger.debug('Using direct PDF content');
          }
        }
      } catch (error) {
        this.logger.warn('Failed to read PDF directly:', error);
      }

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ['\n\n', '\n', '.', ' ', ''],
      });

      const splitDocs = await textSplitter.splitDocuments(docs);
      this.logger.debug(`Split into ${splitDocs.length} chunks`);

      if (splitDocs.length === 0) {
        throw new Error('No chunks could be created from the PDF content');
      }

      splitDocs.forEach((doc, i) => {
        this.logger.debug(
          `Chunk ${i + 1} content: ${doc.pageContent.substring(0, 200)}...`,
        );
      });

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: this.configService.get('OPENAI_API_KEY'),
        modelName: 'text-embedding-3-small',
      });

      const validFileName = fileName.replace(/[^a-zA-Z0-9_]/g, '_');

      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          client: this.qdrantClient,
          collectionName: validFileName,
        },
      );

      const collectionInfo =
        await this.qdrantClient.getCollection(validFileName);

      this.vectorStores.set(fileName, vectorStore);

      const model = new ChatDeepSeek({
        apiKey: this.configService.get('AI_API_KEY'),
        modelName: this.configService.get('AI_MODEL'),
      });

      const SYSTEM_TEMPLATE = `You are an IT recruiter with over five years of experience at NCC+. Your task is to read each candidate's CV and decide whether they are a good fit for a given position (Intern or Staff). When asked for a general evaluation (or no specific question is given), follow these rules and format exactly. Always answer in the same language as the question. Do not use markdown in your output.

Scoring Criteria (each on a 0–5 scale):

Completeness of CV
- Personal details (phone, email, birthday, school): 1 pt
- Work experience listed: 1 pt
- Projects and candidate's role in each: 2 pt
- Clear layout and correct spelling: 1 pt

Education
- If still studying: up to 3 pt
- If graduated with "Excellent": up to 5 pt
- If graduated with "Good": up to 4 pt
- Use GPA or diploma classification to assign score

Language proficiency (or WARN/5 if no data)
- APTIS certificate: 1 pt
- TOEIC reading & writing: up to 2 pt
- TOEIC listening & speaking: up to 3 pt
- IELTS ≥ 6.5: up to 4 pt; IELTS ≥ 7.0: 5 pt
- If no information: WARN/5 – "không có thông tin, nên cân nhắc"

Fit for the role
If position = Intern:
1 pt – basic knowledge only
2 pt – some relevant experience
3 pt – solid knowledge, can join real projects under supervision
4 pt – broad skills, can switch stacks
5 pt – meets all above
If position = Staff:
2 pt – ≥ 6 months with required stack
3 pt – ≥ 1 year
4 pt – multi-stack, can switch freely
5 pt – meets all above

Conclusion Rules:

If Intern, assign level 0/1/2/3:
0 – hoàn toàn không biết gì, vào để học hỏi
1 – kiến thức cơ bản + chút kinh nghiệm, cần training, ngoại ngữ căn bản
2 – nắm chắc rất kiến thức, có thể tham gia dự án dưới giám sát, ngoại ngữ khá, làm qua nhiều dự án cá nhân rồi
3 – vững, linh hoạt, làm tốt nhiệm vụ, ngoại ngữ khá, có thể làm được nhiều dự án cá nhân hoặc team project

If Staff, state "Phù hợp làm Staff" or "Không phù hợp làm Staff"

Always finish with:
This candidate is [not ]suitable for the position of [Intern/Staff] at NCC+.

REQUIREMENTS:

Use the context sections provided to answer the final question.

If you do not know the answer, say you do not know and do not fabricate.

Always respond in the same language as the question.

Do not use markdown.

SAMPLE OUTPUT (tiếng Việt, không dùng markdown): THÔNG TÍN:

Ứng viên: Nguyễn Văn A

Sinh năm: 2004

Học trường: HUST

PHÂN TÍCH:

Đầy đủ thông tin: 4/5

CV có đầy đủ email, số điện thoại, sinh nhật, trường; thiếu mô tả nhiệm vụ cụ thể trong dự án.

Học vấn: 5/5

Tốt nghiệp loại Giỏi, GPA 3.8/4.0 tại HUST.

Trình độ ngoại ngữ: 4/5

IELTS 6.5, khả năng nghe – nói – đọc – viết khá.

Độ phù hợp với vị trí (Intern): 3/5

Có 1 năm thực tập với công nghệ Java, hiểu biết cơ bản, cần training thêm.

KẾT QUẢ:

Đánh giá ứng viên ở level INTERN 2

Có kiến thức nền tảng, thực tập dự án thực tế, ngoại ngữ khá nhưng cần giám sát thêm.
Ứng viên này phù hợp làm INTERN ở NCC.

Context: {context}`;

      const prompt = ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_TEMPLATE],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      const chain = RunnableSequence.from([
        async (input: string) => {
          const relevantDocs = await vectorStore.similaritySearch(input, 4);

          relevantDocs.forEach((doc, i) => {});
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

      fs.unlinkSync(pdfPath);

      return {
        success: true,
        message: `CV đã được xử lý thành công và đã được lưu dưới tên "${fileName}". Bạn có thể hỏi câu hỏi bằng cách sử dụng *askCV ${fileName} [câu_hỏi]`,
        fileName: fileName,
      };
    } catch (error) {
      return {
        success: false,
        message: `Lỗi xử lý CV: ${error.message}`,
      };
    }
  }

  async askAboutCV(
    message: ChannelMessage,
    fileName: string,
    question: string,
  ) {
    try {
      const placeholder = await this.fumoMessage.sendSystemMessage(
        message,
        'Đang phân tích CV...',
        message,
      );
      const vectorStore = this.vectorStores.get(fileName);
      const chain = this.chains.get(fileName);

      if (!vectorStore || !chain) {
        const messageText = `Không tìm thấy CV với tên "${fileName}". Vui lòng quét CV trước bằng cách sử dụng *scanCV [link_pdf] [tên_tệp]`;
        await this.mezon.updateMessage(
          message.clan_id!,
          message.channel_id,
          message.mode || EMessageMode.CHANNEL_MESSAGE,
          message.is_public || false,
          placeholder!.message_id,
          {
            t: messageText,
            mk: [
              {
                type: 'pre' as EMarkdownType,
                e: messageText.length,
                s: 0,
              },
            ],
          },
        );
        return;
      }

      const response = await chain.stream(question);
      let responseText = '';
      for await (const chunk of response) {
        responseText += chunk;
        await this.mezon.updateMessage(
          message.clan_id!,
          message.channel_id,
          message.mode || EMessageMode.CHANNEL_MESSAGE,
          message.is_public || false,
          placeholder!.message_id,
          {
            t: responseText,
          },
        );
      }

      await this.mezon.updateMessage(
        message.clan_id!,
        message.channel_id,
        message.mode || EMessageMode.CHANNEL_MESSAGE,
        message.is_public || false,
        placeholder!.message_id,
        {
          t: responseText,
          mk: [
            {
              type: 'pre' as EMarkdownType,
              e: responseText.length,
              s: 0,
            },
          ],
        },
      );
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
