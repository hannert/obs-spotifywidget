import { create } from 'zustand';



interface UserState {
  accessToken: string,
  refreshToken: string,
  setAccess: (newToken: string) => string,
  setRefresh: (newToken: string) => Promise<string>,
  getTokens: (id: string) => any,
  refreshTokens: (id: string, refreshToken: string) => any,

}

export const userDataStore = create<UserState>()((set) => ({
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
  getTokens: async (id: string) =>  {
    const response = await fetch('http://localhost:3001/token' + '?id=' + id)
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