<template>
    <div @click="startEdit" class="editable">
        <slot v-if="!editing" class="slot"></slot>
        <form v-else @submit.prevent="$refs['input'].blur()">
            <input type="text" ref="input" v-model="contents" @blur="endEdit">
        </form>
    </div>
</template>

<script>
export default {
    name: "EditableText",
    data: function() {
        return {
            editing: false,
            contents: ""
        }
    },
    props: {
        varContained: {
            type: String,
            required: true
        }
    },
    methods: {
        startEdit: function() {
            if (!this.$parent.loading) {
                this.editing=true;
                this.$nextTick(() => this.$refs["input"].focus());
            }
        },
        endEdit: function() {
            this.editing = false;
            this.$emit('updateValue', {
                varToChange: this.varContained,
                newValue: this.contents
            });
        }
    },
    mounted: function() {
            this.contents = this.$el.children[0].innerHTML;
    } 
}
</script>

<style scoped>
.editable {
    cursor: pointer;
}
</style>