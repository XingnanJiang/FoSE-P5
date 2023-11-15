import React from 'react';

const Controls = () => {
    const makeSuggestion = () => {
        alert('Suggestion made!');
    };

    const makeAccusation = () => {
        alert('Accusation made!');
    };

    return (
        <div className="game-controls">
            <button onClick={makeSuggestion}>Make Suggestion</button>
            <button onClick={makeAccusation}>Make Accusation</button>
        </div>
    );
};

export default Controls;
