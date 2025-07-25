const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastActiveBoard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        default: null
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);

