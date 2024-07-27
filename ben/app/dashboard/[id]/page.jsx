'use client'
import firebase_app from '../../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid,
    TextInput,
    Container,
    Paper,
    Title,
    Input,
    NavLink,
 } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlt, IconVideo } from '@tabler/icons-react';
import React, { useState, useEffect } from 'react';
import classes from './page.module.css';
import {
    IconHome2,
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconFingerprint,
    IconCalendarStats,
    IconUser,
    IconSettings,
    IconLogout,
    IconSwitchHorizontal,
    IconChevronRight,
    IconNotebook,
    IconFileTypePdf,
    IconNotes
  } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { Button } from '@mantine/core';
import { PathParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { Grid } from '@mantine/core';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import styles from "./page.module.css";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { v4 as uuidv4 } from 'uuid';
import Groq from 'groq-sdk';


// interface NavbarLinkProps {
//   icon: typeof IconHome2;
//   label: string;
//   href: string;  
//   active: boolean;
//   onClick?(): void;
// }

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true })

export const maxDuration = 60;

function splitter(longtext, maxChunkLength = 3000) {
  const words = longtext.split(' ');
  const chunks = [];
  let cur = "";
  let counter = 0;

  for (const word of words) {
    if (counter >= maxChunkLength) {
      counter = 0;
      chunks.push(cur);
      cur = word;
    } else {
      cur += (cur ? ' ' : '') + word;
      counter += 1;
    }
  }

  if (cur) {
    chunks.push(cur);
  }

  return chunks;
}

async function summarizeChunk(chunk) {
  return groq.chat.completions.create({
    messages: [
      { role:'system', content: 'You are an AI assistant that summarizes text concisely for students while preserving important technical info and dates. Provide summaries directly without using labels or prefixes like "Summary:" or similar. Start your response with the actual content of the summary.'},
      { role: 'user', content: `Summarize the following text: \n\n${chunk}`}
    ],
    model: "llama3-8b-8192",
});
}





function NavbarLink({ icon: Icon, label, href, active, onClick}) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <Link href={href}>
        <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
          <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </UnstyledButton>
      </Link>
    </Tooltip>
  );
}
const mockdata = [
  { icon: IconGauge, label: 'Dashboard', href: '/dashboard', active: true},
  { icon: IconNotebook, label: 'Quizzes', href: '/quiz', active: false},
  { icon: IconUser, label: 'Account', href: '/profile', active: false},
];



export default function AddCourse({ params }) {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();
    
    const [summarytmp, setTmpSummaries] = useState();
    const [displayName, setDisplayName] = useState("");
    const [ffmpeg, setFfmpeg] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [convertedFile, setConvertedFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loadingtwo, setLoadingTwo] = useState(false);
  const [aisummary, setAisummary] = useState('');
  const [buttonDisable, setButtonDisable] = useState(false);

  async function processTranscript(text) {
    setButtonDisable(true);
    const allchunks = splitter(text);
    const summaries = []
    for (const c of allchunks) {
      const chatCompletion = await summarizeChunk(c);
      summaries.push(chatCompletion.choices[0]?.message?.content || "");
    }
    const combine = summaries.join('\n\n');
    setAisummary(combine);
    setButtonDisable(false);
  }

  const loadFFmpeg = async () => {
    const ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load({
      coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
    });
    setFfmpeg(ffmpegInstance);
  };
  
  const handleVideoFileChange = async (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleAudioFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    console.log(videoFile);
    if (!videoFile || !ffmpeg) return;

    console.log('test');
    setLoadingTwo(true);
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.exec(['-i', 'input.mp4', 'output.mp3']);
      const data = await ffmpeg.readFile('output.mp3');
      const blob = new Blob([data.buffer], { type: 'audio/mp3' });
      setConvertedFile(URL.createObjectURL(blob));
      setLoading(false);
    } catch (error) {
      console.error('Conversion error:', error);
      setLoading(false);
    }
    
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setLoadingTwo(true);
    try {
      const fileName = `tmp_${uuidv4()}.mp3`;
      const {data, error} = await supabase.storage
        .from('audio_files')
        .upload(fileName, audioFile);
      
      if (error) throw error;

      const fileurl = "https://cvumoldykbzywcazohmd.supabase.co/storage/v1/object/public/audio_files/" + fileName;

      console.log(fileurl);
      // const formData = new FormData();
      // formData.append('file', audioFile);

      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({fileUrl: fileurl, fileName: fileName}),
      });

      if (response.ok) {
        const result = await response.json();
        setTranscription(result.transcription);
        addTranscript(textNameTranscribe, result.transcription);
      } else {
        console.error('Transcription failed');
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
    setLoadingTwo(false);
  };

    const getName = async (x) => {
        
      let { data, error } = await supabase
      .rpc('fetchDisplayName', {
      user_id : x
      })
      if (error) console.error(error)
      else {
        if (data == null || data.length == 0) {
          router.push("/onboarding");
        } else {
          setDisplayName(data);
        }
      }
  
  }

  

    React.useEffect(() => {
      const loadPage = onAuthStateChanged(auth, (user) => {
        if (user) {
          getName(user.uid);
          setUserId(user.uid);
          console.log("user logged in! yipee!");
          loadFFmpeg();
          checkCourse(user.uid);
          getTexts(user.uid);
        } else { 
            setUserId('');
            router.push("/");
            console.log("No user found");
        }
    });
      return loadPage;
    }, []);



    const checkCourse = async (x) => {    
        const { data, error } = await supabase
        .from('courses')
        .select()
        .eq('uid', x)
        .eq('course_id', params.id)

        if (error || data.length == 0) router.push('/dashboard')
        else console.log(data);
    }

    const [ailoading, setAiloading] = useState(false);
    const addAISummary = async (id, words) => {
      setAiloading(true);
      let { data, error } = await supabase
      .rpc('updateAI', {
        ai_text : words, 
        userid : id
      })
      if (error) console.error(error)
      else setAiloading(false);

    }

    const getTexts = async (x) => {
      const { data, error } = await supabase
      .from('summaries')
      .select()
      .eq('uid', x)
      .eq('course_id', params.id)

      if (error) console.log(error)
        else data.map(x => setSummaries((old) => [...old, x]));
    }

    const addSummary = async (iName, sName) => {
      let { data, error } = await supabase
      .rpc('addSummary', {
        course_num : params.id, 
        item_name : iName, 
        summary_name : sName, 
        user_id : userId
      })
      if (error) console.error(error)
      else console.log(data)
    }

    const addTranscript = async (iName, tName) => {
      let { data, error } = await supabase
      .rpc('addTranscription', {
        course_num : params.id, 
        is_transcript : true, 
        item_name : iName, 
        transcript_info : tName, 
        user_id : userId
      })
      if (error) console.error(error)
      else console.log(data)
    }

  const onSignOut = () => {
    signOut(auth).then(() => {
      console.log("successful logout!")
      router.push("/");
    }).catch((error) => {
      console.log("error logout!");
    })
  }

  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {setActive(index)}}
    />
  ));

  
  const courseForm = useForm({
    mode:'uncontrolled',
    initialValues: {
        name: ''
    }
  })

    const [file, setFile] = useState(null);
    const [summarisedText, setSummarisedText] = useState('');
    const [textName, setTextName] = useState('');
    const [textNameTranscribe, setTextNameTranscribe] = useState('');
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onTextChange = (x) => {
      setTextName(x.target.value);
      console.log(textName);
    }

    const onTextChangeTranscribe = (x) => {
      setTextNameTranscribe(x.target.value);
    }

    const onFileUploadAndRun = async () => {
        setLoading(true);
        alert("file uploading!");
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
          addSummary(textName, text);
          alert("successfully uploaded! refresh to see changes")
          router.push("/dashboard/" + params.id);


        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      };

      

  const [summaries, setSummaries] = useState([]);

  const [activeSummary, setActiveSummary] = useState();

  const summaryItems = summaries != null && summaries.map((link, index) => {
    return <NavLink {...link} key={index} color="#d16bce" label={link.title} active={index === activeSummary}
    onClick={() => setActiveSummary(index)} rightSection={
      <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
    }/>
  })


  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ border: 'none'}}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {(<p>Hello, <span style={{ color: "rgba(209, 107, 206, 1)"}}>{displayName}</span></p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{ border: 'none'}}>
      <div className={classes.navbarMain}>
        <Stack justify="top" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={onSignOut} href="#" active={false}/>
      </Stack>
      </AppShell.Navbar>
      <AppShell.Main style={{ background: "#3B3B3B"}}>
      <Container size='lg' py='xl' style={{ maxWidth: '100%'}}>
        <Title ta='center' className={styles.description}>
          Get started
        </Title>
        <SimpleGrid cols={{ base:1, md: 3}} spacing='md' mt='xl'>
          <Card shadow='md' radius='md' padding='xl' className={styles.card}>
            <IconFileTypePdf style={{ width: rem(50), height: rem(50)}} color='rgba(209, 107, 206, 1)' />
            <Text fz='lg' fw={500} className={styles.cardTitle} mt='md'>
              Summarize your Notes
            </Text>
            <Text fz='sm' c='dimmed' mt='sm'>
              Upload your PDF notes and enter a name for them. Your notes will be intelligently summarized and added to your stash.
            </Text>
            <Card.Section className={styles.section} mt='lg'>
            <Group mt='lg'>
            <Input type='text' placeholder = "Enter a name for your item" value = {textName} onChange={onTextChange} />
                        <Input type="file" onChange={onFileChange} />
                        <Button color="rgba(209, 107, 206, 1)" fullWidth onClick={onFileUploadAndRun} style={{ marginTop: '10px' }}>Upload!</Button>
            </Group>
            </Card.Section>
          </Card>
  
          <Card shadow='md' radius='md' padding='xl' className={styles.card}>
            <IconVideo style={{ width: rem(50), height: rem(50)}} color='rgba(209, 107, 206, 1)' />
            <Text fz='lg' fw={500} className={styles.cardTitle} mt='md'>
              Video to Audio
            </Text>
            <Text fz='sm' c='dimmed' mt='sm'>
              Automatically convert your lecture videos to audio files. Download your audio files to use for our intelligent transcription and summarization.
            </Text>
            <Card.Section className={styles.section} mt='lg'>
              <Group mt='lg'>
                <input type="file" accept="video/*" onChange={handleVideoFileChange} />
          <button onClick={handleConvert} disabled={!videoFile | loadingtwo}>
            {loadingtwo ? 'Converting...' : 'Convert to MP3'}
          </button>
          {convertedFile && (
            <div>
              <h3>Converted File:</h3>
              <audio controls src={convertedFile} />
              <a href={convertedFile} download="converted.mp3">Download MP3</a>
            </div>
          )}
              </Group>
            </Card.Section>
          </Card>
  
          <Card shadow='md' radius='md' padding='xl' className={styles.card}>
            <IconNotes style={{ width: rem(50), height: rem(50)}} color='rgba(209, 107, 206, 1)' />
            <Text fz='lg' fw={500} className={styles.cardTitle} mt='md'>
              Summarize your Lectures
            </Text>
            <Text fz='sm' c='dimmed' mt='sm'>
              Upload your MP3 lecture recordings and enter a name for them. Your lecture will be intelligently transcribed and added to your stash. You can choose to intelligently summarize your transcript inside your stash.
            </Text>
            <Card.Section className={styles.section} mt='lg'>
            <Group mt='lg'>
            <Input type='text' placeholder = "Enter a name for your item" value = {textNameTranscribe} onChange={onTextChangeTranscribe} />
            <input type="file" accept="audio/*" onChange={handleAudioFileChange} />
        <button onClick={handleTranscribe} disabled={!audioFile || loadingtwo}>
          {loadingtwo ? 'Transcribing...' : 'Transcribe Audio'}
        </button>
            </Group>
            </Card.Section>
          </Card>
        </SimpleGrid>
      </Container>
        <Center>
            <Container style={{ minWidth : '100%', padding:'0'}}>
            <Grid style={{ minWidth : '100%'}}>
              <Grid.Col span={3}>
                <h2 style={{ margin: 'auto'}}>Your Stash</h2>
                      {/* <Paper>
                          <Input type='text' placeholder = "Enter a name for your file" value = {textName} onChange={onTextChange} />
                          <Input type="file" onChange={onFileChange} />
                          <Button color="rgba(209, 107, 206, 1)" fullWidth onClick={onFileUploadAndRun} style={{ marginTop: '10px' }}>Upload!</Button>
                      </Paper> */}
                {summaryItems}
              </Grid.Col>
              <Grid.Col span={9}>
                <Paper>
                        { summaries != null && activeSummary != null && activeSummary >= 0 && (summaries[activeSummary].is_transcription ? (
                          <Paper style={{ padding: '25px'}}>
                            <Group>
                              <Button variant="gradient"
      gradient={{ from: 'indigo', to: '#d16bce', deg: 90 }} disabled={buttonDisable} onClick={() => processTranscript(summaries[activeSummary].text)}>Click to Summarize your Transcript</Button>
                              <Button variant="gradient"
      gradient={{ from: 'indigo', to: '#d16bce', deg: 90 }} disabled={ailoading} onClick={() => addAISummary(summaries[activeSummary].id, aisummary)}>Click to save your summary</Button>
                              <Text>{aisummary}</Text>
                              {summaries[activeSummary].ai_summary != null && (<Group><h2>Your Current Summary:</h2>{summaries[activeSummary].ai_summary}</Group>)}
                            </Group>
                            <Group>
                              <h2 style={{ marginBottom: '0'}}>Your transcription:</h2>
                              <p style={{ marginTop: '0'}}>{summaries[activeSummary].text}</p>
                            </Group>
                          </Paper>
                        ) : (<Text style={{ padding: '25px'}}><ReactMarkdown>{summaries[activeSummary].text}</ReactMarkdown></Text>))}      
                </Paper>
              </Grid.Col>
            </Grid>
            </Container>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
