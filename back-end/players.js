const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const playerSchema = new mongoose.Schema( {
    playerName: String
})

const Player = mongoose.model('Player', playerSchema);

router.get('/', async(req, res) => {
    try {
        let players = await Player.find();
        res.send({players});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post('/', async(req, res) => {
    const player = new Player({
        playerName: req.body.playerName
    });
    try {
        await player.save();
        res.send({player: player});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.delete('/all', async(req, res) => {
    try {
        let players = await Player.find();
        players.forEach(async function(player) {
            await player.deleteOne({
                _id: player._id
            });
        })
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

module.exports = {
    routes: router
}