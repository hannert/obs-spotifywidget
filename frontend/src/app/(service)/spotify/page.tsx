'use client'

import dotenv from 'dotenv';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { songDataStore, spotifyDataStore } from '../../store';



export default function Spotify() {
  dotenv.config({ path: '.env' });

  const getTokensAction = spotifyDataStore((state) => state.getTokens);
  const refreshTokensAction = spotifyDataStore((state) => state.refreshTokens);

  let access_token: string;
  let refresh_token: string;

  let songFetchLoop: any;

  const currentSong = songDataStore((state) => state.currentSong);
  const setSong = songDataStore((state) => state.setSong);

  const searchParams = useSearchParams();
  const secret = searchParams.get('secret')
  // const dev = searchParams.get('dev')

  useEffect(() => {
    // Set tokens in app when loading in
    try {
      if (secret !== null) {
        startHelper();
      }
      
    } catch (error) {
    }

  }, [])

  const startHelper = async () => {
    if (secret !== null){
      const tokensResponse =  await getTokensAction(secret);
      if (tokensResponse.status === 200){
        access_token = tokensResponse.data.Access_Token;
        refresh_token = tokensResponse.data.Refresh_Token;
        // Start interval for data retrieval
        //testGetSong()
        setRepeat();
      }
     
    }
  }


  async function testRefresh() {
    //clearInterval(songFetchLoop);
    console.log('test refresh token:', refresh_token)
    if(secret !== null && refresh_token !== null){
      const test = await refreshTokensAction(secret, refresh_token);
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
      if (secret !== null){
        console.log("REFRESHING ------------------")
        testRefresh();
        return;
      }
    }
    if (response.status === 200 && response.body !== null){
      let data = await response.json();
      setSong(data)
      console.log(data)
    }
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-row gap-8 row-start-2 items-center sm:items-start">


        <div>
          <img src={currentSong?.item?.album.images[2].url} />
        </div>
        <div>
          <div className="w-64 whitespace-nowrap overflow-hidden">{currentSong?.item?.name}</div>
          <div className="w-64 flex gap-4 items-center flex-col sm:flex-row">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: ((currentSong?.progress_ms / currentSong?.item?.duration_ms) * 100) + '%'}}></div>
            </div>
          </div>
          <div className="w-32">
            {Math.floor((currentSong?.progress_ms / 1000) / 60) + ':' + Math.trunc((currentSong?.progress_ms / 1000) % 60).toString().padStart(2, '0')}/ 
            {Math.floor((currentSong?.item?.duration_ms / 1000) / 60) + ':' + Math.trunc((currentSong?.item?.duration_ms / 1000) % 60).toString().padStart(2, '0')}
          </div>
        </div>
        {/* <button onClick={() => clearInterval(songFetchLoop)}>
          STOP
        </button> */}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
