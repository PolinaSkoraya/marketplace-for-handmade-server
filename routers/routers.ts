import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express, {response} from "express";
import {loginBuyerValidation, registerBuyerValidation} from "../validation";
import {verify} from "./verifyToken";
import {Buyers, Goods, Sellers} from "../schemes/schemes";

const jsonParser = express.json();
const router = express.Router();

const TOKEN_SECRET = 'sgsdrgsfsrs';

//BUYERS
router.get("/buyers", function(request, response){

    Buyers.find({}, function(err, buyers){

        if(err) {
            return console.log(err);
        };
        response.send(buyers);
    });
});

router.get("/buyers/:id", function(request, response){

    const id = request.params.id;

    Buyers.findOne({_id: id}, function(error, buyer){

        if(error) {
            return console.log(error);
        }
        response.send(buyer);
    });
});

router.post("/buyers/register", jsonParser, async function(req, res){

    const {error} = registerBuyerValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const emailExist = await Buyers.findOne({email: req.body.email});
    if(emailExist) {
        return res.status(400).send('Email already exist')
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const buyer = new Buyers({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    await buyer.save(function(error){
        if(error) {
            return console.log(error);
        }
        res.send({buyer: buyer._id});
    });
});

router.post("/buyers/login", jsonParser, async function(req, res){
    let id: string;
    let name: string;

    const {error} = loginBuyerValidation(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    const buyer = await Buyers.findOne({email: req.body.email});
    if (buyer) {
        id = buyer._id;
        name = buyer.name;

    } else {
        return res.status(400).send('Email is not found');
    }

    const validPass = await bcrypt.compare(req.body.password, buyer.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({_id: id, name: name, role: "buyer" }, TOKEN_SECRET);

    res.header('auth-token', token).send(token);

});

// router.get("/buyers/:id/basket", function(req, res){
//     const id = req.params.id;
//
//     Buyers.findOne({_id: id}, function(err, buyers){
//         if(err) {
//             return console.log(err);
//         }
//
//         res.send(buyers.basket);
//     });
// });

//add good to basket
router.post("/buyers/:id/basket", jsonParser, async function(req, res){
    // let basket = [];

    if (!req.body) {
        return res.sendStatus(400);
    }

    const idBuyer = req.params.id;
    const idGood = req.body.idGood;

    await Buyers.findByIdAndUpdate(idBuyer, {$addToSet: {basket: idGood}},  {new: true}, function(err, buyer){
        if(err) {
            return console.log(err);
        }

        res.send(buyer);
    });
});

router.post("/buyers/:id/basket/delete", jsonParser, async function(req, res){
    if (!req.body) {
        return res.sendStatus(400);
    }

    const idBuyer = req.params.id;
    const idGood = req.body.idGood;

    await Buyers.findByIdAndUpdate( idBuyer, {$pull: {basket: idGood}},  {new: true}, function(err, buyer){
        if(err) {
            return console.log(err);
        }

        res.send(buyer);
    });
});

router.get("/buyers/:id/basket", verify, async function(req, res){
    const id = req.params.id;
    let basket = [];

    await Buyers.findOne({_id: id}, function(err, buyers){
        if(err) {
            return console.log(err);
        }

        basket = buyers.basket;
    });

    Goods.find({_id: basket}, function (error, goods) {
        if (error){
            return console.log(error);
        }

        res.send(goods);
    })
});

//GOODS
router.get("/goods", verify, function(req, res){

    Goods.find({}, function(err, goods){

        if(err) {
            return console.log(err);
        }
        res.send(goods);
    });
});

router.get("/goods/:id", verify, function(req, res){
   const id = req.params.id;

    Goods.findOne({_id: id}, function (err, good) {
        if (err) {
            return console.log(err);
        }

        res.send(good);
    });
});

router.get("/goods/:id/seller", verify, function(req, res){
    const id = req.params.id;
    let responseGood;

    Goods.findOne({_id: id}, function(err, good){
        if (err) {
            return console.log(err);
        }
        responseGood = good;
        Sellers.findOne({_id: responseGood.idSeller}, function (error, seller) {
            if (error) {
                console.log(error);
            }
            responseGood.seller = seller;
            res.send(responseGood);
        })

    });


});

router.post("/goods", jsonParser, async function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    const goodName = req.body.name;
    const goodPrice = req.body.price;
    const good = new Goods({
        name: goodName,
        price: goodPrice
    });

    await good.save(function(err) {
        if (err) {
            return console.log(err);
        }

        res.send(good);
    });
});

//GOODS LIKES
router.get("/buyers/:id/liked", verify, async function(req, res){
    let likedGoods = [];

    await Buyers.findOne({_id: req.params.id}, function(err, buyer){
        if (err) {
            return console.log(err);
        }

        likedGoods = buyer.likedGoods;
    });

    Goods.find({_id: likedGoods}, function (error, goods) {
        if (error) {
            return console.log(error);
        }

        res.send(goods);
    })
});

router.post("/goods/:id/updateLikes", jsonParser, async function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    Goods.findByIdAndUpdate(req.params.id, {likes: req.body.likes}, {new: true} ,function (err, good) {
        if (err) {
            return console.log(err);
        }

        res.send(good);
    });
});

router.post("/buyers/:id/liked", jsonParser, async function(req, res){
    if (!req.body) {
        return res.sendStatus(400);
    }
    const idGood = req.body.idGood;

    await Buyers.findByIdAndUpdate(req.params.id, {$addToSet: {likedGoods: idGood}}, {new: true}, function(err, buyer){
        if(err) {
            return console.log(err);
        }
        res.send(buyer);
    });
});

router.post("/buyers/:id/liked/delete", jsonParser, async function(req, res){
    if (!req.body) {
        return res.sendStatus(400);
    }
    const idGood = req.body.idGood;

    await Buyers.findByIdAndUpdate( req.params.id, {$pull: {likedGoods: idGood}}, {new: true}, function(err, buyer){
        if (err) {
            return console.log(err);
        }
        res.send(buyer);
    });
});

//SELLERS
router.get("/sellers", function(req, res){
    Sellers.find({}, function(err, sellers){

        if (err) {
            return console.log(err);
        }
        res.send(sellers);
    });
});

router.get("/sellers/:id", function(req, res){
    Sellers.findOne({_id: req.params.id}, function(err, user){

        if(err) {
            return console.log(err);
        }
        res.send(user);
    });
});

router.post("/sellers", jsonParser, async function (req, res) {
    if(!req.body) {
        return res.sendStatus(400);
    }

    const sellerName = req.body.name;
    const sellerDescription = req.body.description;
    const sellerServices = req.body.services;
    const sellerLogo = req.body.logo;

    const seller = new Sellers({
        name: sellerName,
        description: sellerDescription,
        services: sellerServices,
        logo: sellerLogo
    });

    await seller.save(function (err) {
        if(err) {
            return console.log(err);
        }
        res.send(seller);
    });
});

router.get("/sellers/:id/goods", function(req, res){

    const id = req.params.id;
    Goods.find({idSeller: id},function(err, goods){

        if(err) {
            return console.log(err);
        }
        res.send(goods);
    });
});

router.post("/sellers/:id/goods", jsonParser, async function (request, response) {

    if(!request.body) {
        return response.sendStatus(400);
    }

    const goodIdSeller = request.params.id;

    const goodName = request.body.name;
    const goodPrice = request.body.price;
    const goodDescription = request.body.description;
    const goodLikes = request.body.likes;
    const goodImage = request.body.image;

    const good = new Goods({
        name: goodName,
        price: goodPrice,
        idSeller: goodIdSeller,
        description: goodDescription,
        likes: goodLikes,
        image: goodImage
    });

    try {
        const newGood = await good.save();
        response.send(newGood);
    } catch (error) {
        return  console.log(error);
    }
});

export {
    router, TOKEN_SECRET
}
