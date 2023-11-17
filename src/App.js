import React from 'react';
import Board from './components/Board'; // Make sure the path to Board.js is correct
import './App.css'; // Assuming you have an App.css for additional styles

function App() {
  return (
    <div className="App">
      <h1 className="text-center text-3xl font-bold my-5">Clue-Less Game</h1>
      <div className="max-w-6xl mx-auto">
        <Board />
      </div>
    </div>
  );
}

export default App;
