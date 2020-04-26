const mongoose = require("mongoose");
const app = require('./routers/routers');

mongoose.connect("mongodb://localhost:27017/marketplace", { useNewUrlParser: true }, function(err) {
    if (err) {
        return console.log(err);
    }
    app.listen(9000, function () {
        console.log("Connected to db!");
    });
});

