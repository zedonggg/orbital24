'use client'
require('dotenv').config();
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
import { uuid } from 'uuidv4';
import { useEffect } from 'react';

export default function Upload() {

    type FileObject = {
        name: string;
      };

    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const [media, setMedia] = useState<FileObject[]>([]);
    const router = useRouter();
    const supabase = createClient();
    const [responsetext, setResponsetext] = useState('');
      

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

    async function uploadImage(e:any) {
        let file = e.target.files[0];
    
    
        const { data, error } = await supabase
            .storage
            .from('courseMedia')
            .upload(userId + "/" + uuid(), file)
            console.log('yipee! uploaded!');
    
        if (data) {
            getMedia();
    
        } else {
            console.log(error);
        }
        }
    
    async function getMedia() {

    const { data, error } = await supabase.storage.from('courseMedia').list(userId + '/', {
        limit: 10,
        offset: 0,
        sortBy: {
        column: 'name', order:
            'asc'
        }
    });

    if (data) {
        setMedia(data);
    } else {
        console.log(71, error);
    }
    }

    React.useEffect(() => {
        getMedia();
        console.log('media', media);
    } , [userId])

    // gen-ai


    useEffect(() => {
        async function run() {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
            const prompt = "Say hi to me."
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();
            console.log(text);
            setResponsetext(text);
        }
        
        run();
      }, []);

    
    return (
        <>
            <div className='mt-5'>
                {userId != '' && (<p> {userId} </p>)} 

                <input type="file" onChange={(e) => uploadImage(e)} />
                    <div className='mt-5'>
                    My Uploads
                    </div>

                    {media.map((media) => {
                    return (<>
                        <div>
                        <img src={`https://cvumoldykbzywcazohmd.supabase.co/storage/v1/object/public/courseMedia/${userId}/${media.name}`} />
                        </div>
                    </>
                    )
                    })}
                
                {responsetext}

            </div>
        </>
    )
}