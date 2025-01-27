'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import 'dotenv/config';
import { Banana, Pencil, Save } from 'lucide-react';
import { useState } from 'react';

export default function Home() {

  const redirectUri = 'http://localhost:3001/callback';
  const authUrl = new URL("https://accounts.spotify.com/authorize?")
  const [secretVis, setSecretVis] = useState(false)
  const toggleSecretVis = (e: any) => {
    e.preventDefault();
    setSecretVis(!secretVis);
  }


  const client_id = 'f2df842d1adc42c9b173d709cda23909'

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {

    }
  }
  
  function ping_server() {
  }



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center justify-center gap-y-8">
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <div>
              <Label>Client ID</Label>
              <div className="flex w-full items-center space-x-2">
                <Input onKeyDown={handleKeyDown}></Input>
                <Button>
                  <Save />
                </Button>
              </div>
              <br/>
              <Label>Client Secret</Label>
              <div className="flex w-full items-center space-x-2">
                {secretVis ?
                  <Input></Input>
                  :
                  <Input disabled type="password"></Input>
                }
                
                <Button onClick={toggleSecretVis}>
                  {secretVis ? 
                    <Save />
                    :
                    <Pencil />
                  }
                </Button>
              </div>
            </div>

            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              href={'https://accounts.spotify.com/authorize?' +
                new URLSearchParams({
                  response_type: 'code',
                  client_id: client_id as string,
                  redirect_uri: redirectUri,
                }).toString()}
              target='_blank'
              onClick={ping_server}
            >
              Authorize application
            </a>

          </div>

          <div>
            <Button>
              <Banana /> Get secret link
            </Button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
