import express from "express";

export const router = express.Router();

router.get("/", function(req, res, next) {
 res.send("API is working properly");
});


