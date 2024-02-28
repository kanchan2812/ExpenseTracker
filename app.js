const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const config = dotenv.config();
const RazorPay = require('razorpay');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');


const sequelize = require('./util/database');
const razorPayInstance = require('./util/razorpay');
const routes = require('./routes/routes');
const User = require('./model/user');
const Expense = require('./model/expense');
const Orders = require('./model/order');
const ResetPassword = require('./model/resetPassword');
const Report = require('./model/report');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'});
app.use(morgan('combined', {stream:accessLogStream}));
app.use(cors());
app.use(bodyParser.urlencoded( { extended:false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Orders);
Orders.belongsTo(User);

User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);

User.hasMany(Report);
Report.belongsTo(User);

app.use("/homepage", routes);
app.use("/homepage", express.static(path.join(__dirname, 'views')));


app.use((req, res, next) => {
    res.setHeader(
      "script-src 'self' https://checkout.razorpay.com; " +
      "script-src-elem 'self' https://checkout.razorpay.com;"
    );
    next();
});


app.use("/user", routes );
app.use("/payment", routes);
app.use('/premium', routes);
app.get("/password/resetPassword/:uniqueId", (req, res, next)=> {
    res.sendFile(path.join(__dirname, 'views', 'resetPassword.html'));
} );



sequelize.sync()
    .then( res => {
        const port = process.env.PORT || 3000;
        app.listen(port, ()=> console.log(`Server is running on Port : ${port}`));
    })
    .catch(err => console.log(err));
