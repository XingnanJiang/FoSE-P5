const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 初始游戏状态，包括日志数组
let gameState = {
  playerPositions: {
    'Miss Scarlet': 'Hallway2',
    'Prof. Plum': 'Hallway3',
    'Mrs. Peacock': 'Hallway8',
    'Mr. Green': 'Hallway11',
    'Mrs. White': 'Hallway12',
    'Col. Mustard': 'Hallway5',
  },
  suggestions: [],
  accusations: [],
  logs: [] // 添加一个日志数组
};

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('gameState', gameState);

  socket.on('playerAction', (action) => {
    // 添加日志条目的辅助函数
    const addLogEntry = (entry) => {
      gameState.logs.push(entry);
    };

    switch (action.type) {
      case 'move':
        gameState.playerPositions[action.character] = action.newPosition;
        addLogEntry(`${action.character} moved to ${action.newPosition}`);
        break;
      case 'suggest':
        gameState.suggestions.push({
          character: action.character,
          weapon: action.weapon,
          room: gameState.playerPositions[action.character]
        });
        addLogEntry(`${action.character} made a suggestion with ${action.weapon} in the ${gameState.playerPositions[action.character]}`);
        break;
      case 'accuse':
        gameState.accusations.push(action);
        addLogEntry(`${action.character} made an accusation with ${action.weapon} in the ${action.room}`);
        break;
      default:
        break;
    }
    console.log('Current logs:', gameState.logs);
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
