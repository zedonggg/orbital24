'use client'
import firebase_app from "../firebase";
import { Button, Container, Grid, Group, PasswordInput, TextInput } from "@mantine/core";
import styles from "./page.module.css";
import { Inter } from "next/font/google";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { userAgent } from "next/server";
import { useState } from "react";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth(firebase_app);

export default function Home() {
  const router = useRouter();

  const form = useForm({
    mode: 'controlled',
    validate: {
      // email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      // password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    }
  })

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
    const onSubmit = async () => {       
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
          })
      }

  const [isClicked, setClicked] = useState(false);

  const showLogin = () => {
    setClicked(!isClicked);
  }
  return (
    <main className={styles.main}>
      <Container fluid style={{ minWidth: '70%'}}>
        <Grid>
          <Grid.Col span='auto'>
            <Container fluid className={styles.center}>
              <h1 style={{ color: 'white'}}>Say Hello to Ben</h1>
              <h3 style={{ display: 'block ', fontFamily: 'Inter, sans-serif'}}>Your all-new machine learning study assistant</h3>
              <br></br>
              <Button onClick={showLogin} size="md" style={{ transition: '400ms all ease-in-out' }}rightSection={<IconArrowRight />}variant="filled" color="rgba(209, 107, 206, 1)">Get Started</Button>
            </Container>
          </Grid.Col>
          {isClicked && (<Grid.Col className = "login" span="auto" style={{ animation: "3s infinite alternate slidein"}}>
            <form onSubmit={form.onSubmit(onSubmit)}>
              <TextInput withAsterisk label="Email" placeholder="your@email.com" key={form.key('email')}
              {...form.getInputProps('email')} onChange={(e) => setEmail(e.target.value)} />

              <PasswordInput mt="sm" withAsterisk label="Password" placeholder="Password" key={form.key('password')}
              {...form.getInputProps('password')} onChange={(e) => setPassword(e.target.value)} />

              <Group justify="center" align="center" mt="md">
                <Button type="submit" color="rgba(209, 107, 206, 1)" style={{ transition: '400ms all ease-in-out'}}>Sign Up</Button>
              </Group>

              <Link href="/" onClick={showLogin}>Already have an account? Sign-in</Link>
            </form>
          </Grid.Col>)}
        </Grid>
      </Container>
      
      {/* <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore starter templates for Next.js.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div> */}
    </main>
  );
}
