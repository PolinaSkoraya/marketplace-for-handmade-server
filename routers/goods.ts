import express from "express";
import mongoose from 'mongoose';
import {routerSeller} from "./sellers";
const Schema = mongoose.Schema;
const jsonParser = express.json();
import {verify} from './verifyToken'

export const routerGood = express.Router();

export const goodScheme = new Schema({name: String, price: Number, idSeller: String}, {versionKey: false});
export const Goods = mongoose.model("Good", goodScheme);

routerGood.get("/", verify, function(req, res){

    Goods.find({}, function(err, goods){

        if(err) return console.log(err);
        res.send(goods)
    });
});

routerGood.post("/", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const goodName = req.body.name;
    const goodPrice = req.body.price;
    const good = new Goods({name: goodName, price: goodPrice});

    good.save(function(err){
        if(err) return console.log(err);
        res.send(good);
    });

});
