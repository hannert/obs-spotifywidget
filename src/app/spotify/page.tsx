'use client'

import dotenv from 'dotenv';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { songDataStore, userDataStore } from '../store';



export default function Home() {
  dotenv.config({ path: '.env' });

  const BACKEND_URL = 'http://localhost:3001'

  // const accessToken = userDataStore((state) => state.accessToken);
  const setAccessToken = userDataStore((state) => state.setAccess);
  // const refreshToken = userDataStore((state) => state.refreshToken);
  const setRefreshToken = userDataStore((state) => state.setRefresh);
  const getTokensAction = userDataStore((state) => state.getTokens);
  const refreshTokensAction = userDataStore((state) => state.refreshTokens);



  var access_token: string;
  var refresh_token: string;

  let songFetchLoop: any;

  const currentSong = songDataStore((state) => state.currentSong);
  const setSong = songDataStore((state) => state.setSong);

  const searchParams = useSearchParams();
  const id = searchParams.get('id')

  let songData: any = {}

  useEffect(() => {
    // Set tokens in app when loading in

    try {
      if (id !== null) {
        startHelper();
      }
      
    } catch (error) {
    }

  }, [])

  const startHelper = async () => {
    if (id !== null){
      const tokens =  await getTokensAction(id);
      if (tokens !== null){
        // let tempToken = await setAccessToken(tokens.Access_Token);
        // let tempRefreshToken = await setRefreshToken(tokens.Refresh_Token); 

        access_token = tokens.Access_Token;
        refresh_token = tokens.Refresh_Token;
        //testGetSong()
        // Start interval for data retrieval
        setRepeat();
      }
     
    }
  }


  async function testRefresh() {
    //clearInterval(songFetchLoop);
    console.log('test refresh token:', refresh_token)
    if(id !== null && refresh_token !== null){
      const test = await refreshTokensAction(id, refresh_token);
      console.log('test', test);    
      access_token = test
      // let tempToken = setAccessToken(test);
      setRepeat()
    }

  }
  function setRepeat() {
    songFetchLoop = setInterval(testGetSong, 1000)
  }

  async function testGetSong() {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + access_token
      },
    });
    if (response.status === 401) {
      // Stop fetching song data
      clearInterval(songFetchLoop);
      // Refresh token
      if (id !== null){
        console.log("REFRESHING ------------------")
        testRefresh();
        return;
      }
    }
    if (response.body !== null){
      let data = await response.json();
      songData = data
      setSong(data)
      console.log(data)
    }
  }



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      CALLBACK
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">


          
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" 
            style={{width: ((currentSong?.progress_ms / currentSong?.item?.duration_ms) * 100)}}></div>
          </div>
        </div>
        <button onClick={() => testRefresh()}>test</button>
        <button onClick={() => {setRepeat(accessToken)}}>Get Song Data</button>
        {currentSong?.item?.name} <br/>
        {(currentSong?.progress_ms / currentSong?.item?.duration_ms)}
        <button onClick={() => clearInterval(songFetchLoop)}>
          STOP
        </button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
