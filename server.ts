import "./testAPI"
import express from "express";
import cors from 'cors'
import {router}  from './testAPI';

export const app = express();
app.use(cors());
app.use("/testAPI", router);

app.listen(9000);
