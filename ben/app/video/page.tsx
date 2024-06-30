import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Text, Paper } from '@mantine/core';
import extractAudio from 'ffmpeg-extract-audio';
import openai from 'openai'; // Assuming you have openai setup
import fs from 'fs';

const FileUpload = () => {
  const [transcription, setTranscription] = useState('');

  const handleFileUpload = async (e) => {
    const videoFile = e.target.files[0];
    const videoPath = URL.createObjectURL(videoFile);
    const outputPath = './output_audio.mp3';

    try {
      await extractAudio({
        input: videoPath,
        output: outputPath
      });
      console.log('Audio extraction successful!');

      const transcript = await openai.createTranscription(
        fs.createReadStream(outputPath),
        'whisper-1',
        TEMPLATE_WHISPER_PROMPT,
        'verbose_json',
        0.7,
        'en',
        {
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      setTranscription(transcript.data);
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Paper>
        <Input type="file" onChange={handleFileUpload} />
        <Button color="blue" fullWidth style={{ marginTop: '10px' }}>Upload!</Button>
      </Paper>
      <Paper>
        <Text>{transcription}</Text>
      </Paper>
    </div>
  );
};

export default FileUpload;