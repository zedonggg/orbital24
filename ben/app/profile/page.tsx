'use client'
import firebase_app from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavLayout from "../dashboard/utils";
import { AppShell, Input } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import styles from "./page.module.css"


export default function Profile() {
    const auth = getAuth(firebase_app);
    const [userId, setUserId] = useState("");
    const router = useRouter();
    const supabase = createClient();
    const [displayName, setDisplayName] = useState("");
    const [newName, setNewName] = useState("");
    const [isEdit, setEdit] = useState(false);

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
            setNewName(data);
          }
        }
    
    }

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                console.log("user logged in! yipee!");
                getName(user.uid);
            } else { 
                console.log("No user found");
                router.push("/");           
            }
        });
    }, []);

    const setName = async (id:string, username:string) => {
        
        let { data, error } = await supabase
        .rpc('setName', {
        displayname : username, 
        user_id : id
        })
        if (error) console.error(error)
        else {setDisplayName(username); setEdit(false)}

    }

    const [error, setError] = useState('');

    const setNameOnClick = (id:string, username:string) => {
        if (username == "") {
            alert("Invalid name!");
        } else {
            setName(id, username);
        }
    }

    

    const MainDisplay = () => {
        return (<AppShell.Main>
            <h1 style={{ marginBlock: 'auto'}}>Profile</h1>
            <p><span>Name</span><br></br>{isEdit? <Input placeholder="Enter your new name" value={newName} style={{ maxWidth: '300px'}}
            onChange={(e) => setNewName(e.currentTarget.value)} autoFocus color="#d16bce"
            rightSection={<span className={styles.editBtn}style={{ display: 'flex'}}><IconPencil onClick={() => setNameOnClick(userId, newName) }/></span>} 
            rightSectionPointerEvents="all" onClick={() => setError("")}/> :
            <h3 style={{ display: 'inline'}}>{displayName}
            <span className={styles.editBtn} style={{ display: 'inline-flex', verticalAlign: 'middle', paddingLeft: '0.5rem'}}><IconPencil onClick={() => setEdit(true) }/></span></h3> }</p>
            
        </AppShell.Main>);
    }

    return <NavLayout displayName={displayName} mainContent={<MainDisplay />}
    activeIndex={2} />
    
}