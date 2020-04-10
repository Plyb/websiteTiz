<template>
    <div class="card" :class="{'righteous': isDisciple, 'wicked': !isDisciple}">
        <div class="header-bar">
            <EditableText varContained="name" @updateValue="updateValue">
                <h4>{{ name }}</h4>
            </EditableText>
            <a v-if="id" @click="removeButton">
                <div class="removeButton">
                    X
                </div>
            </a>
        </div>
        <EditableText varContained="surname" @updateValue="updateValue">
            <h6>{{ surname }}</h6>
        </EditableText>
        <div class="toggleable" @click="toggleDiscipleship">
            <h5 v-if="isDisciple">Righteous</h5>
            <h5 v-else>Wicked</h5>
        </div>
        <p>
            <EditableText varContained="desc" @updateValue="updateValue">
                <em>{{ desc }}</em>
            </EditableText>
        </p>
        <ul>
            Tags:
            <div v-for="tag in tags" :key="tag" class="tag">
                <li>{{ tag }}</li>
                <div class="deleteTag" @click="removeTag(tag)">
                    <strong>–</strong>
                </div>
            </div>
            <li class="toggleable" v-if="!editingTag" @click="startEditTag"><strong>+</strong></li>
            <form v-else @submit.prevent="$refs['newTag'].blur()">
                <input type="text" ref="newTag" v-model="newTag" @blur="endEditTag">
            </form>
            
        </ul>
        <ul>
            Can see:
            <div v-for="visibleTag in canSee" :key="visibleTag" class="tag">
                <li>{{ visibleTag }}</li>
                <div class="deleteTag" @click="removeCanSee(visibleTag)">
                    <strong>–</strong>
                </div>
            </div>
            <li class="toggleable" v-if="!editingCanSee" @click="startEditCanSee"><strong>+</strong></li>
            <form v-else @submit.prevent="$refs['newCanSee'].blur()">
                <input type="text" ref="newCanSee" v-model="newCanSee" @blur="endEditCanSee">
            </form>
        </ul>
    </div>
</template>

<script>
import EditableText from "@/components/EditableText.vue";

export default {
    name: "Card",
    components: {
        EditableText
    },
    props: {
        id: {
            type: String,
            required: true
        },
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
    data: function() {
        return {
            editingTag: false,
            newTag: "",
            editingCanSee: false,
            newCanSee: ""
        }
    },
    methods: {
        removeButton: function() {
            this.$emit('removeCard', this.id);
        },
        updateValue: function(update) {
            update.id = this.id;
            this.$emit('updateValue', update);
        },
        toggleDiscipleship() {
            this.$emit('toggleDiscipleship', this.id);
        },
        removeTag(tag) {
            this.$emit('removeTag', {'type': 'tags', 'tag': tag, 'id': this.id});
        },
        removeCanSee(tag) {
            this.$emit('removeTag', {'type': 'canSee', 'tag': tag, 'id': this.id});
        },
        startEditTag() {
            this.editingTag = true;
            this.newTag = "";
            this.$nextTick(() => this.$refs['newTag'].focus());
        },
        endEditTag() {
            this.$emit('newTag', {'type': 'tags', 'tag': this.newTag, 'id': this.id});
            this.editingTag = false;
        },
        startEditCanSee() {
            this.editingCanSee = true;
            this.newCanSee = "";
            this.$nextTick(() => this.$refs['newCanSee'].focus());
        },
        endEditCanSee() {
            this.$emit('newTag', {'type': 'canSee', 'tag': this.newCanSee, 'id': this.id});
            this.editingCanSee = false;
        },
    }
}
</script>

<style scoped>
.card {
    border-style: solid;
    border-width: 2px;
    border-radius: 4px;
    padding: 1em;
    margin: 0.5em;
    
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;

    min-width: 12em;
}

.righteous {
    border-color: green;
}

.wicked {
    border-color: darkred;
}

.header-bar {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.tag {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.removeButton {
    border-radius: 5px;
    background-color: rgb(192, 51, 51);
    width: 1em;
    height: 1em;
    margin: auto;

    padding: 3px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: white;

    cursor: pointer;
    user-select: none;
}

.deleteTag {
    color:  rgb(192, 51, 51);
    margin-left: auto;
    margin-right: 1em;

    cursor: pointer;
}

.toggleable {
    cursor: pointer;
}

h4 {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1.5em;
}

h6, h5 {
    margin-top: 0;
    margin-bottom: 0.5em;
}

ul {
    list-style: disc inside none; 
    margin-left: 0; 
    padding-left: 1em;
    text-align: left;
    width: 100%;
}
li {
    padding-left: 1em;
}
</style>