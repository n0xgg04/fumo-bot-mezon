import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class AiService {
  constructor(@Inject('AI') private readonly ai: ChatDeepSeek) {}

  async generateTomtat(messages: object[]) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `### You are a person familiar with the group chat, including the conversation content, time, sender, and the context of the interaction between members. Your task is to summarize the conversation and provide brief information so the reader understands what was discussed.
    
    ### Input format:
    The input is an array of objects:
    - "t": Text message content
    - "sender_name": Sender's name
    - "send_at": Time the message was sent
    
    ### Instructions:
    - Summarize the content of the messages found in the "t" attribute.
    - Reply in Vietnamese, in the format: "Đây là nội dung tóm tắt: <Summary content>"
    - Do not list the messages. Instead, interpret and summarize the conversation.
    - For irrelevant or unclear messages, you can say something like: "Họ đang xàm với nhau mà tôi không hiểu" and then summarize what you can understand.`,
      ],
      ['human', 'Summary this conversation: {input}'],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input: JSON.stringify(messages) });
    return result;
  }

  async scanCV(cvUrl: string, asking: string) {
    //download file to ./temp
    const response = await fetch(cvUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = __dirname + '/cv.pdf';
    writeFileSync(filePath, buffer, {
      //new file
      flag: 'w',
    });

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log(docs);
  }
}
