import React from 'react';
import Room from './Room';
import Hallway from './Hallway';

const GameBoard = () => {
    const boardElements = [];

    for (let i = 0; i < 9; i++) {
        boardElements.push(i % 2 === 0 ? <Room key={i} id={i} /> : <Hallway key={i} id={i} />);
    }

    return (
        <div className="game-board">
            {boardElements}
        </div>
    );
};

export default GameBoard;
