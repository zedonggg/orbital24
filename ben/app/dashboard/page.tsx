'use client'
import firebase_app from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid
 } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react';
import classes from './page.module.css';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import NavLayout from './utils';
import styles from './page.module.css'

export default function Dashboard() {
  const auth = getAuth(firebase_app);
  const router = useRouter();
  const [curUser, setUser] = useState("");
  const [displayName, setDisplayName] = useState("");
  const supabase = createClient();
  const [courses, setCourses] = useState<any[] | null>();

  const supaQuery = async (x:string) => {

      let { data, error } = await supabase
    .rpc('onLoginSignup', {
      user_id : x
    })
    if (error) console.error(error)
    else console.log(data)
  
  }

  const fetchCourses = async (x : string) => {
    
    let { data, error } = await supabase
    .from('courses')
    .select()
    .eq('uid', x)
    if (error) console.error(error)
    else {
      setCourses(data);
      console.log(data);
    };

  }

  const getName = async (x:string) => {
        
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

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        getName(user.uid);
        setUser(user.uid);
        console.log("user logged in! yipee!");
        supaQuery(user.uid);
        fetchCourses(user.uid);
      } else { 
          console.log("No user found");
          router.push("/"); 
      }
  });
  }, []);

  const cards = courses != null && courses.map((x, index) => (
    <Card {...x}
        padding={'md'}
        key={index}
        shadow='sm'
        className={styles.contentcard}
        bg="#2E2E2E"
    >
        <Card.Section h={160} style={{ backgroundColor: `${x.course_color}`}}>
        </Card.Section>

        <Text fw={500} size='lg' mt='md'>
            <Link href={`/dashboard/${x.course_id}`} color={x.course_color}>{x.course_name}</Link>
        </Text>
    </Card>
  ));

  const numCourses = `You have ${cards ? cards.length : 'no'} ${cards ? cards.length == 1 ? 'course' : 'courses' : 'courses'}`;

  const MainLayout = () => {
    return (<AppShell.Main style={{ background: "#3B3B3B"}}>
      <h2 style={{ margin: 'auto'}}>{numCourses}</h2>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3}} mt="md">
            {cards}
            <Card
        padding={'md'}
        shadow='sm'
        className={styles.contentcard}
        bg="#2E2E2E"
    >
        <Card.Section h={160}>
          <Skeleton visible={true} h={160}></Skeleton>
        </Card.Section>

        <Text fw={500} size='lg' mt='md'>
            <Link href="/dashboard/addcourse">Add a new course</Link>
        </Text>
    </Card>
        </SimpleGrid>
      </AppShell.Main>)
  }
  
  return (
    <NavLayout displayName={displayName} mainContent={<MainLayout />}
    activeIndex={0} />     
  );
}