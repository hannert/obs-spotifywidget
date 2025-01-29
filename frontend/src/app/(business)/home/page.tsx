'use client'

import { spotifyDataStore, userDataStore } from '@/app/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import 'dotenv/config';
import { Banana, Copy, Pencil, RotateCw, Save } from 'lucide-react';
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
  const [originURL, setOriginURL] = useState('Error');
  const [secretLinkText, setSecretLinkText] = useState('');
  const refreshAuthTokenAction = userDataStore((state) => state.refresh)
  const getClientsAction = spotifyDataStore((state) => state.getClients);
  const saveClientIDAction = spotifyDataStore((state) => state.saveClientID)
  const saveClientSecretAction = spotifyDataStore((state) => state.saveClientSecret)
  const getLinkSecretsAction = spotifyDataStore((state) => state.getLinkSecret)
  const regenerateSecretAction = spotifyDataStore((state) => state.regenerateSecret)

  useEffect(() => {
    // First we can check the isLoggedIn localstorage flag
    let isLoggedIn = localStorage.getItem('IsLoggedIn');
    if (isLoggedIn !== 'true') {

    }

    setOriginURL(window.location.origin);

    // Fetch client id and secret
    startHelper()
  }, [])

  async function refreshHelper(callback: any) {
    const refreshResponse = await refreshAuthTokenAction();
    console.log(refreshResponse)
    if (refreshResponse.status === 200) {
      callback();
    }
    if (refreshResponse.status === 401) {
      router.push('/')
    }
  }

  async function startHelper() {



    const clientResponse = await getClientsAction();
    console.log(clientResponse)
    if (clientResponse.status === 200) {
      if (clientResponse.data.Client_ID !== null) {
        setClientIDText(clientResponse.data.Client_ID);
      }
      if (clientResponse.data.Client_Secret !== null) {
        setClientSecretText(clientResponse.data.Client_Secret);
      }
    }
    if (clientResponse.status === 401) {
      //refreshHelper()
    }

    const secretResponse = await getLinkSecretsAction();
    console.log(secretResponse)
    if (secretResponse.status === 200) {
      if (secretResponse.data.App_Secret !== null) {
        setSecretLinkText(secretResponse.data.App_Secret);
      }
    }
  }

  function toastErrorHelper(message: string) {
    toast({variant: 'destructive', title: 'Uh oh! Something went wrong.', description: message});
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
    } else {
      toastErrorHelper('There was a problem saving your ID.')
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

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {

    }
  }

  const handleRegenerate = async () => {
    const response = await regenerateSecretAction();
    console.log(response)
    if (response.status === 200) {
      setSecretLinkText(response.data.secret);
      toast({title: 'User Secret 🔐✅', description: 'Successfully regenerated.'});
    } else {
      toast({variant: 'destructive', title: 'Uh oh! Something went wrong.', description: 'There was a problem regenerating your secret.'});
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(originURL + '/spotify?secret=' + secretLinkText);
    toast({title: 'Link copied', description: 'Link successfully copied to clipboard.'});
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
                  (clientIDChanged === true) && 
                  <Button onClick={handleSaveID}>
                    <Save />
                  </Button>
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
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              href={'https://accounts.spotify.com/authorize?' +
                new URLSearchParams({
                  response_type: 'code',
                  client_id: clientIDText as string,
                  scope: 'user-read-currently-playing',
                  redirect_uri: redirectUri,
                }).toString()}
              target='_blank'
            >
              Authorize application
            </a>

          </div>

          <div className='flex flex-col gap-4'>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={(clientIDText === '' || clientSecretText === '')}>
                  <Banana /> Get secret link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>This is your secret link.</DialogTitle>
                  <DialogDescription>
                    Copy and paste this into a browser source on OBS
                  </DialogDescription>
                </DialogHeader>
                <div className='flex justify-between'>
                  <code className="whitespace-nowrap text-xs ">
                    {originURL + '/spotify?secret=' + secretLinkText}
                  </code>
                  <Button onClick={handleCopyLink}>
                    <Copy />
                  </Button>
                </div>
              </DialogContent>
         
            </Dialog>

            <Separator orientation='horizontal'/>
            <Button onClick={handleRegenerate}>
              <RotateCw /> Regenerate secret
            </Button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
