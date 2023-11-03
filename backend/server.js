const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;  // You can change this to your preferred port

// This will act as our fake database
let database = [];

app.use(cors());  // Allow cross-origin requests (important for local development)
app.use(bodyParser.json());  // Parse incoming JSON payloads

app.post('/move', (req, res) => {
    const { character, room } = req.body;

    // Storing in our fake database
    database.push({ character, room });
    
    console.log(`Moved ${character} to ${room}`);
    console.log("Current database:", database);

    res.status(200).send({ message: 'Successfully moved character!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
