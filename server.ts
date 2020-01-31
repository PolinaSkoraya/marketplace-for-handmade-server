import "./testAPI"
import express from "express";
import mongoose from 'mongoose';
import cors from 'cors'

import {routerSeller} from './routers/sellers'
import {routerBuyer} from "./routers/buyers";
import {routerGood} from "./routers/goods";
import {router}  from './testAPI';

const app = express();
app.use(cors());
app.use('/api/sellers', routerSeller);
app.use('/api/buyers', routerBuyer);
app.use('/api/goods', routerGood);
app.use("/testAPI", router);

mongoose.connect("mongodb://localhost:27017/marketplace", { useNewUrlParser: true }, function(err){

    if(err) return console.log(err);
    app.listen(9000, function(){
        console.log("Connected to db!");
    });
});



