const express = require("express");
// const Tweet = require('./models/tweet')
require('./db/mongoose')
const app = express();

const userRouter = require('./routers/user');
const tweetRouter = require('./routers/tweet') 

const port = process.env.port || 3000;

app.use(express.json())
app.use(userRouter)
app.use(tweetRouter);

app.listen(port, () => {
    console.log("Server is up on the port"  + port);
})
