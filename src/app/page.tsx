'use client'

import 'dotenv/config';

export default function Home() {


  const redirectUri = 'http://localhost:3000';
  const authUrl = new URL("https://accounts.spotify.com/authorize?")



  async function getAuth() {

    let awesome = new URLSearchParams({
      'response_type': 'code',
      'client_id': process.env.client_id as string,
      'redirect_uri': redirectUri,
      'scope': 'user-read-playback-state user-read-currently-playing',
    })

    fetch(authUrl + awesome.toString(), {

    }).then(async (response) => {
      let a = await response.json();
      console.log(a)
      window.sessionStorage.setItem('code', a.code);
    })
  }

  async function getAuthNew() {

    fetch('http://localhost:3001/login', {

    }).then(async (response) => {
      let a = await response.json();
      console.log(a)
      window.sessionStorage.setItem('code', a.code);
    })
  }

 
  async function getSong() {

    let token = window.sessionStorage.getItem('access_token')
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then(async (response) => {
      let a = await response.json();
      window.sessionStorage.setItem('access_payload', a.access_token);

      console.log(a)
    })
  }



  
  function ping_server() {

  }



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            onClick={getAuthNew}
          >

            Get auth from backend
          </button>

          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={getAuth}
          >
            Get Auth
          </button>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Get access
          </button>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            onClick={getSong}
          >
            Fetch song
          </button>
        </div>
        <a href={('https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: process.env.client_id as string,
      redirect_uri: 'http://localhost:3000/callback',
      scope: 'user-read-playback-state user-read-currently-playing' 
    }).toString())}>
          Refirect
        </a>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
