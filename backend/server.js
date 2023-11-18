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
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    return {
      characterCards: shuffle(cards.characters).slice(0, 3),
      weaponCards: shuffle(cards.weapons).slice(0, 3),
      roomCards: shuffle(cards.rooms).slice(0, 3)
    };
  }
  
  let players = {};
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

  players[socket.id] = { cards: assignCardsToPlayer() };

  socket.emit('gameState', gameState);
  socket.emit('yourCards', players[socket.id].cards);

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
