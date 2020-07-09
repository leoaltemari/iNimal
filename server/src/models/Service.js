'use strict'
const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título é obrigatório'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'O slug é obrigatório'],
        trim: true,
        index: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'A descrição é obrigatória']
    },
    partner: {
        type:String,
        Required: [true, 'O nome do profissional que presta o serviço é obrigatório']
    },
    price: {
        type: Number,
        required: [true, 'O preço é obrigatório']
    },
    hours: [{
        type: String,
        required: true
    }]
    // active: {
    //     type: String,
    //     required: true
    // },
    // tags: [{
    //     type: String,
    //     required: true
    // }],
});

module.exports = mongoose.model('Service', schema);