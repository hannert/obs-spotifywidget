import 'dotenv/config';
import { create } from 'zustand';

let backendURL = 'http://localhost:3001'
interface credentials {
  tokens: object,
  username: string,
  login: (username: string, password: string) => Promise<number>,
  landing: () => Promise<number>,
  logout: () => Promise<number>,
  register: (username: string, password: string, email: string) => Promise<number>,
  checkUsername: (username: string) => Object,
  checkEmail: (email: string) => Object,
  setUsername: (username: string) => void
}

export const userDataStore = create<credentials>((set) => ({
  tokens: {},
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
    set({tokens: await response.json(), username: username})
    return response.status
    } catch (error) {
      console.log(error)
    }
    return 400
  },
  landing: async () => {
    try{
      const response = await fetch(backendURL + '/landing', {
      method: 'POST',
      credentials: 'include',
      })
      return response.status

    } catch (error) {}
    return 0
  },
  logout: async () => {
    const response = await fetch(backendURL + '/logout', {
      method: 'POST',
      credentials: 'include',
    })
    set({username: undefined})
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
      let returnJSON = {}
      await fetch(backendURL + '/auth/query/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username
        })
      }).then((response) => response.json()).then((data) =>  returnJSON = data)
      console.log(returnJSON)
      return returnJSON
    } catch (error) {
      console.log(error)
    }
    return null
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
  }
}))

interface spotifyState {
  accessToken: string,
  refreshToken: string,
  clientID: string,
  clientSecret: string,
  linkSecret: string,
  saveClientID: (newId: string) => Promise<number>,
  saveClientSecret: (newSecret: string) => Promise<number>,
  setAccess: (newToken: string) => string,
  setRefresh: (newToken: string) => Promise<string>,
  getTokens: (id: string) => any,
  getClients: () => any,
  getLinkSecret: () => any,
  refreshTokens: (id: string, refreshToken: string) => any,

}

export const spotifyDataStore = create<spotifyState>()((set) => ({
  accessToken: '',
  refreshToken: '',
  clientID: '',
  clientSecret: '',
  linkSecret: '',
  saveClientID: async (newId: string) => {
    const response = await fetch(backendURL + '/client/id', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify({
        client_id: newId
      })
    })
    return response.status;
  },
  saveClientSecret: async (newSecret: string) => {
    const response = await fetch(backendURL + '/client/secret', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      credentials: 'include',
      body: JSON.stringify({
        client_secret: newSecret
      })
    })
    return response.status;
  },
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
  getTokens: async (id: string) =>  {
    const response = await fetch('http://localhost:3001/token' + '?id=' + id, {
      credentials: 'include',
    })
    const body = await response.json();
    console.log(body.data)
    return body.data;
  },
  getClients: async () => {
    try{
      const response = await fetch(backendURL + '/client', {
        credentials: 'include',
      })
      const body = await response.json();
      console.log(body.data)
      return body.data;
    } catch (error) {
      
    }
  },
  getLinkSecret: async () => {
    const response = await fetch(backendURL + '/secret', {
      credentials: 'include',
    })
    const body = await response.json();
    console.log(body.data)
    return body.data;
  },
  refreshTokens: async (id: string, refreshToken: string) => {
    const response = await fetch('http://localhost:3001/refresh' + '?id=' + id + '&refresh=' + refreshToken)
    const body = await response.json();
    console.log(body.data)
    return body.data;
  }

}));


interface SongState {
  currentSong: any,
  setSong: (song: object) => void
}
export const songDataStore = create<SongState>()((set) => ({
  currentSong: {},
  setSong: (song: any) => set(() => ({currentSong: song}))
}))