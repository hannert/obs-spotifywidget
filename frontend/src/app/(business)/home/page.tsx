'use client'

import { userDataStore } from '@/app/store';
import { protectedDataStore } from '@/app/store/auth-store';
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

  // region Protected
  const clientID = protectedDataStore((state) => state.clientID)
  const setClientIDAction = protectedDataStore((state) => state.setClientID)
  const clientSecret = protectedDataStore((state) => state.clientSecret)
  const setClientSecretAction = protectedDataStore((state) => state.setClientSecret)
  const refreshAuthTokenAction = userDataStore((state) => state.refresh)


  // Trigger save button to show when the client ID is changed
  const [clientIDChanged, setClientIDChanged] = useState(false);
  const [secretVis, setSecretVis] = useState(false);
  const [originURL, setOriginURL] = useState('Error');
  const linkSecret = protectedDataStore((state) => state.linkSecret);

  // region Store Actions
  const getClientsAction = protectedDataStore((state) => state.getClients);
  const saveClientIDAction = protectedDataStore((state) => state.saveClientID)
  const saveClientSecretAction = protectedDataStore((state) => state.saveClientSecret)
  const getLinkSecretsAction = protectedDataStore((state) => state.getLinkSecret)
  const regenerateSecretAction = protectedDataStore((state) => state.regenerateSecret)

  useEffect(() => {
    // First we can check the isLoggedIn localstorage flag
    let isLoggedIn = localStorage.getItem('IsLoggedIn');
    if (isLoggedIn !== 'true') {

    }

    setOriginURL(window.location.origin);

    // Fetch client id and secret
    startHelper()
  }, [])

  // region Protected Resources
  /**
   * A wrapper function that calls the supplied function and tries again if 401 code is returned after attempted refresh of tokens. Pushes to home page if all attempts fail.
   * @param fn 
   */
  async function protectedWrapper(fn: any) {
    // Try the original function first
    const firstTryResponse = await fn();
    //console.log('first try', firstTryResponse.status)

    if (firstTryResponse.status === 200) {
      toast({title: 'Success!', description: firstTryResponse.message});  
    }

    // Unauthorized / Token has expired
    if (firstTryResponse.status === 401) {
      // Try to refresh
      //console.log('Trying to refresh')
      const refreshResponse = await refreshAuthTokenAction()

      const secondTryResponse = await fn();

      //console.log('second', secondTryResponse)
      if (secondTryResponse.status === 200) {
        toast({title: 'Success!', description: secondTryResponse.message});
      }

      if (secondTryResponse.status === 401) {
        toastErrorHelper('Unauthorized.')
        router.push('/')
      }
    }
  }

  // Helper function to call async functions within page load useEffect
  async function startHelper() {
    await protectedWrapper(getClientsAction);
    await protectedWrapper(getLinkSecretsAction);
  }

  // Shows an error popup with the supplied message
  function toastErrorHelper(message: string) {
    toast({variant: 'destructive', title: 'Uh oh! Something went wrong.', description: message});
  }

  // Save Client ID
  const handleSaveID = async () => {
    const response = await saveClientIDAction(clientID);
    if (response.status === 200) {
      setClientIDChanged(false);
    }
    return response
  }

  // Save Client Secret
  const handleSaveSecret = async () => {
    const response = await saveClientSecretAction(clientSecret);
    if (response.status === 200) {
      toggleSecretVis(null);
    }
    return response
  }
  
  // Regenerate the account's secret (Link to spotify player)
  const handleRegenerate = async () => {
    const response = await regenerateSecretAction();
    if (response.status === 200) {
      //setSecretLinkText(response.data.secret);
      toast({title: 'User Secret 🔐✅', description: 'Successfully regenerated.'});
    } else {
      toast({variant: 'destructive', title: 'Uh oh! Something went wrong.', description: 'There was a problem regenerating your secret.'});
    }
    return response
  }

  // region Controlled Input Handler
  // handle client id text input
  const handleClientID = (e: any) => {
    e.preventDefault();
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setClientIDChanged(true);
      setClientIDAction(newText)
    }
  }

  // Toggle secret visibility and editing
  const toggleSecretVis = (e: any) => {
    if (e === Event) {
      e.preventDefault();
    }
    setSecretVis(!secretVis);
  }

  // Handle client secret text input 
  const handleClientSecret = (e: any) => {
    let newText = (e.target as HTMLInputElement).value;
    if (newText !== null){
      setClientSecretAction(newText);
    }
  }
  

  // TODO: Allow keyboard input to save resources
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {

    }
  }



  const handleCopyLink = () => {
    navigator.clipboard.writeText(originURL + '/spotify?secret=' + linkSecret);
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
                  value={clientID}
                  onChange={handleClientID}
                  ref={clientIDRef}
                >
                </Input>
                {
                  (clientIDChanged === true) && 
                  <Button onClick={() => {protectedWrapper(handleSaveID)}}>
                    <Save />
                  </Button>
                }

              </div>
              <br/>
              <Label>Client Secret</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  onKeyDown={handleKeyDown} 
                  value={clientSecret}
                  onChange={handleClientSecret}
                  disabled={!secretVis}
                  type={!secretVis ? 'password' : ''}
                >
                </Input>
                
                <Button onClick={secretVis ? () => {protectedWrapper(handleSaveSecret)} : toggleSecretVis}>
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
                  client_id: clientID as string,
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
                <Button disabled={(clientID === '' || clientSecret === '')}>
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
                    {originURL + '/spotify?secret=' + linkSecret}
                  </code>
                  <Button onClick={handleCopyLink}>
                    <Copy />
                  </Button>
                </div>
              </DialogContent>
         
            </Dialog>

            <Separator orientation='horizontal'/>
            <Button onClick={() => protectedWrapper(handleRegenerate)}>
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
