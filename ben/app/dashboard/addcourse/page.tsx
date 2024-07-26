'use client'
import firebase_app from '../../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid,
    TextInput,
    Paper,
    ColorPicker
 } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlt } from '@tabler/icons-react';
import React, { useState } from 'react';
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
    IconNotebook
  } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useForm } from '@mantine/form';
import { Button } from '@mantine/core';

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

export default function AddCourse() {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            console.log("user logged in! yipee!");
        } else { 
            setUserId('');
            router.push("/");
            console.log("No user found");
        }
    });

    const addNewCourse = async (x:any) => {    
      if (x.name.length > 0) { 
        let { data, error } = await supabase
        .rpc('addNewCourse', {
        coursecolor: defaultcolor, 
        coursename: x.name, 
        user_id: userId
        })
        if (error) console.error(error)
        else {
            console.log('success');
            router.push('/dashboard')
        } } else {}


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

  const courseForm = useForm({
    mode:'uncontrolled',
    initialValues: {
        name: ''
    }
  })

  const [defaultcolor, changeColor] = useState('ffffff');

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header style={{ border: "none"}}>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          {/* <IconAlt size={30} /> */}
          { userId != null && (<p>{ "Hello, " + userId }</p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" style={{ border: 'none'}}>
      <div className={classes.navbarMain}>
        <Stack justify="top" gap={0}>
          {links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        <NavbarLink icon={IconLogout} label="Logout" onClick={onSignOut} href={'#'} active={false} />
      </Stack>
      </AppShell.Navbar>
      <AppShell.Main style={{ background: "#3B3B3B"}}>
        <Center>
          <Paper style={{ padding: '30px', background: '#2E2E2E'}}>
            <h2 style={{ marginTop: "0"}}>Add a new course</h2>
            <form onSubmit={courseForm.onSubmit((val) => addNewCourse(val))}>
                <TextInput size='md'
                    label="Course Name"
                    key={courseForm.key('name')}
                    {...courseForm.getInputProps('name')}
                />
                <ColorPicker mt="md" value={defaultcolor} onChange={changeColor}
                swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']} />
                <Button justify="center" mt="md" type="submit" color="rgba(209, 107, 206, 1)" style={{ transition: '400ms all ease-in-out'}}>
                    Add Course
                </Button>
            </form>
            </Paper>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}