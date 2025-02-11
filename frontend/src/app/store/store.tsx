'use client'

import 'dotenv/config';
import { create } from 'zustand';
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log(backendURL)
export type UsernameQuery = {
  isUsernameAvailable: boolean
}


interface credentials {
  username: string,
  login: (username: string, password: string) => Promise<number>,
  logout: () => Promise<number>,
  register: (username: string, password: string, email: string) => Promise<number>,
  checkUsername: (username: string) => Promise<UsernameQuery>,
  checkEmail: (email: string) => object,
  setUsername: (username: string) => void,
  refresh: () => Promise<number>
}

export const userDataStore = create<credentials>((set) => ({
  username: '',
  login: async (username: string, password: string) => {
    console.log(username, password)
    try{
    const response = await fetch(backendURL + '/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
    })
    set({username: username})
    return response.status
    } catch (error) {
      console.log(error)
    }
    return 400
  },
  logout: async () => {
    console.log('Logging out')
    const response = await fetch(backendURL + '/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    console.log('Logging out in data-store.tsx')
    return response.status
  },
  register: async (username: string, password: string, email: string) => {
    const response = await fetch(backendURL + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email
      })
    })
    console.log('Registering in data-store.tsx')
    return response.status
  },
  checkUsername: async (username: string) => {
    try {
      console.log(JSON.stringify({
        username: username
      }))
      const response = await fetch(backendURL + '/auth/query/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username
        })
      })
      const returnJSON: UsernameQuery = await response.json()
      console.log(returnJSON)
      return returnJSON
    } catch (error) {
      console.log(error)
    }
    return ({isUsernameAvailable: false})
  },
  checkEmail: async (email: string) => {
    try {
      const response = await fetch(backendURL + '/query/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      })
      const returnJSON = await response.json
      return returnJSON
    } catch (error) {
      console.log(error)
    }
    return {}
  },
  setUsername: (username: string) => {
    set({username: username})
  },
  refresh: async () => {
    try {
      const response = await fetch(backendURL + '/auth/refresh', {
        method: 'POST',
        credentials: 'include',

      })
      return response.status
    } catch (error) {
      console.log(error)
    }
    return 400
  }
}))

export type SpotifyPayload = {
  status: number,
  data: {
    Access_Token: string | '',
    Refresh_Token: string | '',
  }
}



interface spotifyState {
  accessToken: string,
  refreshToken: string,
  setAccess: (newToken: string) => string,
  setRefresh: (newToken: string) => Promise<string>,
  getTokens: (id: string) => Promise<SpotifyPayload>,
  refreshTokens: (secret: string, refreshToken: string) => Promise<string>
}

export const spotifyDataStore = create<spotifyState>()((set) => ({
  accessToken: '',
  refreshToken: '',
  setAccess: (newToken: string) => {
    console.log('new access token:', newToken);
    set(() => ({accessToken: newToken}));
    return newToken;
  },
  setRefresh: async (newToken: string) => {
    console.log('new refresh token:', newToken)
    set(() => ({refreshToken: newToken}));
    return newToken
  },
  getTokens: async (secret: string) =>  {
    const response = await fetch('http://localhost:3001/token' + '?secret=' + secret)
    const body = await response.json();
    set(() => ({accessToken: body.data.Access_Token, refreshToken: body.data.Refresh_Token}))
    console.log({status: response.status, data: body.data})
    return {status: response.status, data: body.data};
  },
  refreshTokens: async (secret: string, refreshToken: string) => {
    const response = await fetch('http://localhost:3001/refresh' + '?secret=' + secret + '&refresh=' + refreshToken)
    const body = await response.json();
    console.log(body.data)
    return body.data;
  }
}));


interface SongState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSong: any,
  setSong: (song: object) => void
}
export const songDataStore = create<SongState>()((set) => ({
  currentSong: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSong: (song: any) => set(() => ({currentSong: song}))
}))