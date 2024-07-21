'use client'
import { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Home() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    const ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load({
      coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
    });
    setFfmpeg(ffmpegInstance);
  };

  const handleVideoFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleAudioFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!videoFile || !ffmpeg) return;

    setLoading(true);
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.exec(['-i', 'input.mp4', 'output.mp3']);
      const data = await ffmpeg.readFile('output.mp3');

      const blob = new Blob([data.buffer], { type: 'audio/mp3' });
      setConvertedFile(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Conversion error:', error);
    }
    setLoading(false);
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTranscription(result.transcription);
      } else {
        console.error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Video to MP3 Converter and Audio Transcriber</h1>
      
      <div>
        <h2>Video to MP3 Conversion</h2>
        <input type="file" accept="video/*" onChange={handleVideoFileChange} />
        <button onClick={handleConvert} disabled={!videoFile || loading}>
          {loading ? 'Converting...' : 'Convert to MP3'}
        </button>
        {convertedFile && (
          <div>
            <h3>Converted File:</h3>
            <audio controls src={convertedFile} />
            <a href={convertedFile} download="converted.mp3">Download MP3</a>
          </div>
        )}
      </div>

      <div>
        <h2>Audio Transcription</h2>
        <input type="file" accept="audio/*" onChange={handleAudioFileChange} />
        <button onClick={handleTranscribe} disabled={!audioFile || loading}>
          {loading ? 'Transcribing...' : 'Transcribe Audio'}
        </button>
        {transcription && (
          <div>
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}