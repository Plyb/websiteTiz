const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const cardSchema = new mongoose.Schema({
    playerName: String,
    cardName: String,
    cardSurname: String,
    desc: String,
    isDisciple: Boolean,
    tags: Array,
    canSee: Array,
    order: Number
})


const Card = mongoose.model('Card', cardSchema);

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

router.get('/', async(req, res) => {
    try {
        let cards = await Card.find();
        res.send({cards});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.get('/one/:name', async(req, res) => {
    try {
        let card = await Card.findOne({
            playerName: req.params.name
        })
        res.send({card: card});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.get('/cansee', async(req, res) => {
    let players = [];
    try {
        let cards = await Card.find();
        
        for (let i = 0; i < cards.length; i++) {
            let overlap = [];
            if (req.query.canSee) {
                overlap = cards[i].tags.filter(tag => req.query.canSee.includes(tag));
            }
            if (overlap.length > 0) {
                players.push({
                    name: cards[i].playerName,
                    visible: true,
                    order: cards[i].order
                });
            }
            else {
                players.push({
                    name: cards[i].playerName,
                    visible: false,
                    order: cards[i].order
                });
            }
        }

        res.send({players: players});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.post('/', async(req, res) => {
    const card = new Card({
        playerName: '',
        cardName: req.body.name,
        cardSurname: req.body.surname,
        desc: req.body.desc,
        isDisciple: req.body.isDisciple,
        tags: req.body.tags,
        canSee: req.body.canSee,
        order: undefined
    });
    try {
        await card.save();
        res.send({card:card});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.put('/shuffle', async(req, res) => {
    try {
        let cards = await Card.find();

        cards = shuffle(cards);
        for (let i = 0; i < cards.length; i++) {
            cards[i].order = i;
        }

        let players = shuffle(req.body);

        for(let i = 0; i < players.length; i++) {
            cards[i].playerName = players[i];
        }
        await cards.forEach(card => card.save());
        res.send({cards: cards});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.put('/:id', async (req, res) => {
    try {
        let card = await Card.findOne({
            _id: req.params.id
        });
        card = Object.assign(card, req.body);
        await card.save();
        res.send({card:card});
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.delete('/all', async (req, res) => {
    try {
        let cards = await Card.find();
        cards.forEach(async function(card) {
            await Card.deleteOne({
                _id: card._id
            });
        })
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await Card.deleteOne({
            _id: req.params.id
        });
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