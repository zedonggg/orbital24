'use client'
import firebase_app from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Center, Input, Stack, Button } from "@mantine/core";
import styles from "./page.module.css";

export default function OnBoarding() {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const getName = async (x:string) => {
        
        let { data, error } = await supabase
        .rpc('fetchDisplayName', {
        user_id : x
        })
        if (error) console.error(error)
        else return data

    }

    const setName = async (id:string, username:string) => {
        
        let { data, error } = await supabase
        .rpc('setName', {
        displayname : username, 
        user_id : id
        })
        if (error) console.error(error)
        else router.push('/dashboard');

    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserId(user.uid);
            console.log("user logged in! yipee!");
            const display_name = await getName(user.uid);
            if (display_name.length != 0) {
                router.push("/dashboard");
            }
        } else { 
            router.push("/");
            console.log("Not logged in");
        }
    });

    const [displayName, setDisplayName] = useState('');

    const setNameOnClick = (id:string, username:string) => {
        if (username == "") {
            alert("Invalid name!");
        } else {
            setName(id, username);
        }
    }

    return (<>
        <Center h={100} style={{ minHeight: "100vh"}}>
            <Stack align="center" justify="center" gap="xs" className={styles.introstack}>
            <h1 id={styles.hello}>Hello!</h1>
            <h1 id={styles.question}>What&apos;s your name?</h1>
            <Input 
            className={styles.namebox} 
            variant="filled" 
            size="md" placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.currentTarget.value)}/>
            <Button
                variant="gradient"
                gradient={{ from: 'violet', to: '#d16bce', deg: 104 }}
                mt="md"
                className={styles.gobtn}
                onClick={() => setNameOnClick(userId, displayName)}
            >
                Let&apos;s go!
            </Button>
            </Stack>
        </Center>
    </>);

}