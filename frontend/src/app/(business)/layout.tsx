import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ".././globals.css";
import { ThemeProvider } from ".././theme-provider";
import Toolbar from "./toolbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Widget App",
  description: "Spotify OBS Source",
};

export default function businessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/Disc.ico"/>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          <Toolbar />
          {children}
        </ThemeProvider>
        
      </body>
    </html>
  );
}
