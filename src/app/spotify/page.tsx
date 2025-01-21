'use client'

import dotenv from 'dotenv';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { songDataStore, userDataStore } from '../store';

export default function Home() {
  dotenv.config({ path: '.env' });

  const BACKEND_URL = 'http://localhost:3001'

  const accessToken = userDataStore((state) => state.accessToken);
  const setAccessToken = userDataStore((state) => state.setAccess);
  const refreshToken = userDataStore((state) => state.refreshToken);
  const setRefreshToken = userDataStore((state) => state.setRefresh);
  const getTokensAction = userDataStore((state) => state.getTokens);
  const refreshTokensAction = userDataStore((state) => state.refreshTokens);


  const currentSong = songDataStore((state) => state.currentSong);
  const setSong = songDataStore((state) => state.setSong);

  const searchParams = useSearchParams();
  const id = searchParams.get('id')

  let songData: any = {}

  useEffect(() => {
    // Set tokens in app when loading in

    try {
      if (id !== null) {
        getTokensActionHelper();
      }
      
    } catch (error) {

    }
    //getRefreshedToken();
    //let awesome = setInterval(getSong, 1000)
  }, [])

  const getTokensActionHelper = async () => {
    if (id !== null){
      const tokens =  await getTokensAction(id);
      if (tokens !== null){
        setAccessToken(tokens.Access_Token);
        setRefreshToken(tokens.Refresh_Token);
      }
      console.log(tokens)

    }  
  }

  // Request to backend
  const getRefreshedToken = () => {
    try {
      if (id !== null){
        const response =  getTokensAction(id)
        console.log(response)
      }
      
    } catch (error) {

    }

  }

  function testRefresh() {
    console.log(id, refreshToken)
    if(id !== null && refreshToken !== null){
      const test = refreshTokensAction(id, refreshToken);      
    }

  }


  // Stays in client to get song data
  function getSong() {

    fetch('https://api.spotify.com/v1/me/player', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
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
        <button onClick={() => testRefresh()}>test</button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
