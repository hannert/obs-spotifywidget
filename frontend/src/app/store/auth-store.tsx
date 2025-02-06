import { create } from "zustand";
let backendURL = 'http://localhost:3001'


export type storeResponse = {
  status: number,
  message: string
}
interface protectedState {
  clientID: string,
  clientSecret: string,
  linkSecret: string,
  saveClientID: (newId: string) => Promise<storeResponse>,
  saveClientSecret: (newSecret: string) => Promise<storeResponse>,
  getClients: () => Promise<any>,
  setClientID: (text: string) => void,
  setClientSecret: (text: string) => void,
  getLinkSecret: () => Promise<any>,
  setLinkSecret: (newSecret: string) => void,
  regenerateSecret: () => any,
  refreshTokens: (id: string, refreshToken: string) => any,

}

export const protectedDataStore = create<protectedState>()((set) => ({
  accessToken: '',
  refreshToken: '',
  clientID: '',
  clientSecret: '',
  linkSecret: '',
  saveClientID: async (newId: string) => {
    try {
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
      return ({status: response.status, message: 'Successfully saved Client ID!'});
    } catch (error) {
      console.log(error)
    }
    return ({status: 400, message: 'Error saving client ID.'})
  },
  saveClientSecret: async (newSecret: string) => {
    try {
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
      return ({status: response.status, message: 'Successfully saved Client Secret!'});
    } catch (error) {
      console.log(error)
    }
    return ({status: 400, message: 'Error saving client secret.'})
  },
  getClients: async () => {
    try{
      const response = await fetch(backendURL + '/client', {
        credentials: 'include',
      })

      if (response.status === 401) {
        return ({status: response.status})
      }

      const body = await response.json();
      if (body.data.Client_ID !== undefined) {set((state) => ({clientID: body.data.Client_ID}))}
      if (body.data.Client_Secret !== undefined) {set((state) => ({clientSecret: body.data.Client_Secret}))}

      return {status: response.status, message: 'Successfully retrieved information.'}

    } catch (error) {
      console.log('Error', error)
    }
    return {status: 400, message: 'Error getting client information.'}
  },
  setClientID: (text: string) => {
    set((state) => ({clientID: text}));
  },
  setClientSecret: (text: string) => {
    set((state) => ({clientSecret: text}));
  },
  getLinkSecret: async () => {
    const response = await fetch(backendURL + '/secret', {
      credentials: 'include',
    })

    if (response.status === 401) {
      return ({status: response.status})
    }

    const body = await response.json();
    set((state) => ({linkSecret: body.data.App_Secret}))

    return response.status;
  },
  setLinkSecret: (newSecret: string) => {
    
  },
  regenerateSecret: async () => {
    const response = await fetch(backendURL + '/regenerate', {
      method: 'POST',
      credentials: 'include',
    })
    const body = await response.json();
    set((state) => ({linkSecret: body.data.App_Secret}))

    return {status: response.status, data: body.data};
  },
  refreshTokens: async (secret: string, refreshToken: string) => {
    const response = await fetch('http://localhost:3001/refresh' + '?secret=' + secret + '&refresh=' + refreshToken)
    const body = await response.json();
    return body.data;
  }

}));