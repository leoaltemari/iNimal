'use struct'

const repository = require('../repositories/customer-repository');
const CustomerValidator = require('../validators/customer-validator');
const multer = require('multer');
const path = require('path');
const md5 = require('md5');
const authService = require('../services/auth-service');

// Configuring multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/uploads/customers');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({ storage });
exports.uploadImage = upload.single('file');

// Controllers
exports.authenticate = async (req, res,  next) => {
    try {
        const customer = await repository.authenticate(req.params);
        if(!customer) {
            res.status(200).send({ message: 'Email ou senha inválidos!' });
            return;
        }
        // Generates a token to the user 
        const token = await authService.generateToken({
            id: customer._id,
            email: customer.email,
            name: customer.name,
            roles: customer.roles,
        });

        res.status(201).send({
            token: token,
            data: customer
        });
    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };
};

exports.getById = async (req, res,  next) => {
    try{
        const data = await repository.getById(req.params.id);
        res.status(200).send(data); 
    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };
};

exports.post = async (req, res, next) => {
    try {
        const customerValidator = new CustomerValidator();
        if(customerValidator.postValidation(req.body)) {
            await repository.create({
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                password: md5(req.body.password + global.SALT_KEY),
                roles: ['user']
            });
            res.status(201).send({ message: "Cadastro efetuado com sucesso" });
        } else {
            res.status(200).send( customerValidator.errors() );
        }
    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };;  
};

exports.put = async (req, res, next) => {
    try {
        const customerValidator = new CustomerValidator();
        if(customerValidator.putValidation(req.body)) {
            const res1 = await repository.update(req.params.id, req.body, req.file);
            if(res1 === null) {
                res.status(200).send([{
                    message: 'Este email já está em uso!'
                }]);
            } else { 
                res.status(200).send({
                    message: 'Informações atualizadas com sucesso!'
                });
                next();
            }
        } else {
            res.status(200).send(customerValidator.errors());
        }
    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };
};

exports.putAdmin = async(req, res, next) => {
    try {
        const email = req.body.email;

        const cb = await repository.updateAdmin(email);
        if(cb === null) {
            res.status(200).send({ message: "Usuário não encontrado!" });
        }
        else if(cb.roles[0] === 'admin') {
            res.status(200).send({ message: "O usuário agora é um administrador!" });
        } else {
            res.status(200).send({ message: "O usuário não é mais um administrador!" });
        }

    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };
}

exports.delete = async (req, res, next) => {
    try {
        const cb = await repository.delete(req.params.id);
        if(cb === null) {
            res.status(200).send({
                message: 'Usuário não encontrado!'
            });
        } else {
            res.status(200).send({
                message: 'Cliente removido com sucesso!'
            });
        }
    } catch(err) {
        res.status(500).send({ 
            message: 'Falha ao processar requisição',
            err: err.message,
            code: err.code
        });
    };
}


