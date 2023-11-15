import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SuggestionPage from './pages/SuggestionPage';
import AccusationPage from './pages/AccusationPage';
import { useNavigate } from 'react-router-dom';


function Game() {
  const navigate = useNavigate();
  const characters = [
    'Miss Scarlet',
    'Prof. Plum',
    'Mrs. Peacock',
    'Mr. Green',
    'Mrs. White',
    'Col. Mustard',
  ];

  const [currentTurn, setCurrentTurn] = useState(0); // Start with the first character's turn

  const [positions, setPositions] = useState({
    'Miss Scarlet': 'Hallway1',
    'Prof. Plum': 'Hallway2',
    'Mrs. Peacock': 'Hallway3',
    'Mr. Green': 'Hallway4',
    'Mrs. White': 'Hallway5',
    'Col. Mustard': 'Hallway6',
  });

  // Define the rooms and hallways in a 5x5 grid
  const grid = [
    ['Study', 'Hallway1', 'Hall', 'Hallway2', 'Lounge'],
    ['Hallway3', '', 'Hallway4', '', 'Hallway5'],
    ['Library', 'Hallway6', 'Billiard Room', 'Hallway7', 'Dining Room'],
    ['Hallway8', '', 'Hallway9', '', 'Hallway10'],
    ['Conservatory', 'Hallway11', 'Ballroom', 'Hallway12', 'Kitchen'],
  ];

  const [logs, setLogs] = useState([]);

  const moveCharacter = async (character, room) => {
    // Prevent moves to empty cells
    if (room === '') return;

    // Prevent moves to occupied hallways or non-hallway moves when it's not the character's turn
    if ((room.includes('Hallway') && Object.values(positions).includes(room)) || character !== characters[currentTurn]) {
      setLogs(prevLogs => [...prevLogs, `Move blocked. Either the hallway is occupied or it's not ${character}'s turn.`]);
      return;
    }

    // Update the positions state to reflect the new positions of the characters
    setPositions(prevPositions => ({ ...prevPositions, [character]: room }));

    // Add the move to the activity log
    setLogs(prevLogs => [...prevLogs, `${character} moves to the ${room}.`]);

    // Cycle to the next character's turn
    setCurrentTurn((prevTurn) => (prevTurn + 1) % characters.length);

    
  }

  const handleSuggestion = (character) => {
    // Implement suggestion logic here...
    setLogs(prevLogs => [...prevLogs, `${character} makes a suggestion in the ${positions[character]}.`]);
    // Move the next character to the room of the suggestion
    // setCurrentTurn and setPositions as needed.
  };

  const handleAccusation = (character) => {
    // Implement accusation logic here...
    setLogs(prevLogs => [...prevLogs, `${character} makes an accusation!`]);
    // Determine if the accusation is correct and set a winner if needed.
  };

  const Pass = (character) => {
    // Implement accusation logic here...
    setLogs(prevLogs => [...prevLogs, `${character}Pass!`]);
    // Determine if the accusation is correct and set a winner if needed.
  };


  return (
    <Container>
      <Row>
        <Col md={12}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {grid.flat().map((cell, index) => (
              <Button
                key={index}
                style={{
                  padding: '20px',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid black', // Add border to each cell
                }}
                onClick={() => moveCharacter(characters[currentTurn], cell)}
                disabled={cell === '' || (cell.includes('Hallway') && Object.values(positions).includes(cell))}
              >
                {cell}
                {Object.entries(positions).filter(([_, position]) => position === cell)
                  .map(([character]) => (
                    <div key={character} style={{ marginTop: '10px' }}>{character}</div>
                  ))}
              </Button>
            ))}
          </div>
        </Col>
        <Col md={5}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', border: '1px solid black' }}>
            Info Panel
            <div>Current Turn: {characters[currentTurn]}</div>
            <div>
              <Button 
              style={{ backgroundColor: 'Red', color: 'white', marginTop: '10px' }}
              onClick={() => {
                handleSuggestion(characters[currentTurn])
                navigate('/Suggestion');
              }
              }>Make Suggestion  </Button>
              <br></br>
              <Button 
              style={{ backgroundColor: 'Blue', color: 'white', marginTop: '10px' }}
              onClick={() => {
              handleAccusation(characters[currentTurn])
              navigate('/Acccusation');
            }
              }>Make Accusation  </Button>
              <br></br>
              <Button 
              style={{ backgroundColor: 'Green', color: 'white', marginTop: '10px' }}
              onClick={() => handleSuggestion(characters[currentTurn])}>Pass  </Button>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-5">
         <Col>
           <h4>Activity Logs:</h4>
           <ul>
             {logs.map((log, index) => <li key={index}>{log}</li>)}
           </ul>
         </Col>
       </Row>
    </Container>
  );
}


function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="/suggestion" element={<SuggestionPage />} />
      <Route path="/accusation" element={<AccusationPage />} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;