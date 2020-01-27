import express from "express";
import {app} from './server'
export const router = express.Router();

router.get("/", function(req, res, next) {
 res.send("API is working properly");
});

//module.exports = router;

