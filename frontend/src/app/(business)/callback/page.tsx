'use client'
import { userDataStore } from '@/app/store/store';
import { toast } from '@/hooks/use-toast';
import 'dotenv/config';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const refreshAuthTokenAction = userDataStore((state) => state.refresh);
  const [text, setText] = useState('');

  useEffect(() => {
    linkApplicationHelper();
  })

  async function linkApplicationHelper () {
    if (code !== null) {
      // save to database
      try {
        console.log(backendURL + '/callback?code=' + code)
        const response = await fetch(backendURL + '/callback?code=' + code, {
          credentials: 'include'
        });

        if (response.status === 401) {
          await refreshAuthTokenAction();

          const secondResponse = await fetch(backendURL + '/callback?code=' + code, {
            credentials: 'include'
          });

          if (secondResponse.status === 200) {
            setText('✅ Success! Closing window automatically in 5 seconds...')
            toast({title: '✔ Success!', description: 'Successfully linked apps.'});
            setTimeout(()=>{window.close()}, 5000);
            return
          }
        }

        if (response.status === 200) {
          setText('✅ Success! Closing window automatically in 5 seconds...');
          toast({title: '✔ Success!', description: 'Successfully linked apps.'});
          setTimeout(()=>{window.close()}, 5000);
          return
        }

      } catch (error) {
        console.log(error);
        setText('❌ Error! Please try again from the main page.');
        toast({title: 'X Error!', description: 'An error occured while trying to link apps.'});
        return
      }
      setText('❌ Error! Please try again from the main page.');
      toast({title: 'X Error!', description: 'An error occured while trying to link apps.'});
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      CALLBACK
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col">
          <p>Linking application . . .</p><br/>
          {text}
        </div>
      </main>
    </div>
  );
}
