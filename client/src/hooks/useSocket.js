import { io } from 'socket.io-client'

let socket = null   // singleton — one connection per app session

export const useSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000', {
      withCredentials: true,
    })
  }
  return socket
}