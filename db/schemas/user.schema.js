const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
    }
})

const User = mongoose.model("User", userSchema);
module.exports = {User}