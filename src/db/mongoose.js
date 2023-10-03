const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/twitter-api', {
    // userNewUrlParser: true,
    // useCreaterIndex: true,
    // useFindandModify: false,
    useUnifiedTopology: true
})