import mongoose from 'mongoose';
const Schema = mongoose.Schema;

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
        basket: Array,
        roles: Array,
        likedGoods: Array
    },
    {versionKey: false});

const goodScheme = new Schema({
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        idSeller: String,
        likes: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        seller: Object,
        status: String
    },
    {versionKey: false});

const sellerScheme = new Schema({
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        services: {
            type: Array,
            required: true
        },
        goods: {
            type: Array
        },
        logo: {
            type: Array,
            required: true
        }
    },
    {versionKey: false});

const orderScheme = new Schema({
        idGood: {
            type: String,
            required: true
        },
        idUser: {
            type: String,
            required: true
        },
        idSeller: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        }
    },
    {versionKey: false});


const Buyers = mongoose.model("Buyer", buyerScheme);
const Goods = mongoose.model("Good", goodScheme);
const Sellers = mongoose.model("Seller", sellerScheme);
const Orders = mongoose.model("Order", orderScheme);

export {
    Buyers, Goods, Sellers, Orders
}

