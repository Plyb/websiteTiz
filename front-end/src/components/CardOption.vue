<template>
    <div class="CardOption" :class="{'righteous': isDisciple, 'wicked': !isDisciple}">
        <h4>{{ name }}</h4>
        <h6>{{ surname }}</h6>
        <p><em>{{ desc }}</em></p>
        <a>
            <div @click="addCard" id="addButton" :class="{ disabled: this.$parent.loading, enabled: !this.$parent.loading}">
                +
            </div>
        </a>
    </div>
</template>

<script>
export default {
    name: "CardOption",
    props: {
        name: {
            type: String,
            required: true
        },
        surname: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            required: true
        },
        isDisciple: {
            type: Boolean,
            default: true
        },
        tags: {
            type: Array,
            required: true
        },
        canSee: {
            type: Array,
            required: true
        }
    },
    methods: {
        addCard: function() {
            let card = {
                name: this.name,
                surname: this.surname,
                desc: this.desc,
                isDisciple: this.isDisciple,
                tags: this.tags,
                canSee: this.canSee
            }
            this.$emit('addCard', card);
        }
    }
}
</script>

<style scoped>
.CardOption {
    border-style: solid;
    border-width: 2px;
    border-radius: 4px;
    padding: 1em;
    margin: 0.5em;
    
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    min-width: 9em;
}

.righteous {
    border-color: green;
}

.wicked {
    border-color: darkred;
}

h4 {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1.5em;
}

h6 {
    margin-top: 0;
    margin-bottom: 0.5em;
}

#addButton {
    border-radius: 10px;
    background-color: rgb(51, 192, 51);
    width: 2em;
    height: 2em;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: center;

    color: white;

    user-select: none;
}

#addButton:active {
    background-color: green;
}

.enabled {
    cursor: pointer;
}

.disabled {
    cursor: wait;
}
</style>