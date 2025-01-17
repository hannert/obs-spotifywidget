'use client'

import dotenv from 'dotenv';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { songDataStore } from '../store';

export default function Home() {
  dotenv.config({ path: '.env' });
  const router = useRouter();

  const redirectUri = 'http://localhost:3000/callback';

  const currentSong = songDataStore((state) => state.currentSong);
  const setSong = songDataStore((state) => state.setSong);

  const searchParams = useSearchParams();
  const refresh = searchParams.get('refresh')

  let songData: any = {}

  useEffect(() => {
    getRefreshToken();
    //let awesome = setInterval(getSong, 1000)
  }, [])



  const getRefreshToken = async () => {

    // refresh token that has been previously stored
    const refreshToken = refresh
    console.log(refreshToken)
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + (Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')),
       },
       body: new URLSearchParams({
         'grant_type': 'refresh_token',
         'refresh_token': refreshToken as string,
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
     console.log(response)
     window.sessionStorage.setItem('access_token', response.accessToken);
     if (response.refreshToken) {
      window.sessionStorage.setItem('refresh_token', response.refreshToken);
     }
  }

  function getSong() {

    let token = window.sessionStorage.getItem('access_token')
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then(async (res: Response) => {
      if (res.status === 401) {
        // Refresh token
        getRefreshToken();


      }
      if (res.body !== null){
        let a = await res.json();
        songData = a
        setSong(a)
        console.log(a)
      }
      
    })
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      CALLBACK
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">

          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={getSong}
          >
            Fetch song
          </button>
          {currentSong?.item?.name} <br/>
          {(currentSong?.progress_ms / currentSong?.item?.duration_ms)}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
