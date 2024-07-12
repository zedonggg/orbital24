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



export default function NavLayout({ mainContent, displayName, activeIndex} : { 
    displayName: string, mainContent: any, activeIndex: number}) {
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
        
        const [active, setActive] = useState(activeIndex);
        
        const links = mockdata.map((link, index) => (
            <NavbarLink
              {...link}
              key={link.label}
              active={index === active}
              onClick={() => {setActive(index)}}
            />
        ));
        
        const auth = getAuth(firebase_app);
        const router = useRouter();
        
        const onSignOut = () => {
            signOut(auth).then(() => {
              console.log("successful logout!")
              router.push("/");
            }).catch((error) => {
              console.log("error logout!");
            })
          }
        
        const [opened, { toggle }] = useDisclosure();

        return (
            <AppShell
              header={{ height: 60 }}
              navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
              padding="md"
            >
              <AppShell.Header>
                <Group h="100%" px="md">
                  <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
                <NavbarLink active={false} icon={IconLogout} label="Logout" onClick={onSignOut} href='#' />
              </Stack>
              </AppShell.Navbar>
              { mainContent }
            </AppShell> )
    }