'use client'
import firebase_app from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid,
    TextInput,
    Container,
    Paper,
    Title,
    Input,
    Table,
    Progress,
    Modal,
    Col,
    Button,
    Select,
    NavLink,
    Radio,
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
    IconNotebook,
    IconSwitchHorizontal,
    IconChevronRight,
  } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';
//import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { PathParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { Grid } from '@mantine/core';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/utils/supabase/client';

interface NavbarLinkProps {
    icon: typeof IconHome2;
    label: string;
    href: string;  
    active: boolean;
    onClick?(): void;
  }
  
  function NavbarLink({ icon: Icon, label, href, active, onClick}: NavbarLinkProps) {
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
    { icon: IconGauge, label: 'Dashboard', href: '/dashboard', active: false},
    { icon: IconNotebook, label: 'Quizzes', href: '/quiz', active: true},
    { icon: IconUser, label: 'Account', href: '/profile', active: false},
];

const questions_json = [
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "Paris"
    },
    {
      "question": "What is the capital of England?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "London"
    },
    {
      "question": "What is the capital of Germany?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "Berlin"
    }
  ]


export default function AddQuiz() {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();
    // const supabase = createClient('https://cvumoldykbzywcazohmd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dW1vbGR5a2J6eXdjYXpvaG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxNzYyMzIsImV4cCI6MjAzMzc1MjIzMn0.YVUlIc4A9H_e6RVw4LORg8g5gCaUywZ0APDElcnj9hA');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizContent, setQuizContent] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [generated_quiz, setGeneratedQuiz] = useState(null);
    const [displayName, setDisplayName] = useState("");


    const getName = async (x:string) => {
        
      let { data, error } = await supabase
      .rpc('fetchDisplayName', {
      user_id : x
      })
      if (error) console.error(error)
      else {
        if (data.length == 0) {
          router.push("/onboarding");
        } else {
          setDisplayName(data);
        }
      }
  
  }

    function showModal() {
        setIsModalVisible(true);
    }
      
      const handleOk = async () => {
        await addQuiz(quizTitle, quizContent, courseName);
        setIsModalVisible(false);
      };
      
      const handleCancel = () => {
        setIsModalVisible(false);
      };

    const [summaries, setSummaries] = useState<any[]>([]);

      const fetchSummaries = async (x : any) => {
        let { data, error } = await supabase
        .from('summaries')
        .select()
        .eq('uid', x.uid)
        if (error) console.error(error)
        else {
        setSummaries(data as any[]);
          console.log(data);
        };
      }

      const fetchCourses = async (x : any) => {
        let { data, error } = await supabase
        .from('courses')
        .select()
        .eq('uid', x.uid)
        if (error) console.error(error)
        else {
        if (data) {
            setCourses(data);
        }
          console.log(data);
        };
      }

      const fetchQuizzes = async (x : any) => {
        let { data, error } = await supabase
        .from('quizzes')
        .select()
        .eq('uid', x.uid)
        if (error) console.error(error)
        else {
        setQuizzes(data as any[]);
          console.log(data);
        };
      }

    React.useEffect(() => {
      const loadPage = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            console.log("user logged in! yipee!");
            getName(user.uid);
            fetchSummaries(user);
            fetchCourses(user);
            fetchQuizzes(user);
        } else { 
            setUserId('');
            router.push("/");
            console.log("No user found");
        }
    });
      return loadPage;
    }, []);


  const onSignOut = () => {
    signOut(auth).then(() => {
      console.log("successful logout!")
      router.push("/");
    }).catch((error) => {
      console.log("error logout!");
    })
  }

  const generateQuiz = async (quizContent: string) => {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    
    
    const prompt = `Please use this text to create a quiz in this format. [
      {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": "Paris"
      },
      {
        "question": "What is the capital of England?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": "London"
      },
      {
        "question": "What is the capital of Germany?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": "Berlin"
      }
    ] ${quizContent}`;
    
    const result = await model.generateContent(prompt);
    const resp = await result.response;
    const generated_quiz = await resp.text();

    
    console.log(generated_quiz);
    const cleanedQuiz = generated_quiz.replace(/`|json/g, '');
    setGeneratedQuiz(JSON.parse(cleanedQuiz));
    
    // Return the quiz so it can be used in your application
    return cleanedQuiz;
  }

  const addQuiz = async (quizTitle:string, quizContent:string, courseName:string) => {
    const generatedQuiz = await generateQuiz(quizContent);
    let { data, error } = await supabase
    .rpc('addQuiz', {
      course_name : courseName, 
      quiz_title : quizTitle, 
      quiz_content : quizContent, 
      user_id : userId,
      completed_status: false,
      quiz_questions: [generatedQuiz],
    })
    if (error) console.error(error)
    else {
    console.log(data);

  }
}

  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      onClick={() => setActive(index)}
    />
  ));


  const [activeQuizIndex, setActiveQuiz] = useState<number>();

  const quizItems = quizzes != null && quizzes.map((link, index) => {
    return <NavLink {...link} key={index} color="#d16bce" label={link.title} active={index === activeQuizIndex}
    onClick={() => setActiveQuiz(index)} rightSection={
      <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
    }/>
  })

  const [values, setValues] = useState([]);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const activeQuiz = activeQuizIndex !== undefined ? quizzes[activeQuizIndex] : null; 

  const handleValueChange = (index) => (value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const handleSubmit = () => {
    if (activeQuiz) {
      let newScore = 0;
      const quizData = JSON.parse(activeQuiz.quiz_data[0]);
      values.forEach((value, index) => {
        if (value === quizData[index].answer) {
          newScore += 1;
        }
      });
      setScore(newScore);
      setSubmitted(true);
    }
  };

  useEffect(() => {
    if (activeQuiz) {
    setValues(Array<any>(activeQuiz.quiz_data.length));
    }
  }, [activeQuiz]);

  console.log("quizzes");

  console.log(quizzes);



  


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
          { userId != null && (<p>{ "Hello, " + displayName }</p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
      <div className={classes.navbarMain}>
        <Stack justify="top" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={onSignOut} href={'/profile'} />
      </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
      <Center>

            
            <Grid style={{ minWidth : '100%'}}>
              <Grid.Col span={4}>

              <Title order={1}>Quizzes</Title>
            <br />

            <Button onClick={showModal} style={{ backgroundColor: 'rgba(209, 107, 206, 1)', color: 'white' }}>
                Add Quiz
            </Button>

            <br />

                <Modal
                opened={isModalVisible}
                onClose={handleCancel}
                title="Add Quiz"
                size="xs"
                withCloseButton
                >

                        <TextInput
                            label="Quiz Title"
                            placeholder="Enter quiz title"
                            value={quizTitle}
                            onChange={(event) => setQuizTitle(event.currentTarget.value)}
                        />
                        <br />
                        <Select
                            label="Quiz Content"
                            placeholder="Select quiz content"
                            data={summaries.map(summary => ({ value: summary.text, label: summary.title }))}
                            value={quizContent}
                            onChange={(value) => setQuizContent(value)}
                        />
                        <br />
                        <Select
                            label="Course"
                            placeholder="Select a course"
                            data={courses.map(course => ({ value: course.course_name, label: course.course_name }))}
                            value={courseName}
                            onChange={(value) => setCourseName(value)}
                        />
                        <br />
                        <Button onClick={handleOk} style={{ backgroundColor: 'rgba(209, 107, 206, 1)', color: 'white' }}>
                            Submit
                        </Button>
                </Modal>
        

            <br />
            <Paper>
                <Input placeholder="Search for quizzes" />
            </Paper>
            <br />

            {quizItems}

            </Grid.Col>
            <Grid.Col span={8}>
                <Paper>
                { quizzes != null && activeQuizIndex != null && activeQuizIndex >= 0 && (<Text style={{fontSize: '2em', fontWeight: 'bold'}}>{quizzes[activeQuizIndex].title}</Text>)}
                <br />

                <div>


                {quizzes != null && activeQuizIndex != null && quizzes[activeQuizIndex].quiz_data && JSON.parse(quizzes[activeQuizIndex].quiz_data).map((question, index) => (
                    
                    console.log("question", question),
                    console.log("index:",index),
                    <div key={index} style={{ marginBottom: '30px' }}>
                    <Text>{question.question}</Text>
                    <Radio.Group
                        value={values[index]}
                        onChange={handleValueChange(index)}
                        label="Choose an option"
                    >
                        {Array.isArray(question.options) && question.options.map(option => (
                        <Radio.Card className={classes.root} radius="md" value={option} key={option}>
                            <Group wrap="nowrap" align="flex-start">
                            <Radio.Indicator />
                            <Text>{option}</Text>
                            </Group>
                        </Radio.Card>
                        ))}
                    </Radio.Group>
                    </div>
                ))}

                </div>

                { quizzes != null && activeQuizIndex != null && <button onClick={handleSubmit}>Submit</button>}
                {submitted && <div>Your score is: {score}</div>}


                { quizzes != null && activeQuizIndex != null && activeQuizIndex >= 0 && (<ReactMarkdown>{quizzes[activeQuizIndex]?.content}</ReactMarkdown>)}

            


                        
                </Paper>
            </Grid.Col>
            </Grid>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
