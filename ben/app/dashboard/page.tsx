'use client'
import firebase_app from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid
 } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useEffect, useState } from 'react';
import classes from './page.module.css';
import {
    IconHome2,
    IconGauge,
    IconUser,
    IconSettings,
    IconLogout,
    IconNotebook
  } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

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
  { icon: IconGauge, label: 'Dashboard', href: '/dashboard', active: true},
  { icon: IconNotebook, label: 'Quizzes', href: '/quiz', active: false},
  { icon: IconUser, label: 'Account', href: '/profile', active: false},
  { icon: IconSettings, label: 'Settings', href: '/dashboard', active: false},
];

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
      if (data.length == 0) {
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

  // React.useEffect(() => {
  //   if (user == null) {
  //     router.push("/");
  //     console.log("not logged in");
  //   } else {
  //     // userObj = user;
  //     setUser(user);
  //     console.log(user);
  //     user_id = user.id;
  //     supaQuery();
  //     fetchCourses(user);
  //   }
  // }, [user]);

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

  const colorWheel = ['#FAD6A6', '#590FB7', '#9055FF', '#13E2DA', '#D6FF7F', '#30BE96']

  const randomColor = (x: string[]) => {
    const n = x.length;
    const randNum = Math.floor(Math.random() * n);
    return x[randNum];
  }
  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {setActive(index)}}
    />
  ));

  const cards = courses != null && courses.map((x, index) => (
    <Card {...x}
        padding={'md'}
        key={index}
    >
        <Card.Section h={160} style={{ backgroundColor: `${x.course_color}`}}>
        </Card.Section>

        <Text fw={500} size='lg' mt='md'>
            <Link href={`/dashboard/${x.course_id}`}>{x.course_name}</Link>
        </Text>
    </Card>
  ));
  

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
          {(<p>{ "Hello, " + displayName }</p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
      <div className={classes.navbarMain}>
        <Stack justify="top" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink active={false} icon={IconLogout} label="Logout" onClick={onSignOut} href={'/profile'} />
      </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3}}>
            {cards}
            <Card
        padding={'md'}
    >
        <Card.Section h={160}>
          <Skeleton visible={true} h={160}></Skeleton>
        </Card.Section>

        <Text fw={500} size='lg' mt='md'>
            <Link href="/dashboard/addcourse">Add a new course</Link>
        </Text>
    </Card>
        </SimpleGrid>
      </AppShell.Main>
    </AppShell>
  );
}