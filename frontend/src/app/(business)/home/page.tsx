'use client'

import { spotifyDataStore } from '@/app/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import 'dotenv/config';
import { Banana, Pencil, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Home() {

  const router = useRouter();
  const { toast } = useToast();
  const clientIDRef = React.useRef(null)
  const redirectUri = 'http://localhost:3001/callback';
  const authUrl = new URL("https://accounts.spotify.com/authorize?");
  const [clientIDText, setClientIDText] = useState('');
  const [clientIDChanged, setClientIDChanged] = useState(false);
  const [clientSecretText, setClientSecretText] = useState('');
  const [secretVis, setSecretVis] = useState(false);
  const getClientsAction = spotifyDataStore((state) => state.getClients);
  const saveClientIDAction = spotifyDataStore((state) => state.saveClientID)
  const saveClientSecretAction = spotifyDataStore((state) => state.saveClientSecret)
  const getLinkSecretsAction = spotifyDataStore((state) => state.getLinkSecret)

  useEffect(() => {
    // First we can check the isLoggedIn localstorage flag
    let isLoggedIn = localStorage.getItem('IsLoggedIn');
    if (isLoggedIn !== 'true') {

    }      
    // Fetch client id and secret
      startHelper()
  }, [])

  async function startHelper() {
    const responseCode = await getClientsAction();
    console.log(responseCode)
    if (responseCode !== null) {
      if (responseCode.Client_ID !== null) {
        setClientIDText(responseCode.Client_ID);
      }
      if (responseCode.Client_Secret !== null) {
        setClientSecretText(responseCode.Client_Secret);
      }    
    }
  }

  function setText(func: Function, e: any) {
  }

  const handleClientID = (e: any) => {
    e.preventDefault();
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setClientIDText(newText);
      setClientIDChanged(true);
    }
  }

  const handleSaveID = async () => {
    const response = await saveClientIDAction(clientIDText);
    if (response === 200) {
      setClientIDChanged(false);
      toast({title: 'Client ID ✅', description: 'Successfully saved.'});  
    }
  }

  const handleClientSecret = (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setClientSecretText(newText);
    }
  }
  const handleSaveSecret = async () => {
    const response = await saveClientSecretAction(clientIDText);
    if (response === 200) {
      toggleSecretVis(null);
      toast({title: 'Client Secret 🔐✅', description: 'Successfully saved.'});
    } else {
      toast({variant: 'destructive', title: 'Uh oh! Something went wrong.', description: 'There was a problem saving your secret.'});

    }
  }

  const toggleSecretVis = (e: any) => {
    if (e === Event) {
      e.preventDefault();
    }
    
    setSecretVis(!secretVis);
  }


  const client_id = 'f2df842d1adc42c9b173d709cda23909'

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {

    }
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center justify-center gap-y-8">
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <div>
              <Label>Client ID</Label>
              <div className="flex w-full items-center space-x-2">
                <Input 
                  onKeyDown={handleKeyDown} 
                  value={clientIDText}
                  onChange={handleClientID}
                  ref={clientIDRef}
                >
                </Input>
                {
                  (clientIDChanged === true) ?
                    <Button onClick={handleSaveID}>
                      <Save />
                    </Button>
                    :
                    <></>           
                }

              </div>
              <br/>
              <Label>Client Secret</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  onKeyDown={handleKeyDown} 
                  value={clientSecretText}
                  onChange={handleClientSecret}
                  disabled={!secretVis}
                  type={!secretVis ? 'password' : ''}
                >
                </Input>
                
                <Button onClick={secretVis ? handleSaveSecret : toggleSecretVis}>
                  {secretVis ? 
                    <Save />
                    :
                    <Pencil />
                  }
                </Button>
              </div>
            </div>
                  <Button>
                    Test
                  </Button>

            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              href={'https://accounts.spotify.com/authorize?' +
                new URLSearchParams({
                  response_type: 'code',
                  client_id: client_id as string,
                  redirect_uri: redirectUri,
                }).toString()}
              target='_blank'
            >
              Authorize application
            </a>

          </div>

          <div>
            <Button disabled={(clientIDText === '' || clientSecretText === '')}>
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
