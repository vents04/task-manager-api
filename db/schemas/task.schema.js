const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        minLength: 5,
    },
    description: {
        type: String,
        minlength: 10
    },
    done: {
        type: Boolean,
        default: false
    }
})

const Task = mongoose.model("Task", taskSchema);
module.exports = {Task}