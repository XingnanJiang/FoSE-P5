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

const correctAnswer = {
    character: "Prof. Plum",
    weapon: "Dagger",
    room: "Library"
  };

  const cards = {
    characters: ['Miss Scarlet', 'Prof. Plum', 'Mrs. Peacock', 'Mr. Green', 'Mrs. White', 'Col. Mustard'],
    weapons: ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench'],
    rooms: ['study', 'hall', 'lounge', 'library', 'billiard', 'dining room', 'conservatory', 'ballroom', 'kitchen']
  };
  

  function assignCardsToPlayer() {
    // 直接分配卡片给两名玩家
    const player1 = {
      characterCards: cards.characters.slice(0, 3),
      weaponCards: cards.weapons.slice(0, 3),
      roomCards: cards.rooms.slice(0, 4)
    };
  
    const player2 = {
      characterCards: cards.characters.slice(3, 6),
      weaponCards: cards.weapons.slice(3, 6),
      roomCards: cards.rooms.slice(4, 8)
    };
  
    return [player1, player2];
  }

  
  let players = {};
// 初始游戏状态，包括日志数组
let gameState = {
  playerPositions: {
    'Miss Scarlet': 'Hallway2',
    'Prof. Plum': 'Hallway3',
  },
  currentTurn: 0,
  suggestions: [],
  accusations: [],
  logs: [] // 添加一个日志数组
};

io.on('connection', (socket) => {
  console.log('A user connected');


  players[socket.id] = {}; // 初始化玩家对象

  // 检查是否已有两名玩家连接
  if (Object.keys(players).length === 2) {
    // 分配卡片给两名玩家
    const [player1Cards, player2Cards] = assignCardsToPlayer();
    const playerIds = Object.keys(players);
    players[playerIds[0]].cards = player1Cards;
    players[playerIds[1]].cards = player2Cards;

    // 向两名玩家发送他们的卡片
    playerIds.forEach((playerId) => {
      io.to(playerId).emit('yourCards', players[playerId].cards);
    });
  }

  // 发送游戏状态和玩家卡片（如果已分配）
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
        addLogEntry(`${action.player} accuses ${action.character} with the ${action.weapon} in the ${action.room}`);
          
            // 检查指控是否正确
            if (action.character === correctAnswer.character &&
                action.weapon === correctAnswer.weapon &&
                action.room === correctAnswer.room) {
              io.emit('gameWon', { winner: action.player, accusation: action });
            }
            break;
      default:
        break;
    }
    if (action.type === 'move' || action.type === 'suggest' || action.type === 'accuse') {
      gameState.currentTurn = (gameState.currentTurn + 1) % 2;
    }
    console.log('Current logs:', gameState.logs);
    io.emit('gameState', gameState);
  });

socket.on('cardClicked', (message) => {
  io.emit('cardNotification', `Card clicked: ${message.type} - ${message.name}`);
});


  socket.on('disconnect', () => {
    console.log('User disconnected');
    delete players[socket.id];
  });
});

const port = 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
