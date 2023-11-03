// src/components/Grid.js
import React from 'react';

const Grid = () => {
  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {Array(9).fill(null).map((_, index) => (
        <div key={index} className="border w-20 h-20"></div>
      ))}
    </div>
  );
}

export default Grid;
