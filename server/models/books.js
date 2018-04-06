const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var bookSchema = new Schema({
    user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    requestedUser: {
        type: String
    },
    isRequested: {
        type: Boolean
    },
    isApproved: {
        type: Boolean
    }
})

module.exports = mongoose.model('Book', bookSchema);