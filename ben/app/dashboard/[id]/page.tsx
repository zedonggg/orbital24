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
import { IconAlt } from '@tabler/icons-react';
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
    IconChevronRight
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


interface NavbarLinkProps {
    icon: typeof IconHome2;
    label: string;
    active?: boolean;
    onClick?(): void;
  }
  
function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
    return (
      <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
        <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
          <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </UnstyledButton>
      </Tooltip>
    );
}
  
const mockdata = [
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconUser, label: 'Account' },
    { icon: IconSettings, label: 'Settings' },
];

export default function AddCourse({ params }: { params: {id: string}}) {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();
    const [summaries, setSummaries] = useState<any[] | null>();

    React.useEffect(() => {
      const loadPage = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            console.log("user logged in! yipee!");
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

    const checkCourse = async (x:string) => {    
        const { data, error } = await supabase
        .from('courses')
        .select()
        .eq('uid', x)
        .eq('course_id', params.id)

        if (error || data.length == 0) router.push('/dashboard')
        else console.log(data);
    }

    const getTexts = async (x:string) => {
      const { data, error } = await supabase
      .from('summaries')
      .select()
      .eq('uid', x)
      .eq('course_id', params.id)

      if (error) console.log(error)
        else setSummaries(data);
    }

    const addSummary = async (iName:string, sName:string) => {
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
      onClick={() => {setActive(index); router.push('/dashboard')}}
    />
  ));

  const [activeSummary, setActiveSummary] = useState<number>();

  const summaryItems = summaries != null && summaries.map((link, index) => {
    return <NavLink {...link} key={index} color="#d16bce" label={link.title} active={index === activeSummary}
    onClick={() => setActiveSummary(index)} rightSection={
      <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
    }/>
  })

  const courseForm = useForm({
    mode:'uncontrolled',
    initialValues: {
        name: ''
    }
  })

    const [file, setFile] = useState(null);
    const [summarisedText, setSummarisedText] = useState('');
    const [textName, setTextName] = useState('');
    const [quizText, setQuizText] = useState('');
    const [loading, setLoading] = useState(false);

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onTextChange = (x) => {
      setTextName(x.target.value);
      console.log(textName);
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
          router.refresh();


        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <IconAlt size={30} /> */}
          { userId != null && (<p>{ "Hello, " + userId }</p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
      <div className={classes.navbarMain}>
        <Stack justify="top" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={onSignOut} />
      </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Center>
            <Container style={{ minWidth : '100%'}}>
            <Grid style={{ minWidth : '100%'}}>
              <Grid.Col span={4}>
                <Title order={1}>File Upload</Title>
                      <Paper>
                          <Input type='text' placeholder = "Enter a name for your file" value = {textName} onChange={onTextChange} />
                          <Input type="file" onChange={onFileChange} />
                          <Button color="rgba(209, 107, 206, 1)" fullWidth onClick={onFileUploadAndRun} style={{ marginTop: '10px' }}>Upload!</Button>
                      </Paper>
                {summaryItems}
              </Grid.Col>
              <Grid.Col span={8}>
                <Paper>
                        { summaries != null && activeSummary != null && activeSummary >= 0 && (<Text><ReactMarkdown>{summaries[activeSummary].text}</ReactMarkdown></Text>)}
                        
                </Paper>
              </Grid.Col>
            </Grid>
            </Container>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}