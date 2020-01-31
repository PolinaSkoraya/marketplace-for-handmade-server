import express from "express";
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const jsonParser = express.json();

import {Goods} from './goods'
export const routerSeller = express.Router();

const sellerScheme = new Schema({name: String, description: String, services: Array, goods: Array}, {versionKey: false});
const Sellers = mongoose.model("Seller", sellerScheme);

routerSeller.get("/", function(req, res){

    Sellers.find({}, function(err, sellers){

        if(err) return console.log(err);
        res.send(sellers)
    });
});

routerSeller.get("/:id", function(req, res){

    const id = req.params.id;

    Sellers.findOne({_id: id}, function(err, user){

        if(err) return console.log(err);
        res.send(user);
    });
});

routerSeller.post("/", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const sellerName = req.body.name;
    const sellerDescription = req.body.description;
    const sellerServices = req.body.services;
    const seller = new Sellers({name: sellerName, description: sellerDescription, services: sellerServices});

    seller.save(function(err){
        if(err) return console.log(err);
        res.send(seller);
    });
});

routerSeller.get("/:id/goods", function(req, res){

    const id = req.params.id;
    Goods.find({idSeller: id},function(err, goods){

        if(err) return console.log(err);
        res.send(goods);
    });
});

routerSeller.post("/:id/goods", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const goodIdSeller = req.params.id;

    const goodName = req.body.name;
    const goodPrice = req.body.price;
    const good = new Goods({name: goodName, price: goodPrice, idSeller: goodIdSeller});

    good.save(function(err){
        if(err) return console.log(err);
        res.send(good);
    });

});

