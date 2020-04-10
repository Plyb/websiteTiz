<template>
    <div>
        <div class="questbar">
            <div v-for="(quest, index) in game.quests" :key="index" :class="['quest', {'doubleFail': quest.doubleFail, 'succeeded': quest.succeeded === 1, 'failed': quest.succeeded === - 1}]">{{ quest.numPlayers }}</div>
        </div>
        <div class="player-list">
            <h3>Role: {{playerInfo.cardName}}</h3>
            <h5><span class="redDot">●</span> You can see: {{displayCanSee}}</h5>
            <div v-for="(player, index) in players" :key="index" @click="select(index)" :class="[{'selected': players[index].selected, 'clickable': myTurn && game.phase === 'nomination' && (remainingSelections || players[index].selected)}]">
                <span class="redDot" v-if="player.visible">●</span> {{ player.name }}
            </div>
        </div>
        <div class="action-bar">
            <div v-if="game.phase === 'nomination'">
                <div v-if="myTurn">
                    <p v-if="remainingSelections > 0">Select {{ remainingSelections }} more player(s), then click sumbit</p>
                    <button @click="advanceToApproval" :disabled="remainingSelections !== 0">Submit</button>
                </div>
                <div v-else>
                    Please wait while {{ players[game.turn].name }} nominates people to go on the quest.
                </div>
            </div>
            <div v-if="game.phase === 'approval'">
                <p>Do you approve of this team?</p>
                <div class="options" v-if="!submitted">
                    <button @click="submitApproval(true)">yes</button>
                    <button @click="submitApproval(false)">no</button>
                </div>
                <p v-else>Submitted</p>
                <p>{{numVotes}}/{{players.length}} players have voted</p>
            </div>
            <div v-if="game.phase === 'quest'">
                <div v-if="onQuest">
                    <p>You're on the quest. Put in your choice.</p>
                    <div v-if="!submitted" class="options">
                        <button @click="submitQuestCard(true)">succeed</button>
                        <button @click="submitQuestCard(false)" v-if="!playerInfo.isDisciple">fail</button>
                    </div>
                    <div v-else>Submitted</div>
                </div>
                <div v-else>
                    Please wait while the others go on the quest
                </div>
            </div>
            <div v-if="game.phase === 'review'">
                <p>Quest {{ successStatement }} with {{ numFails }} fail(s)</p>
                <button v-if="myTurn" @click="advanceToNomination">Continue</button>
                <p>{{ endStatement }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Vue from 'vue';

export default {
    name: "Game",
    data: function() {
        return {
            players: [],
            playerInfo: [],
            updater: undefined,
            submitted: false,
            numVotes: 0,
            numFails: 0
        }
    },
    created: async function() {
        this.loadData();
        let self = this;
        this.updater = setInterval(function() {
            self.loadData();
        }, 5000);

        let res = await axios.get('/api/cards/one/' + this.$root.$data.playerName);
        this.playerInfo = res.data.card;

        res = await axios.get('/api/cards/cansee', {params: {canSee: this.playerInfo.canSee}});
        this.players = res.data.players;
        this.players.sort(function(a, b) {
            return a.order - b.order;
        })
    },
    computed: {
        displayCanSee: function() {
            let display = "";
            if (this.playerInfo.canSee != undefined) {
                for (let i = 0; i < this.playerInfo.canSee.length; i++) {
                    display += this.playerInfo.canSee[i];
                    if (i != this.playerInfo.canSee.length - 1) {
                        display += ", ";
                    }
                }
            }
            else {
                display = "No one";
            }
            return display;
        },
        game: function() {
            return this.$root.$data.game;
        },
        myTurn: function() {
            if (this.players[this.game.turn]) {
                return this.players[this.game.turn].name === this.playerInfo.playerName;
            }
            else {
                return false;
            }
        },
        remainingSelections: function() {
            let totalSelections = this.game.quests[this.game.currentQuest].numPlayers;
            let playersSelected = this.players.filter(player => player.selected).length;

            return totalSelections - playersSelected;
        },
        onQuest: function() {
            let myIndex = this.players.findIndex(player => player.name === this.playerInfo.playerName);
            if (this.players[myIndex].selected) {
                return true;
            }
            return false;
        },
        successStatement: function() {
            if (this.numFails < (this.game.quests[this.$root.$data.game.currentQuest - 1].doubleFail + 1)) {
                return "succeeded";
            }
            else {
                return "failed";
            }
        },
        numSuccesses: function() {
            return this.game.quests.filter(quest => quest.succeeded === 1).length;
        },
        numFailures: function() {
            return this.game.quests.filter(quest => quest.succeeded === -1).length;
        },
        endStatement: function() {
            if (this.numSuccesses >= 3) {
                return "The Righteous have won!";
            }
            else if (this.numFailures >= 3) {
                return "The Wicked have won!";
            }
            else {
                return "";
            }
        }
    },
    methods: {
        async select(index) {
            if (this.myTurn && (this.players[index].selected || this.remainingSelections > 0)) {
                Vue.set(this.players[index], 'selected', !this.players[index].selected);

                let selectedIndices = [];
                for (let i = 0; i < this.players.length; i++) {
                    if (this.players[i].selected) {
                        selectedIndices.push(i);
                    }
                }

                try {
                    await axios.put('/api/game/selected', selectedIndices);
                }
                catch (error) {
                    console.log(error);
                }
            }
        },
        async advanceToApproval() {
            let selectedIndices = [];
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].selected) {
                    selectedIndices.push(i);
                }
            }

            try {
                await axios.put('/api/game/selected', selectedIndices);
                await axios.put('api/game/approval/reset');
                await this.loadData();
                await axios.put('/api/game/phase', {phase: 'approval'});
                this.loadData();
            }
            catch (error) {
                console.log(error);
            }
        },
        async submitApproval(vote) {
            this.submitted = true;

            await this.loadData();

            this.numVotes++;
            let final = this.numVotes === this.players.length;
            try {
                let res = await axios.put('/api/game/approval', {vote: vote, numPlayers: this.players.length});
                let yeas = res.data.yeas
                if (final) {
                    if (yeas > this.players.length / 2) {
                        await axios.put('api/game/phase', {phase: 'quest'});
                    }
                    else {
                        await this.advanceToNomination();
                    }
                }
                await this.loadData();
            }
            catch (error) {
                console.log(error)
            }
        },
        async submitQuestCard(vote) {
            this.submitted = true;

            await this.loadData();

            try {
                let res = await axios.put('/api/game/quest', {vote: vote});
                let final = res.data.final;

                console.log("final:", final);

                if (final) {
                    await axios.put('api/game/selected', []);
                    await axios.put('api/game/phase', {phase: 'review'});


                    this.$root.$data.game.currentQuest++;
                    let res = await axios.get('/api/game/fails');
                    this.numFails = res.data.numFails;
                    console.log(this.$root.$data.currentQuest);
                    if (this.successStatement === "succeeded") {
                        await axios.put('/api/game/quest/status', {succeeded: true});
                    }
                    else {
                        await axios.put('/api/game/quest/status', {succeeded: false});
                    }


                    this.loadData();
                }
            }
            catch (error) {
                console.log(error);
            }
        },
        async advanceToNomination() {
            console.log(this.endStatement !== "");
            if (this.endStatement !== "") {
                clearInterval(this.updater);
                await axios.delete('api/game');
                this.$router.push({name: "Home"});
            }
            else {
                await axios.put('api/game/selected', []);
                await axios.put('api/game/nextTurn', {numPlayers: this.players.length});
                await axios.put('api/game/phase', {phase: 'nomination'});
                this.loadData();
            }
        },
        async loadData() {
            if ((!this.myTurn && this.game.phase === "nomination") || this.game.phase === 'approval') {
                let res = await axios.get('/api/game/selected');
                let selectedIndices = res.data.selected;

                this.players.forEach(player => {
                    Vue.set(player, 'selected', false);
                })

                selectedIndices.forEach(index => {
                    Vue.set(this.players[index], 'selected', true);
                });
            }

            if (this.game.phase === "approval") {
                let res = await axios.get('/api/game/approval');
                this.numVotes = res.data.votes;
            }

            if (this.game.phase === "review") {
                let res = await axios.get('/api/game/fails');
                this.numFails = res.data.numFails;
            }

            let res = await axios.get('/api/game/turn');
            this.$root.$data.game.turn = res.data.turn;

            res = await axios.get('/api/game/quests');
            this.$root.$data.game.quests = res.data.quests;

            let oldPhase = this.game.phase;
            res = await axios.get('/api/game/phase');
            this.$root.$data.game.phase = res.data.phase;
            if (oldPhase != this.$root.$data.game.phase) {
                this.submitted = false;
                if (this.$root.$data.game.phase === "nomination") {
                    this.players.forEach(player => {
                        player.selected = false;
                    });
                    if (oldPhase === 'review') {
                        this.$root.$data.game.currentQuest++;
                    }
                }
                res = await axios.get('api/game');
                this.$root.$data.game = res.data.game;
                this.loadData();
            }
        }
    }
}
</script>

<style scoped>
.questbar {
    display: flex;
    flex-direction: row;
    justify-content: space-around;

    background-color: white;
    padding: 1em;
    border-bottom: 2px solid black;
}

.quest {
    border-style: solid;
    border-width: 2px;
    border-radius: 50%;
    padding: 0.5em 1em 0.5em 1em;
}

.succeeded {
    background-color: rgb(109, 196, 109);
}

.failed {
    background-color: rgb(214, 114, 114);
}

.doubleFail {
    border-color: coral;
}

.player-list {
    background-color: white;
    margin-top: 1em;
    border-top: 2px solid black;
    border-bottom: 2px solid black;
    padding: 0.5em;
}

.action-bar {
    background-color: white;
    margin-top: 1em;
    border-top: 2px solid black;
    border-bottom: 2px solid black;
    padding: 0.5em;
}

.clickable {
    cursor: pointer;
    border-style: solid;
    border-width: 2px;
    border-color: black;
    border-radius: 1em;

    user-select: none;
}

.selected {
    background-color: rgb(141, 224, 116);
}

.options {
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.redDot {
    color: darkred
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

p {
    padding: 0.5em;
}
</style>