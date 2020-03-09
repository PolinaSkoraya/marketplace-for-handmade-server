import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from "express";
import {loginBuyerValidation, registerBuyerValidation} from "../validation";
import {verify} from "./verifyToken";
import {Buyers, Goods, Orders, Sellers} from "../schemes/schemes";

const jsonParser = express.json();
const router = express.Router();

const TOKEN_SECRET = 'sgsdrgsfsrs';

router.post("/buyers/login", jsonParser, async function(req, res){
    let id: string;
    let name: string;
    let roles = [];

    const {error} = loginBuyerValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const buyer = await Buyers.findOne({email: req.body.email});

    if (buyer) {
        id = buyer._id;
        name = buyer.name;
        roles = buyer.roles;
    } else {
        return res.status(400).send('Email is not found');
    }

    const validPass = await bcrypt.compare(req.body.password, buyer.password);
    if (!validPass) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({id: id, name: name, roles: roles }, TOKEN_SECRET);

    res.header('auth-token', token).send(token);

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
        password: hashedPassword,
        roles: ["BUYER"]
    });

    await buyer.save(function (error) {
        if(error) {
            return console.log(error);
        }
        res.send({buyer: buyer._id});
    });
});

//BUYERS

router.get("/buyers", function(request, response){

    Buyers.find({}, function(error, buyers){

        if (error) {
            return console.log(error);
        }
        response.send(buyers);
    });
});

router.get("/buyers/:id", function(request, response){
    const id = request.params.id;

    Buyers.findOne({_id: id}, function(error, buyer) {
        if (error) {
            return console.log(error);
        }
        response.send(buyer);
    });
});

router.get("/buyers/:id/shop", function(request, response){
    const id = request.params.id;

    Sellers.findOne({idUser: id}, function(error, shop) {
        if (error) {
            return console.log(error);
        }
        response.send(shop);
    });
});

router.post("/buyers/:id", jsonParser, async function(req, res){
    if (!req.body.roles) {
        return res.sendStatus(400);
    }
    const role = req.body.roles;

    await Buyers.findByIdAndUpdate(req.params.id, {$addToSet: {roles: role}}, {new: true}, function(err, user){
        if (err) {
            return console.log(err);
        }
        res.send(user);
    });
});

//add good to basket
router.post("/buyers/:id/basket", jsonParser, async function(req, res){
    if (!req.body) {
        return res.sendStatus(400);
    }

    const idBuyer = req.params.id;
    const idGood = req.body.idGood;

    await Buyers.findByIdAndUpdate(idBuyer, {$addToSet: {basket: idGood}},  {new: true}, function(err, buyer){
        if (err) {
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
        if (err) {
            return console.log(err);
        }
        res.send(buyer);
    });
});

router.get("/buyers/:id/basket", verify, async function(req, res){
    const id = req.params.id;
    let basket = [];

    await Buyers.findOne({_id: id}, function(err, buyers){
        if (err) {
            return console.log(err);
        }
        basket = buyers.basket;
    });

    Goods.find({_id: basket}, function (error, goods) {
        if (error) {
            return console.log(error);
        }
        res.send(goods);
    })
});

//GOODS
router.get("/goods", verify, function(req, res){
    Goods.find({}, function(error, goods) {
        if (error) {
            return console.log(error);
        }
        res.send(goods);
    });
});

//new
router.get("/goods/ids", verify, jsonParser, function(req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    let ids = req.body.ids;

    Goods.find({_id: ids}, function (error, good) {
        if (error) {
            return console.log(error);
        }
        res.send(good);
    });
});

router.get("/goods/:id", verify, function(req, res){
   const id = req.params.id;

    Goods.findOne({_id: id}, function (error, good) {
        if (error) {
            return console.log(error);
        }
        res.send(good);
    });
});

router.get("/goods/:id/seller", verify, function(req, res){
    const id = req.params.id;
    let responseGood;

    Goods.findOne({_id: id}, function (error, good) {
        if (error) {
            return console.log(error);
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

router.post("/goods/:id", jsonParser, async function(req, res){
    if (!req.body) {
        return res.sendStatus(400);
    }

    await Goods.findByIdAndUpdate (req.params.id, {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        }, {new: true},
        function (error, good) {
            if (error) {
                return console.log(error);
            }
            res.send(good);
        });
});

router.post("/goods", jsonParser, async function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }

    const good = new Goods({
        name: req.body.name,
        price: req.body.price,
        idSeller: req.body.idSeller,
        likes: req.body.likes,
        description: req.body.description,
        image: req.body.image
    });

    await good.save( function (error) {
        if (error) {
            return console.log(error);
        }
        res.send(good);
    });
});

//GOODS LIKES
router.get("/buyers/:id/liked", verify, async function(req, res){
    let likedGoods = [];

    await Buyers.findOne({_id: req.params.id}, function (err, buyer){
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
        if (err) {
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

        if (err) {
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

    await seller.save( function (err) {
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

// router.get("/sellers/:id/orders", function(req, res){
//     const id = req.params.id;
//
//     Orders.find({idSeller: id},function (err, orders) {
//         if (err) {
//             return console.log(err);
//         }
//         res.send(orders);
//     });
// });

router.get("/buyers/:id/orders", async function(req, res){
    const id = req.params.id;

    let orders = [];
    let idGoods = [];
    let goods = {};

    await Orders.find({idUser: id},function(err, responseOrders){
        if (err) {
            return console.log(err);
        }
        orders = responseOrders;
        orders.forEach(order => {
            idGoods.push(order.idGood);
        });
    });

    await Goods.find({_id: idGoods},function(err, responseGoods) {
        if (err) {
            return console.log(err);
        }
        goods = responseGoods;
    })

    for (let i = 0; i < idGoods.length; i++ ) {
        goods[i].status = orders[i].status;
    }

    res.send(goods);
});

router.post("/buyers/:id/orders", jsonParser, async function(request, response){
    if (!request.body) {
        return response.sendStatus(400);
    }

    const order = new Orders({
        idUser: request.params.id,
        idGood: request.body.idGood,
        idSeller: request.body.idSeller,
        status: "processing"
    });

    try {
        const newOrder = await order.save();
        response.send(newOrder);
    } catch (error) {
        return  console.log(error);
    }
});

router.get("/sellers/:id/orders", jsonParser, async function(req, res){
    const id = req.params.id;

    let orders = [];
    let idGoods = [];
    let goods = {};

    await Orders.find({idSeller: id},function (err, responseOrders) {
        if (err) {
            return console.log(err);
        }
        orders = responseOrders;
        orders.forEach(order => {
            idGoods.push(order.idGood);
        });
    });

    await Goods.find({_id: idGoods},function (err, responseGoods) {
        if (err) {
            return console.log(err);
        }
        goods = responseGoods;
    })

    for (let i = 0; i < idGoods.length; i++) {
        goods[i].status = orders[i].status;
    }

    res.send(goods);
});

router.post("/sellers/orders/:id", jsonParser, async function(request, response) {
   let idOrder = request.params.id;

    await Orders.findByIdAndUpdate(idOrder, {status: "accepted"}, {new: true}, function (err, responseOrders) {
        if (err) {
            return console.log(err);
        }
        response.send(responseOrders);
    });
});

export {
    router, TOKEN_SECRET
}
