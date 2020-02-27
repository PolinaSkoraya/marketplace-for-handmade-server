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
        seller: Object
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


const Buyers = mongoose.model("Buyer", buyerScheme);
const Goods = mongoose.model("Good", goodScheme);
const Sellers = mongoose.model("Seller", sellerScheme);

export {
    Buyers, Goods, Sellers
}

