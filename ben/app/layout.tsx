import type { Metadata } from "next";
import firebase from "firebase/compat/app";
import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css'
import { AuthContextProvider } from './context/AuthContext' 
import '@mantine/dropzone/styles.css';
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ben",
  description: "Machine Learning Study Assistant",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}><MantineProvider theme={{ fontFamily: 'Inter, sans-serif'}}
       defaultColorScheme="dark"><AuthContextProvider>{children}</AuthContextProvider></MantineProvider></body>
    </html>
  );
}
