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
        basket: Array
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
        idSeller: String
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
        }
    },
    {versionKey: false});

const Buyers = mongoose.model("Buyer", buyerScheme);
const Goods = mongoose.model("Good", goodScheme);
const Sellers = mongoose.model("Seller", sellerScheme);

export {
    Buyers, Goods, Sellers
}

