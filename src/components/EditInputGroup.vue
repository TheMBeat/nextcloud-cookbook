<template>
    <fieldset>
        <label>{{ fieldLabel }}</label>
        <ul ref="list">
            <li :class="fieldType" v-for="(entry,idx) in $parent.recipe[fieldName]" :key="fieldName+idx">
                <div v-if="fieldName==='recipeInstructions'" class="step-number">{{ parseInt(idx) + 1 }}</div>
                <input v-if="fieldType==='text'" type="text" @keyup="keyPressed" :value="$parent.recipe[fieldName][idx]" v-on:input="handleFieldChange" @paste="handlePaste" />
                <textarea v-else-if="fieldType==='textarea'" :value="$parent.recipe[fieldName][idx]" v-on:input="handleFieldChange" @paste="handlePaste"></textarea>
                <div class="controls">
                    <button class="icon-arrow-up" @click="moveUp(idx)"></button>
                    <button class="icon-arrow-down" @click="moveDown(idx)"></button>
                    <button class="icon-delete" @click="deleteEntry(idx)"></button>
                </div>
            </li>
        </ul>
        <button class="button add-list-item" @click="addNew()"><span class="icon-add"></span> {{ t('cookbook', 'Add') }}</button>
    </fieldset>
</template>

<script>
export default {
    name: "EditInputGroup",  
    props: {
        fieldType: String,
        fieldName: String,
        fieldLabel: String,
        // If true, add new fields, for newlines in pasted data
        createFieldsOnNewlines: {
            type: Boolean,
            default: false
        },
    },
    data () {
        return {
            // helper variables
            contentPasted: false
        }
    },
    methods: {
        /* if index = -1, element is added at the end
         * if focusAfterInsert=true, the element is focussed after inserting
         * the content is inserted into the newly created field
         **/
        addNew: function(index = -1, focusAfterInsert = true, content = '') {
            if (index === -1) {
                index = this.$parent.recipe[this.fieldName].length
            }
            this.$parent.addEntry(this.fieldName, index, content)

            if (focusAfterInsert) {
                let $ul = $(this.$refs['list'])
                let $this = this
                this.$nextTick(function() {
                    if ($ul.children('li').length > index) {
                        if ($this.fieldType === 'text') {
                            $ul.children('li').eq(index).find('input').focus()
                        } else if ($this.fieldType === 'textarea') {
                            $ul.children('li').eq(index).find('textarea').focus()
                        }
                    }
                })
            }
        },
        /**
         * Delete an entry from the list
         */
        deleteEntry: function(idx) {
            this.$parent.deleteEntry(this.fieldName, idx)
        },
        /** 
         * Handle typing in input or field or textarea
         */
        handleFieldChange: function(e) {  
            // wait a tick to check if content was typed or pasted
            this.$nextTick(function() {
                if (this.contentPasted) {
                    this.contentPasted = false
                    return
                }
                let $li = $(e.currentTarget).parents('li')
                this.$parent.recipe[this.fieldName][$li.index()] = e.target.value
            })
        },
        /** 
         * Handle paste in input field or textarea
         */
        handlePaste: function(e) {
            this.contentPasted = true
            if (!this.createFieldsOnNewlines) {
                return
            }

            // get data from clipboard to keep newline characters, which are stripped
            // from the data pasted in the input field (e.target.value)
            var clipboardData = e.clipboardData || window.clipboardData
            var pastedData = clipboardData.getData('Text')

            let input_lines_array = pastedData.split(/\r\n|\r|\n/g)
            if ( input_lines_array.length == 1) {
                return
            }
            e.preventDefault()

            let $li = $(e.currentTarget).parents('li')
            let $inserted_index = $li.index()
            let $ul = $li.parents('ul')

            // Remove empty lines
            for (let i = input_lines_array.length-1; i >= 0; --i)
            {
                if (input_lines_array[i].trim() == '') {
                    input_lines_array.splice(i, 1)
                }
            }
            for (let i = 0; i < input_lines_array.length; ++i)
            {
                this.addNew($inserted_index+i+1, false, input_lines_array[i])
            }
            this.$nextTick(function() {
                let indexToFocus = $inserted_index+input_lines_array.length
                // Delete field if it's empty
                if (this.$parent.recipe[this.fieldName][$inserted_index].trim() == "" ) {
                    this.deleteEntry($inserted_index)
                    indexToFocus--
                }
                $ul.children('li').eq(indexToFocus).find('input').focus()
                this.contentPasted = false
            })
        },
        /**
         * Catches enter and key down presses and either adds a new row or focuses the one below
         */
        keyPressed(e) {
            // Using keyup for trigger will prevent repeat triggering if key is held down
            if (e.keyCode === 13 || e.keyCode === 10) {
                e.preventDefault()
                let $li = $(e.currentTarget).parents('li')
                let $ul = $li.parents('ul')
                if ($li.index() >= $ul.children('li').length - 1) {
                    this.addNew()
                } else {
                    $ul.children('li').eq($li.index() + 1).find('input').focus()
                }
            }
        },
        moveDown: function(idx) {
            this.$parent.moveEntryDown(this.fieldName, idx)
        },
        moveUp: function(idx) {
            this.$parent.moveEntryUp(this.fieldName, idx)
        },
    },
}
</script>

<style scoped>

fieldset {
    margin-bottom: 1em;
    width: 100%;
}

fieldset > label {
    display: inline-block;
    width: 10em;
    line-height: 18px;
    font-weight: bold;
    word-spacing: initial;
}

fieldset > ul {
    margin-top: 1rem;
}

fieldset > ul + button {
    width: 36px;
    text-align: center;
    padding: 0;
    float: right;
}

fieldset > ul > li {
    display: flex;
    width: 100%;
    margin: 0 0 1em 0;
    padding-right: 0.25em;
}

    li.text > input {
        width: 100%;
        margin: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }

    li .controls {
        display: flex;
    }

        li .controls > button {
            padding: 0;
            margin: 0;
            width: 34px;
            height: 34px;
            border-radius: 0;
            border-left-color: transparent;
            border-right-color: transparent;
        }

        li .controls > button:last-child {
            border-top-right-radius: var(--border-radius);
            border-bottom-right-radius: var(--border-radius);
            border-right-width: 1px;
        }
            li .controls > button:last-child:not(:hover):not(:focus) {
                border-right-color: var(--color-border-dark);
            }

li.textarea {
    float: right;
    position: relative;
    top: 1px;
    z-index: 1;
}

    li.textarea > textarea {
        min-height: 10em;
        resize: vertical;
        width: calc(100% - 44px);
        margin: 0 0 0 44px;
        border-top-right-radius: 0;
    }

    li.textarea::after {
        display: table;
        content: '';
        clear: both;
    }
    .step-number {
        position: absolute;
        left: 0;
        top: 0;
        height: 36px;
        width: 36px;
        border-radius: 50%;
        border: 1px solid var(--color-border-dark);
        outline: none;
        background-repeat: no-repeat;
        background-position: center;
        background-color: var(--color-background-dark);
        line-height: 36px;
        text-align: center;
    }

.icon-arrow-up {
    background-image: var(--icon-triangle-n-000);
}

.icon-arrow-down {
    background-image: var(--icon-triangle-s-000);
}

button {
    width: auto !important;
    padding: 0 1rem 0 0.75rem !important;
}

</style>
