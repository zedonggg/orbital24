'use client'
import firebase_app from "./firebase"
import { Button, Container, Grid, Group, PasswordInput, Stack, TextInput } from "@mantine/core";
import styles from "./page.module.css";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

const auth = getAuth(firebase_app);

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("user already logged in");
        router.push("/dashboard")
    } else { 
        console.log("not logged in");
    }
  })

  const form = useForm({
    mode: 'controlled'
  })

  const onLogin = () => {
    form.clearErrors();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("dfsdfsdfsdf");
        console.log(user);
        router.push('/dashboard');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        if (errorCode == "auth/invalid-credential") {
          form.setFieldError('email', "Invalid email or password.");
        } else if (errorCode == "auth/network-request-failed") {
          form.setFieldError('email', "Network error. Check your internet connection");
        } else {
          form.setFieldError('email', "An unknown error has occured. Refresh or try again later.");
        }
      });
  }

  const onSignup = async () => {     
    form.clearErrors();  
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
          return router.push("/dashboard")
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode, errorMessage);
          if (errorCode == "auth/weak-password") {
            form.setFieldError('password', "Invalid password. Password must be at least 6 characters");
          } else if (errorCode == "auth/email-already-in-use") {
            form.setFieldError('email', "Email already exists");
          } else if (errorCode == "auth/invalid-email")  {
            form.setFieldError('email', "Invalid email");
          } else if (errorCode == "auth/network-request-failed") {
            form.setFieldError('email', "Network error. Check your internet connection.");
          } else {
            form.setFieldError('email', "An unknown error has occured. Refresh or try again later.");
          }
      })
  }

  const [isClicked, setClicked] = useState(false);

  const [isLoginDisplay, setLoginDisplay] = useState(true);

  const showLogin = () => { setClicked(!isClicked); }

  function loginForm() {
    return (<><h3 id={styles.loginText}>Login</h3><form onSubmit={form.onSubmit(onLogin)}>
    <TextInput className={styles.formInput} withAsterisk label="Email" placeholder="your@email.com" key={form.key('email')}
    {...form.getInputProps('email')} onChange={(e) => setEmail(e.target.value)} onClick={() => form.clearErrors()}/>

    <PasswordInput className={styles.formInput} mt="sm" withAsterisk label="Password" placeholder="Password" key={form.key('password')}
    {...form.getInputProps('password')} onChange={(e) => setPassword(e.target.value)} onClick={() => form.clearErrors()}/>

    <Stack justify="center" align="center" mt="md" gap="xs">
      <Button type="submit" color="rgba(209, 107, 206, 1)" style={{ transition: '400ms all ease-in-out'}}>Login</Button>
      <Link href="#" onClick={() => {setLoginDisplay(false); form.clearErrors()}} style={{ textDecoration: 'none', color: '#c9c9c9'}}>No account? <span style={{ color: '#d16bce'}}>Sign Up</span></Link>
    </Stack>

  </form></>);
  }

  function signupForm() {
    return (<><h3 id={styles.loginText}>Sign Up</h3><form onSubmit={form.onSubmit(onSignup)}>
    <TextInput className={styles.formInput} withAsterisk label="Email" placeholder="your@email.com" key={form.key('email')}
    {...form.getInputProps('email')} onChange={(e) => setEmail(e.target.value)} onClick={() => form.clearErrors()}/>

    <PasswordInput className={styles.formInput} mt="sm" withAsterisk label="Password" placeholder="Password" key={form.key('password')}
    {...form.getInputProps('password')} onChange={(e) => setPassword(e.target.value)} onClick={() => form.clearErrors()}/>

    <Stack justify="center" align="center" mt="md" gap="xs">
      <Button type="submit" color="rgba(209, 107, 206, 1)" style={{ transition: '400ms all ease-in-out'}}>Sign Up</Button>
      <Link href="#" onClick={() => {setLoginDisplay(true); form.clearErrors()}} style={{ textDecoration: 'none', color: '#c9c9c9'}}>Already have an account? <span style={{ color: '#d16bce'}}>Sign-in</span></Link>
    </Stack>

  </form></>)
  }

  return (
    <main className={styles.main} id="warp-bg">
      <Container fluid style={{ minWidth: '100%'}}>
        <Grid className="row-transition" style={{ transition: 'all 1s ease'}}>

          <Grid.Col className={styles.center}span={isClicked? 6 : 11} style={{ transition: 'all 1s ease', transform: !isClicked? 'translateX(5%)': ''}}>
              <h1 style={{ color: 'white'}}>Say Hello to <span>Ben</span></h1>
              <h3 style={{ display: 'block ', fontFamily: 'Inter, sans-serif'}}>Your all-new machine learning study assistant</h3>
              <br></br>
              <Button className={styles.landingbtn} onClick={showLogin} size="md" style={{ transition: '400ms all ease-in-out' }} rightSection={<div className={styles.rightside}><IconArrowRight /></div>}variant="gradient"
      gradient={{ from: 'violet', to: '#d16bce', deg: 85 }}>Get Started</Button>
          </Grid.Col>

          <Grid.Col className = {`login col-item ${isClicked? 'visible' : ''}`} span={isClicked? 6 : 1} style={{ transition: 'all 1s ease', transform: !isClicked? 'translateX(200%)' : ''}}>
            { isLoginDisplay? loginForm() : signupForm() }
          </Grid.Col>
        </Grid>
      </Container>
    </main>
  );
}
