'use client'
import firebase_app from '../firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AppShell, Burger, Group, Skeleton, Center, Tooltip
    , UnstyledButton, Stack, rem, Card, Text, SimpleGrid
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
  } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContext';
import { createClient } from '@/utils/supabase/client';

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

const testdata = [
    { name: 'subject1', progress: 80 },
    { name: 'subject2', progress: 69 },
    { name: 'subject3', progress: 70 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
    { name: 'subject4', progress: 55 },
]

export default function Dashboard() {
  const auth = getAuth(firebase_app);
  const {user}:any = useAuthContext();
  const router = useRouter();
  const [curUser, setUser] = useState(null);
  let userObj : any = null;
  const supabase = createClient();
  let user_id : string = "null";
  const uidd : string = "abcedfg"

  const supaQuery = async () => {
    let { data, error } = await supabase
  .rpc('onLoginSignup', {
    user_id : user.uid
  })
  if (error) console.error(error)
  else console.log(data)
  
  }
  

  React.useEffect(() => {
    if (user == null) {
      router.push("/");
      console.log("not logged in");
    } else {
      // userObj = user;
      setUser(user);
      console.log(user);
      user_id = user.id;
      supaQuery();
    }
  }, [user]);

  

  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     setEmail(user.email)
  //     console.log(user.email);
  //   }
  // })





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
      onClick={() => setActive(index)}
    />
  ));

  const cards = testdata.map((x, index) => (
    <Card {...x}
        padding={'xl'}
    >
        <Card.Section h={160} style={{ backgroundColor: 'white'}}>
        </Card.Section>

        <Text fw={500} size='lg' mt='md'>
            {x.name}
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
          { user != null && (<p>{ "Hello, " + user.uid }</p>)}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {/* Navbar
        {Array(15)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))} */}
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
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3}}>
            {cards}
        </SimpleGrid>
      </AppShell.Main>
    </AppShell>
  );
}