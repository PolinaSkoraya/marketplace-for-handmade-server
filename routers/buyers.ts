import express from 'express';
import mongoose from 'mongoose';
import {loginBuyerValidation, registerBuyerValidation} from '../validation'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {verify} from './verifyToken'

export const TOKEN_SECRET = 'sgsdrgsfsrs';

const Schema = mongoose.Schema;
const jsonParser = express.json();

export const routerBuyer = express.Router();

const buyerScheme = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    basket: Array
    },
    {versionKey: false});

const Buyers = mongoose.model("Buyer", buyerScheme); //---Buyer

routerBuyer.get("/", function(req, res){

    Buyers.find({}, function(err, buyers){

        if(err) return console.log(err);
        res.send(buyers)
    });
});

routerBuyer.get("/:id", function(req, res){

    const id = req.params.id;

    Buyers.findOne({_id: id}, function(err, buyer){

        if(err) return console.log(err);
        res.send(buyer);
    });
});

routerBuyer.post("/register", jsonParser, async function(req, res){

    const {error} = registerBuyerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const emailExist = await Buyers.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email already exist');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const buyer = new Buyers({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    await buyer.save(function(err){
        if(err) return console.log(err);
        res.send({buyer: buyer._id});
    });
});

routerBuyer.post("/login", jsonParser, async function(req, res){

    const {error} = loginBuyerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const buyer = await Buyers.findOne({email: req.body.email});
    if(!buyer) return res.status(400).send('Email is not found');

    const validPass = await bcrypt.compare(req.body.password, buyer.password);   //await????
    if(!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({_id: buyer._id}, TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

// routerBuyer.post("/", jsonParser, function(req, res){
//
//     if(!req.body) return res.sendStatus(400);
//
//     const buyerName = req.body.name;
//     const buyer = new Buyers({name: buyerName});
//
//     buyer.save(function(err){
//         if(err) return console.log(err);
//         res.send(buyer);
//     });
// });

routerBuyer.get("/:id/basket", function(req, res){

    const id = req.params.id;

    Buyers.findOne({_id: id}, function(err, buyers){

        if(err) return console.log(err);
        res.send(buyers.basket)
    });
});
