const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/tiz', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}))

const cards = require("./cards.js");
app.use("/api/cards", cards.routes);

const players = require("./players.js");
app.use("/api/players", players.routes);

const game = require("./game.js");
app.use("/api/game", game.routes);

app.listen(3000, () => console.log('Server listening on port 3000!'));