'use client'

import { Button } from '@/components/ui/button';
import 'dotenv/config';
import { Banana, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {

  const router = useRouter();
  const redirectUri = 'http://localhost:3001/callback';
  const authUrl = new URL("https://accounts.spotify.com/authorize?")
  const client_id = 'f2df842d1adc42c9b173d709cda23909'


  
  function ping_server() {
  }



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button onClick={() => {router.push('/login')}}>
            <LogIn /> Login
          </Button>
          <Button onClick={() => {router.push('/register')}}>
            <Banana /> Register
          </Button>
        </div>

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
