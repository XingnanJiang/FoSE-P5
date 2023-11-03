import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [positions, setPositions] = useState({
    'Miss Scarlet': 'start',
    'Prof. Plum': 'start',
    'Mrs. Peacock': 'start',
    'Mr. Green': 'start',
    'Mrs. White': 'start',
    'Col. Mustard': 'start',
  });

  const rooms = [
    'Study', 'Hall', 'Lounge',
    'Library', 'Billiard Room', 'Dining Room',
    'Conservatory', 'Ballroom', 'Kitchen'
  ];

  const [logs, setLogs] = useState([]);

  const moveCharacter = async (character, room) => {
    setPositions(prev => ({ ...prev, [character]: room }));
    try {
      const response = await axios.post('http://localhost:5000/move', {
        character,
        room
      });

      if (response.status === 200) {
        setPositions(prev => ({ ...prev, [character]: room }));
        setLogs(prevLogs => [...prevLogs, `Moved ${character} to ${room}`]);  // adding to logs
      }
    } catch (error) {
      console.error("Error moving character:", error);
    }
  }

  return (
    <Container>
      <Row>
        <Col md={7}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {rooms.map(room => (
              <div key={room} style={{ border: '1px solid black', padding: '20px' }}>
                {room}
                <br />
                {Object.entries(positions).map(([character, position]) => 
                  position === room ? <span key={character}>{character}<br /></span> : null
                )}
              </div>
            ))}
          </div>
        </Col>
        <Col md={5}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', border: '1px solid black' }}>
            Info Panel
            {Object.keys(positions).map(character => (
              <div key={character}>
                {character}
                <Button onClick={() => moveCharacter(character, 'Study')}>Move to Study</Button>
                <Button onClick={() => moveCharacter(character, 'Hall')}>Move to Hall</Button>
              </div>
            ))}
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

export default App;
