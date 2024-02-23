const Razorpay = require('razorpay');
const razorPayInstance = require('../util/razorpay');
const sequelize = require('../util/database');
const {Sequelize, Datatypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();
const Orders = require('../model/order');
const User = require('../model/user');

exports.createOrder = async (req, res, next) => {
    try {
        let transaction = await sequelize.transaction();
        const options = {
            amount:1*100,
            currency:'INR',
        }
        razorPayInstance.orders.create(options, async (err, order) => {
        if(err) {
            console.log(err);
            await transaction.rollback();
            return res.status(500).json({message: 'Somthing went Wrong'});
        }
        order.razorPayId = process.env.RAZOR_ID;
        res.status(200).json(order);
    });
    await transaction.commit();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addOrder = async (req, res, next) => {
    try {
        let transaction = await sequelize.transaction();
        const orderDetails = {
            amount: req.body.amount,
            payment_Id: req.body.response.razorpay_payment_id,
            order_Id: req.body.response.razorpay_order_id,
            signature: req.body.response.razorpay_signature, 
            UserId: req.body.userId 
        }
        const order = await Orders.create ( orderDetails, {transaction} );

        const isExistingUser = await User.findByPk(req.body.email);
        if (isExistingUser) {
            await isExistingUser.update({ isPremiumUser: true }, { transaction });
            await transaction.commit();
            res.status(200).json({ message: 'User upgraded to premium.' });
        } else {
            await transaction.rollback();
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        res.status(500).json({ message: 'Server Error' });
    }
}