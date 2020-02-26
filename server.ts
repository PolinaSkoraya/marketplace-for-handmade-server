import "./testAPI"
import express from "express";
import mongoose from 'mongoose';
import cors from 'cors'

import {router} from "./routers/routers";

const app = express();

app.use(cors());
app.use('/api', router);
app.use('/static/images', express.static( 'static'));

mongoose.connect("mongodb://localhost:27017/marketplace", { useNewUrlParser: true }, function(err){

    if(err) {
        return console.log(err);
    };

    app.listen(9000, function () {
        console.log("Connected to db!");
    });
});

