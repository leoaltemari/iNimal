'use strict'
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const fs = require('fs');
const md5 = require('md5');

exports.create = async(data) => {
    var customer = new Customer(data);
    await customer.save();
}

exports.authenticate = async(data) => {
    const res = await Customer.findOne({
        email: data.email,
        password: md5(data.password + global.SALT_KEY)
    }, 'name email phone address image roles pets token');
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
        const findEmail = await Customer.findOne({ email: body.email });
        if(findEmail != null) {
            return null;
        }
    }

    if(body.password) {
        query.password = md5(body.password + global.SALT_KEY);
    }
    if(body.address) {
        query.address = body.address;
    }

    // Updating image if there is one
    if(file) {
        let imageId = file.filename;
        query.image = { id: imageId, url: `src/public/uploads/customers/${imageId}`};
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

exports.updateAdmin = async (email, value) => {
    const query = { email: email };
    let update;
    if(value === 'true') {
        update = { roles: 'admin' }
    } else {
        update = { roles: 'user' }
    }
    const res = await Customer.findOneAndUpdate( query, update);
    return res;
}

exports.delete = async (id) => {
    const res = await Customer.findOneAndRemove(id);
    if(res.image) {
        const path = res.image.url;
        fs.unlinkSync(path);
    }
    return res;
}