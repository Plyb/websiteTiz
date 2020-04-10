const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const gameSchema = new mongoose.Schema({
    running: {
        type: Boolean,
        default: true
    },
    phase: {
        type: String
    },
    turn: {
        type: Number
    },
    quests: {
        type: Array
    },
    currentQuest: {
        type: Number
    },
    selected: {
        type: Array
    },
    approvals: {
        type: Number
    },
    votes: {
        type: Number
    },
    numFinishedQuest: {
        type: Number
    },
    numFails: {
        type: Number
    }
})

const Game = mongoose.model('Game', gameSchema);

router.get('/', async(req, res) => {
    try {
        let game = await Game.findOne();
        res.send({game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/selected', async(req, res) => {
    try {
        let game = await Game.findOne();
        let selected = game.selected;
        res.send({selected});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/phase', async(req, res) => {
    try {
        let game = await Game.findOne();
        let phase = game.phase;
        res.send({phase});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/approval', async(req, res) => {
    try {
        let game = await Game.findOne();
        let votes = game.votes;
        res.send({votes: votes});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/turn', async(req, res) => {
    try {
        let game = await Game.findOne();
        let turn = game.turn;
        res.send({turn: turn});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/quests', async(req, res) => {
    try {
        let game = await Game.findOne();
        let quests = game.quests;
        res.send({quests: quests});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/fails', async(req, res) => {
    try {
        let game = await Game.findOne();
        let numFails = game.numFails;
        res.send({numFails: numFails});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post('/', async(req, res) => {
    const game = new Game({
        running: true,
        phase: "lobby",
        turn: 0,
        currentQuest: 0,
        quests: [],
        selected: [],
        approvals: 0,
        votes: 0,
        numFinishedQuest: 0,
        numFails: 0
    });
    try {
        let games = await Game.find();
        await games.forEach(async function(game) {
            await Game.deleteOne({
                _id: game._id
            });
        })
        await game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/', async(req, res) => {
    try {
        let game = await Game.findOne();
        game = Object.assign(game, req.body);

        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/quest/status', async(req, res) => {
    try {
        let game = await Game.findOne();

        if (req.body.succeeded) {
            game.quests[game.currentQuest - 1].succeeded = 1;
        }
        else {
            game.quests[game.currentQuest - 1].succeeded = -1;
        }
        game.markModified('quests');

        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/setupQuests', async(req, res) => {
    try {
        let game = await Game.findOne();
        let numPlayers = req.body.numPlayers;

        let quests = []
        switch (req.body.numPlayers) {
            case 5:
                quests = [
                    {numPlayers: 2, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 2, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0}
                ];
                break;
            case 6:
                quests = [
                    {numPlayers: 2, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0}
                ];
                break;
            case 7:
                quests = [
                    {numPlayers: 2, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: true, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0}
                ];
                break;
            case 8:
                quests = [
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 5, doubleFail: true, succeeded: 0},
                    {numPlayers: 5, doubleFail: false, succeeded: 0}
                ];
                break;
            case 9:
                quests = [
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 5, doubleFail: true, succeeded: 0},
                    {numPlayers: 5, doubleFail: false, succeeded: 0}
                ];
                break;
            case 10:
                quests = [
                    {numPlayers: 3, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 4, doubleFail: false, succeeded: 0},
                    {numPlayers: 5, doubleFail: true, succeeded: 0},
                    {numPlayers: 5, doubleFail: false, succeeded: 0}
                ];
                break;
            default:
                quests = [
                    {numPlayers: 1, doubleFail: false, succeeded: 0},
                    {numPlayers: 1, doubleFail: false, succeeded: 0},
                    {numPlayers: 1, doubleFail: false, succeeded: 0},
                    {numPlayers: 1, doubleFail: true, succeeded: 0},
                    {numPlayers: 1, doubleFail: false, succeeded: 0}
                ];
                break;
        }

        game.quests = quests;

        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/selected', async(req, res) => {
    try {
        let game = await Game.findOne();
        game.selected = req.body;
        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/phase', async(req, res) => {
    try {
        let game = await Game.findOne();
        game.phase = req.body.phase;
        if (game.phase === "approval") {
            game.approvals = 0;
        }
        if (game.phase === "quest") {
            game.numFinishedQuest = 0;
            game.numFails = 0;
        }
        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/approval', async(req, res) => {
    try {
        let game = await Game.findOne();

        game.votes++;
        if (req.body.vote) {
            game.approvals++;
        }

        if (game.votes >= req.body.numPlayers) {
            if (game.approvals > req.body.numPlayers / 2) {
                game.phase = "quest";
            }
            else {
                game.selected = [];
                game.turn = (game.turn + 1) % req.body.numPlayers;
                game.phase = "nomination";
            }
        }

        game.save();
        res.send({yeas: game.approvals});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/approval/reset', async(req, res) => {
    try {
        let game = await Game.findOne();

        game.votes = 0;
        game.approvals = 0;

        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/nextTurn', async(req, res) => {
    try {
        let game = await Game.findOne();
        game.turn = (game.turn + 1) % req.body.numPlayers;
        game.save();
        res.send({game: game});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/quest', async(req, res) => {
    try {
        let game = await Game.findOne();
        
        game.numFinishedQuest++;
        if(!req.body.vote) {
            game.numFails++
        }

        let final = false;
        if (game.numFinishedQuest === game.quests[game.currentQuest].numPlayers) {
            final = true;
            game.currentQuest++
        }

        game.save();
        res.send({final: final});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.delete('/', async(req, res) => {
    try {
        await Game.deleteOne();
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