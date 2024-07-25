import { NextResponse } from 'next/server';
import { PassThrough } from 'stream';
import multer from 'multer';
import Groq from 'groq-sdk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { createClient } from '@/utils/supabase/client';

// export const config = {
//   api: {
//     bodyParser: false,
//     responseLimit: '100mb',
//   },
// };

const groq = new Groq({ apiKey: "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"
    , dangerouslyAllowBrowser: true
})

// const upload = multer();

// function runMiddleware(req, res, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

const supabase = createClient();

export async function POST(request) {
    try {
        const data = await request.json();

        console.log(data);

        // const { data, error } = await supabase.storage.from('audio_files').download(fileName);

        // if (error) throw error;

        const audiofile = await fetch(data.fileUrl);
    
        // if (!file) {
        //   return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        // }
    
        // const buffer = await file.arrayBuffer();
        // const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'audio-'));
        // const filePath = path.join(tempDir, 'output.mp3');
        
        // await fs.promises.writeFile(filePath, Buffer.from(buffer));
    
        const transcription = await groq.audio.transcriptions.create({
          file: audiofile,
          model: "whisper-large-v3",
          response_format: "json",
          language: "en",
        });

        await supabase.storage.from('audio_files').remove([data.fileName]);
    
        // Clean up: delete the temporary file
        // await fs.remove(tempDir);
    
        return NextResponse.json({ transcription: transcription.text }, { status: 200 });
      } catch (error) {
        console.error('Error in transcription:', error);
        return NextResponse.json({ error: 'Error in transcription' }, { status: 500 });
      }
}