const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    text: {
        tyoe: String,
        require: true,
        trin: true
    },
    user: {
        type: String,
        require: true,
    },
    username: {
        type: String,
        require: true,
        trin: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    image: {
        type: Buffer
    },
    likes: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

const Tweet = mongoose.model('Tweet', tweetSchema)

module.exports = Tweet
