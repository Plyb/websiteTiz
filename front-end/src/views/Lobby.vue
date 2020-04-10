<template>
    <div id="lobby">
        <div class="header">
            <h2>Your name: {{ playerName }}</h2>
            <h3>Players: <span v-for="player in players" :key="player">{{ player }} </span></h3>
        </div>
        <h3 class="label">Deck</h3>
        <div id="addCardBar" class="cardBar">
            <CardOption @addCard="addCard"
                :name="'Nephi'" 
                :surname="'Son of Nephi'" 
                :desc="'Prophet (sees the wicked)'"
                :isDisciple="true"
                :tags="['prophet']"
                :canSee="['visible to prophets']"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Pahoran'" 
                :surname="'Son of Pahoran'" 
                :desc="'Follower of the Prophets'"
                :isDisciple="true"
                :tags="[]"
                :canSee="['prophet']"
            ></CardOption>
             <CardOption @addCard="addCard"
                :name="'Disciple'" 
                :surname="'of Christ'" 
                :desc="'An everyday Christian'"
                :isDisciple="true"
                :tags="[]"
                :canSee="[]"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Gadianton'" 
                :surname="'The Robber Captain'" 
                :desc="'Unknown to Nephi'"
                :isDisciple="false"
                :tags="['robber']"
                :canSee="['robber']"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Kishkumen'" 
                :surname="'The Assassin'" 
                :desc="'Tries to kill Nephi'"
                :isDisciple="false"
                :tags="['robber','assassin','visible to prophets']"
                :canSee="['robber']"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Paanchi'" 
                :surname="'Son of Pahoran'" 
                :desc="'False prophet'"
                :isDisciple="false"
                :tags="['robber','visible to prophets','prophet']"
                :canSee="['robber']"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Coriantumr'" 
                :surname="'King of the Lamanites'" 
                :desc="'Wicked, but not a robber'"
                :isDisciple="false"
                :tags="['visible to prophets']"
                :canSee="[]"
            ></CardOption>
            <CardOption @addCard="addCard"
                :name="'Robber'" 
                :surname="'of the Gadianton Band'" 
                :desc="'A Gadianton Robber'"
                :isDisciple="false"
                :tags="['robber','visible to prophets']"
                :canSee="['robber']"
            ></CardOption>
        </div>
        <h3 class="label">In Play</h3>
        <div id="addedCards" class="cardBar">
            <Card v-for="(card, index) in cards" :key="index" @removeCard="removeCard" @updateValue="updateValue" @toggleDiscipleship="toggleDiscipleship" @removeTag="removeTag" @newTag="newTag"
                :id = card.id
                :name = card.name
                :surname = card.surname
                :desc = card.desc
                :isDisciple = card.isDisciple
                :tags = card.tags
                :canSee = card.canSee
            ></Card>
        </div>

        <div class="start-game">
            <p>Instructions: Add cards from the deck to the In Play area. You can edit the cards by clicking the text. A good balance is to have a little over a third of the cards be wicked.</p>
            <button :disabled="errorMessage !== ''" @click="beginGame">Start Game</button>
            <p class="error">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import CardOption from "@/components/CardOption.vue";
import Card from "@/components/Card.vue";
import axios from "axios";

export default {
    name: "Lobby",
    components: {
        CardOption,
        Card
    },
    data: function() {
        return {
            cards: [],
            loading: false,
            updater: {}
        }
    },
    methods: {
        async addCard(card) {
            this.loading = true;
            try {
                let newCard = await axios.post("/api/cards", {
                    name: card.name,
                    surname: card.surname,
                    desc: card.desc,
                    isDisciple: card.isDisciple,
                    tags: card.tags,
                    canSee: card.canSee
                });
                newCard.data.card.id = newCard.data.card._id;
                newCard.data.card.name = newCard.data.card.cardName;
                newCard.data.card.surname = newCard.data.card.cardSurname;
                this.cards.push(newCard.data.card);
            }
            catch (error) {
                console.log(error);
            }
        },
        async removeCard(id) {
            this.loading = true;
            try {
                let indexToRemove = this.cards.findIndex(function(card) {
                    return card.id === id;
                });
                this.cards.splice(indexToRemove, 1);
                await axios.delete("/api/cards/" + id);
            }
            catch (error) {
                console.log(error);
            }
        },
        async loadData() {
            try {
                let resGame = await axios.get("/api/game");
                this.$root.$data.game = resGame.data.game;
                this.tryEnterGame();

                if (!this.loading) {
                    let resCards = await axios.get("/api/cards");
                    resCards.data.cards.forEach(card => {
                        card.id = card._id;
                        card.name = card.cardName;
                        card.surname = card.cardSurname;
                    });


                    let resPlayers = await axios.get("/api/players");


                    this.cards = resCards.data.cards;
                    if (this.cards.length > 0 && this.cards[0].order != undefined) {
                        this.cards.sort(function(a, b) {
                            return a.order - b.order;
                        })
                    }
                    this.$root.$data.players = resPlayers.data.players.map(player => player.playerName);
                }
                this.loading = false;
            }
            catch (error) {
                console.log(error);
            }
        },
        async updateValue(update) {
            this.loading = true;
            let card = this.cards.find((card) => {
                return card.id === update.id;
            });
            card[update.varToChange] = update.newValue;

            if (update.varToChange === "name") {
                update.varToChange = "cardName";
            }
            if (update.varToChange === "surname") {
                update.varToChange = "cardSurname";
            }
            let changeToPush = {};
            changeToPush[update.varToChange] = update.newValue;
            try {
                await axios.put("/api/cards/" + update.id, changeToPush);
            }
            catch (error) {
                console.log(error);
            }
        },
        async toggleDiscipleship(id) {
            this.loading = true;
            try {
                let indexToToggle = this.cards.findIndex(function(card) {
                    return card.id === id;
                });
                this.cards[indexToToggle].isDisciple = !this.cards[indexToToggle].isDisciple;
                await axios.put("/api/cards/" + id, {
                    isDisciple: this.cards[indexToToggle].isDisciple
                });
            }
            catch (error) {
                console.log(error);
            }
        },
        async removeTag(info) {
            this.loading = true;
            let cardIndex = this.cards.findIndex(function(card) {
                return card.id === info.id;
            })
            let tagIndex = this.cards[cardIndex][info.type].findIndex(function(tag) {
                return tag === info.tag;
            });
            this.cards[cardIndex][info.type].splice(tagIndex, 1);
            let update = {};
            update[info.type] = this.cards[cardIndex][info.type];
            try {
                await axios.put("/api/cards/" +  info.id, update);
            }
            catch (error) {
                console.log(error);
            }
        },
        async newTag(info) {
            this.loading = true;
            let cardIndex = this.cards.findIndex(function(card) {
                return card.id === info.id;
            })
            this.cards[cardIndex][info.type].push(info.tag);
            let update = {};
            update[info.type] = this.cards[cardIndex][info.type];
            try {
                await axios.put("/api/cards/" +  info.id, update);
            }
            catch (error) {
                console.log(error);
            }
        },
        beginGame: async function() {
            try {
                await axios.put('/api/game/setupQuests', {numPlayers: this.$root.$data.players.length});
                let res = await axios.put('/api/game', {phase: "nomination"})
                this.$root.$data.game = res.data.game;
                this.loadData();
                await axios.put('/api/cards/shuffle', this.$root.$data.players);
                this.tryEnterGame();
            }
            catch (error) {
                console.log(error);
            }
        },
        tryEnterGame: function() {
            if (this.$root.$data.game.phase != "lobby") {
                clearInterval(this.updater);
                if (this.$router.currentRoute != 'game') {
                    this.$router.push('game');
                }
            }
        }
    },
    created: function() {
        this.loadData();
        let self = this;
        this.updater = setInterval(function() {
            self.loadData();
        }, 5000);
    },
    computed: {
        players: function() {
            return this.$root.$data.players;
        },
        playerName: function() {
            return this.$root.$data.playerName;
        },
        errorMessage: function() {
            let errorMessage = "";
            if (this.players.length != this.cards.length) {
                errorMessage += "You must have the same number of Cards as players. "
            }
            let assassinCount = 0;
            for (let i = 0; i < this.cards.length; i++) {
                if (this.cards[i].tags.findIndex(tag => tag === "assassin") != -1) {
                    assassinCount++;
                }
            }
            if (assassinCount != 1) {
                errorMessage += "There must be exactly one card with the 'assassin' tag. "
            }
            if (this.players.length < 5 || this.players.length > 10) {
                errorMessage += "There must be 5-10 players. "   
            }
            return errorMessage;
        }
    }
}
</script>

<style scoped>
#lobby {
    background-color: khaki;
    height: 100%
}
h2 {
    font-size: 2em;
}

p {
    padding-left: 0.5em;
    padding-right: 0.5em;
}

.header {
    padding: 2em;
    margin-bottom: 1em;
    background-color: white;
    border-bottom: 2px solid black;
}

.label {
    padding-top: 0.5em;
    background-color: white;
    border-style: solid;
    border-color: black;
    border-width: 2px 2px 0px 2px;
}

.cardBar {
    background-color: white;
    margin-bottom: 1em;

    padding: 0.5em;
    border-style: solid;
    border-color: black;
    border-width: 0px 2px 2px 2px;
    min-height: 15em;

    display: flex;

    overflow: auto;
}

.start-game {
    background-color: white;
    border-top: 2px solid black;
    border-bottom: 2px solid black;
    padding-top: 0.5em;
}

button, .button {
  margin: 1em;
  padding: 5px;
  border-radius: 10px;
  border-color: white;
  border-width: 2px;
  border-image: none;
  border-style: solid;
}

button:disabled, .button:disabled {
  background-color: lightgray;
}

button:enabled, .button:enabled {
  background-color: khaki;
  cursor: pointer;
  user-select: none;
}

button:focus, .button:focus {
  outline:0;
}

button:active, .button:active {
  background-color: gold;
}

.error {
    color: darkred;
}
</style>