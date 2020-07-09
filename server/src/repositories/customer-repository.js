'use strict'
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const fs = require('fs');


exports.create = async(data) => {
    // data.image = {};
    // data.image.id = "a";
    // data.image.url = "b";
    var customer = new Customer(data);
    await customer.save();
}

exports.authenticate = async(data) => {
    const res = await Customer.findOne({
        email: data.email,
        password: data.password
    }, 'name email phone address image');
    return res;
}

exports.get = async () => {
    const res = await Customer.find();
    return res;
}

exports.getById = async (id) => {
    const res = await Customer.findById(id);
    return res;
}

exports.update = async (id, body, file) => {
    const query = {
    };

    if(body.name) {
        query.name = body.name;
    }
    if(body.phone) {
        query.phone = body.phone;
    }
    if(body.email) {
        query.email = body.email;
    }
    if(body.password) {
        query.password = body.password;
    }
    if(body.address) {
        query.address = body.address;
    }

    // Updating image if there is one
    if(file) {
        let imageId = file.filename;
        query.image = { id: imageId, url: `src/public/uploads/${imageId}`};
        const user = await Customer.findById(id, 'image');
        
        // Remove the old image from the upload folder
        if(user.image) {
            const path = user.image.url;
            fs.unlinkSync(path);
        }
    }

    const res = await Customer.findByIdAndUpdate(id, query);

    return res;
}

exports.updateAdmin = async (id, value) => {
    const query = { admin: value};
    const res = await Customer.findByIdAndUpdate(id, query);
    return res;
}

exports.delete = async (id) => {
    const res = await Customer.findOneAndRemove(id);
    return res;
}