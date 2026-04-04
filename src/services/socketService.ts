import { io, type Socket } from 'socket.io-client';

export interface TableStatusChangePayload {
  tableId: number;
  status: string;
  name?: string;
  type?: 'Pool' | 'Carom';
  startedAt?: string;
  elapsedSeconds?: number;
  billAmount?: number;
}

let socket: Socket | null = null;

const getBaseUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';
};

const connectSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem('accessToken');

  socket = io(getBaseUrl(), {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
    auth: token ? { token } : undefined,
  });

  socket.connect();
  return socket;
};

export const subscribeTableStatusChange = (
  handler: (payload: TableStatusChangePayload) => void,
): (() => void) => {
  const client = connectSocket();
  client.on('table:statusChange', handler);

  return () => {
    client.off('table:statusChange', handler);
  };
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
