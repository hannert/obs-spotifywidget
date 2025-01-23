'use client'
import 'dotenv/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { songDataStore } from '../store';

export default function Home() {
  const router = useRouter();

  const redirectUri = 'http://localhost:3000/callback';

  const currentSong = songDataStore((state) => state.currentSong);
  const setSong = songDataStore((state) => state.setSong);

  const searchParams = useSearchParams();
  const code = searchParams.get('code')
  if (code !== null) {
    // save to database
    fetch('http://localhost:3001')
    router.push('/callback')
  }

  let refreshToken = ''


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      CALLBACK
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="flex gap-4 items-center flex-col sm:flex-row">

          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Get access
          </button>
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
          >
            Fetch song
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
