// src/components/InfoPanel.js
import React, { useState } from 'react';
import axios from 'axios';

const InfoPanel = () => {
  const [logs, setLogs] = useState([]);

  const handleClick = async () => {
    // 添加日志
    setLogs(prevLogs => [...prevLogs, '用户点击了移动按钮']);

    // 向后端发送请求（此URL为示例，您可以根据需要进行更改）
    try {
      const response = await axios.get('https://your-backend-url.com/move');
      const data = response.data;
      // 这里可以处理后端的响应数据
      setLogs(prevLogs => [...prevLogs, '从后端收到的响应: ' + JSON.stringify(data)]);
    } catch (error) {
      setLogs(prevLogs => [...prevLogs, '请求错误: ' + error.message]);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <button onClick={handleClick} className="bg-blue-500 text-white p-2 rounded">移动</button>
      <div className="border p-4 space-y-2">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}

export default InfoPanel;
