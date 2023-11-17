import React, { useState, useEffect } from 'react';
import useGameSocket from './useGameSocket';

const characters = [
  'Miss Scarlet',
  'Prof. Plum',
  'Mrs. Peacock',
  'Mr. Green',
  'Mrs. White',
  'Col. Mustard',
];

const weapons = [
    'Candlestick',
    'Dagger',
    'Lead Pipe',
    'Revolver',
    'Rope',
    'Wrench',
  ];

const initialPositions = {
  'Miss Scarlet': 'Hallway2',
  'Prof. Plum': 'Hallway3',
  'Mrs. Peacock': 'Hallway8',
  'Mr. Green': 'Hallway11',
  'Mrs. White': 'Hallway12',
  'Col. Mustard': 'Hallway5',
};

const secretPassages = {
    'Study': 'Kitchen',
    'Kitchen': 'Study',
    'Conservatory': 'Lounge',
    'Lounge': 'Conservatory',
  };
const adjacency = {
    'Study': ['Hallway1', 'Hallway3'],
    'Hall': ['Hallway1', 'Hallway2'],
    'Lounge': ['Hallway2', 'Hallway5'],
    'Library': ['Hallway3', 'Hallway6'],
    'Billiard Room': ['Hallway4', 'Hallway6', 'Hallway7'],
    'Dining Room': ['Hallway5', 'Hallway7'],
    'Conservatory': ['Hallway8', 'Hallway11'],
    'Ballroom': ['Hallway8', 'Hallway9', 'Hallway12'],
    'Kitchen': ['Hallway9', 'Hallway12'],
    'Hallway1': ['Study', 'Hall'],
    'Hallway2': ['Hall', 'Lounge'],
    'Hallway3': ['Study', 'Library'],
    'Hallway4': ['Library', 'Billiard Room'],
    'Hallway5': ['Lounge', 'Dining Room'],
    'Hallway6': ['Library', 'Billiard Room'],
    'Hallway7': ['Billiard Room', 'Dining Room'],
    'Hallway8': ['Conservatory', 'Ballroom'],
    'Hallway9': ['Ballroom', 'Kitchen'],
    'Hallway10': [],
    'Hallway11': ['Conservatory', 'Ballroom'],
    'Hallway12': ['Ballroom', 'Kitchen'],
};

const Board = () => {
    const [currentTurn, setCurrentTurn] = useState(0);
    const [positions, setPositions] = useState(initialPositions);
    const [logs, setLogs] = useState([]);
    const [currentSuggestion, setCurrentSuggestion] = useState({ character: '', weapon: '' });
    const [currentAccusation, setCurrentAccusation] = useState({ character: '', weapon: '', room: '' });
    const [canMakeSuggestion, setCanMakeSuggestion] = useState(false);

    // backend part
    const socket = useGameSocket();
    const [gameState, setGameState] = useState({});

    useEffect(() => {
        if (socket) {
          socket.on('gameState', (state) => {
            setGameState(state);
            setPositions(state.playerPositions);
      
            // 确保更新日志信息
            if (state.logs && state.logs.length > 0) {
              setLogs(state.logs);
            }
          });
      
          return () => {
            socket.off('gameState');
          };
        }
      }, [socket]);
      
    const grid = [
      ['Study', 'Hallway1', 'Hall', 'Hallway2', 'Lounge'],
      ['Hallway3', '', 'Hallway4', '', 'Hallway5'],
      ['Library', 'Hallway6', 'Billiard Room', 'Hallway7', 'Dining Room'],
      ['Hallway8', '', 'Hallway9', '', 'Hallway10'],
      ['Conservatory', 'Hallway11', 'Ballroom', 'Hallway12', 'Kitchen'],
    ];
  
    const handleCellClick = (cell) => {
        const currentCharacter = characters[currentTurn];
        const currentCharacterPosition = positions[currentCharacter];
        const isHallway = cell.includes('Hallway');
        const isRoom = !isHallway && cell !== '';
        const isOccupiedHallway = isHallway && Object.values(positions).includes(cell);
    
        if (currentCharacterPosition !== cell && !isOccupiedHallway) {
          if (isRoom || (isHallway && canMoveToHallway(currentCharacterPosition, cell))) {
            const updatedPositions = { ...positions, [currentCharacter]: cell };
            setPositions(updatedPositions);
            setLogs([...logs, `${currentCharacter} moves to the ${cell}.`]);
    
            if (isRoom) {
              setCanMakeSuggestion(true);
            } else {
              setCanMakeSuggestion(false);
            }
    
            setCurrentTurn((currentTurn + 1) % characters.length);
    
            // 发送玩家动作到服务器
            somePlayerAction({
              type: 'move',
              character: currentCharacter,
              newPosition: cell,
            });
          }
        }
      };

      const somePlayerAction = (actionData) => {
        if (socket) {
          socket.emit('playerAction', actionData);
        }
      };
    

      const canMoveToHallway = (currentPosition, targetHallway) => {
        // Check if the target hallway is adjacent to the current position
        return adjacency[currentPosition]?.includes(targetHallway);
      };
    
      const handleMakeSuggestion = () => {
        const currentCharacter = characters[currentTurn - 1];
        const room = positions[currentCharacter];
        setLogs([...logs, `${currentCharacter} suggests ${currentSuggestion.character} with the ${currentSuggestion.weapon} in the ${room}.`]);
        setPositions({ ...positions, [currentSuggestion.character]: room });
        setCanMakeSuggestion(false);
        setCurrentSuggestion({ character: '', weapon: '' });
      
        // 发送建议动作到服务器
        somePlayerAction({
          type: 'suggest',
          character: currentSuggestion.character,
          weapon: currentSuggestion.weapon
        });
      };
      
      const handleMakeAccusation = () => {
        setLogs([...logs, `${characters[currentTurn]} accuses ${currentAccusation.character} with the ${currentAccusation.weapon} in the ${currentAccusation.room}.`]);
        setCurrentAccusation({ character: '', weapon: '', room: '' });
      
        // 发送指控动作到服务器
        somePlayerAction({
          type: 'accuse',
          character: currentAccusation.character,
          weapon: currentAccusation.weapon,
          room: currentAccusation.room
        });
      };



    return (
      <div className="h-screen w-full flex">
        <div className="flex-grow-0 flex-shrink-0 w-7/10 p-4">
          <div className="grid grid-cols-5 gap-1">
            {grid.flat().map((cell, index) => {
              const isRoom = cell !== '' && !cell.includes('Hallway');
              const cellStyle = {
                padding: '20px',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid black',
                backgroundColor: isRoom ? 'blue' : cell.includes('Hallway') ? 'gray' : 'transparent',
                cursor: 'pointer',
              };
  
              const charactersInCell = Object.entries(positions).filter(([_, value]) => value === cell).map(([key]) => key);
  
              return (
                <div
                  key={index}
                  style={cellStyle}
                  onClick={() => handleCellClick(cell)}
                >
                  {cell}
                  {charactersInCell.map((character) => (
                    <div key={character} style={{ marginTop: '5px' }}>{character}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>


        <div className="w-3/10 p-4 flex flex-col">
            <div className="mb-4 flex-grow-0">
            <div className="text-lg font-bold">Current Turn: {characters[currentTurn]}</div>
            </div>
          {canMakeSuggestion && (
            <div className="flex-grow-0 mb-4">
            <div>
              <select value={currentSuggestion.character} onChange={(e) => setCurrentSuggestion({ ...currentSuggestion, character: e.target.value })}>
                {characters.map((character) => (
                  <option key={character} value={character}>{character}</option>
                ))}
              </select>
              <select value={currentSuggestion.weapon} onChange={(e) => setCurrentSuggestion({ ...currentSuggestion, weapon: e.target.value })}>
                {weapons.map((weapon) => (
                  <option key={weapon} value={weapon}>{weapon}</option>
                ))}
              </select>
              <button onClick={handleMakeSuggestion} className="p-2 bg-blue-500 text-white rounded">
                Make Suggestion
              </button>
            </div>
            </div>
          )}
    
          <div className="flex-grow-0 mb-4">
          <div>
            <select value={currentAccusation.character} onChange={(e) => setCurrentAccusation({ ...currentAccusation, character: e.target.value })}>
              {characters.map((character) => (
                <option key={character} value={character}>{character}</option>
              ))}
            </select>
            <select value={currentAccusation.weapon} onChange={(e) => setCurrentAccusation({ ...currentAccusation, weapon: e.target.value })}>
              {weapons.map((weapon) => (
                <option key={weapon} value={weapon}>{weapon}</option>
              ))}
            </select>
            <select value={currentAccusation.room} onChange={(e) => setCurrentAccusation({ ...currentAccusation, room: e.target.value })}>
              {grid.flat().filter((cell) => cell !== '' && !cell.includes('Hallway')).map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <button onClick={handleMakeAccusation} className="p-2 bg-green-500 text-white rounded">
              Make Accusation
            </button>
          </div>
          <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <h4 className="text-lg font-bold">Activity Logs:</h4>
            <ul>
                {logs.map((log, index) => (
                <li key={index}>{log}</li>
                ))}
          </ul>
          </div>
        </div>
      </div>
      </div>
    );
  };
  
  export default Board;