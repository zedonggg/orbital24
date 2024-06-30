'use client'
require('dotenv').config();
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { LoadingOverlay, Paper, Button, Container, Input, Text, Title } from '@mantine/core';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [summarisedText, setSummarisedText] = useState('');
    const [quizText, setQuizText] = useState('');
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onFileUploadAndRun = async () => {
        setLoading(true);
        const data = new FormData();
        data.append('file', file);
        const config = {
          method: 'post',
          url: 'https://app.nanonets.com/api/v2/OCR/FullText',
          headers: { 
            'Authorization': 'Basic ' + Buffer.from("d55b4414-345e-11ef-bc02-ceb9fe89b381" + ":").toString('base64'),
          },
          data : data
        };
        try {
          const response = await axios(config);
          console.log(JSON.stringify(response.data));
          let allPagesText = '';
          if (response.data.results && response.data.results.length > 0 && response.data.results[0].page_data) {
            response.data.results[0].page_data.forEach(page => {
              if (page.raw_text) {
                allPagesText += page.raw_text + ' ';
              }
            });
          } else {
            console.log('The expected data is not available in the response');
            setSummarisedText('The expected data is not available in the response');
          }
      
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
          const prompt = "Please summarise this text. " + allPagesText;
          const result = await model.generateContent(prompt);
          const resp = await result.response;
          const text = await resp.text();
          console.log(text);
          setSummarisedText(text);

          const quiz = "Please create a 10 question quiz based on this text. " + allPagesText;
          const quizResult = await model.generateContent(quiz);
          const quizResp = await quizResult.response;
          const quizText = await quizResp.text();
          console.log(quizText);
          setQuizText(quizText);

        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      };
    
        return (
            <Container>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <Title order={1} align="center">File Upload</Title>
                    <Paper padding="md" shadow="xs" style={{ marginBottom: '15px' }}>
                        <Input type="file" onChange={onFileChange} />
                        <Button color="blue" fullWidth onClick={onFileUploadAndRun} style={{ marginTop: '10px' }}>Upload!</Button>
                    </Paper>
                    <LoadingOverlay visible={loading} />
                    <Paper padding="md" shadow="xs">
                        <Text><ReactMarkdown children={summarisedText} /></Text>
                    </Paper>
                    <Paper padding="md" shadow="xs">
                        <Text><ReactMarkdown children={quizText} /></Text>
                    </Paper>
                </div>
            </Container>
        );
    };
    
    export default FileUpload;
