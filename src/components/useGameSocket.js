// useGameSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useGameSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 只在首次渲染时创建新的 Socket 连接
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // 清理函数只在组件卸载时调用
    return () => newSocket.close();
  }, []); // 空依赖数组表示这个 useEffect 只在组件首次渲染时运行

  return socket;
};


export default useGameSocket;
