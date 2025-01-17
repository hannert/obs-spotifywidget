import { create } from 'zustand';
interface SongState {
  currentSong: any,
  setSong: (song: object) => void
}
export const songDataStore = create<SongState>()((set) => ({
  currentSong: {},
  setSong: (song: any) => set(() => ({currentSong: song}))
}))