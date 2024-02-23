const sequelize = require('../util/database');
const {Sequelize, Datatypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();
const User = require('../model/user');
const Expenses = require('../model/expense');
const Report = require('../model/report');
const multer = require('multer');

const AWS = require('aws-sdk');
AWS.config.update( {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:process.env.AWS_REGION
});
const s3 = new AWS.S3();

exports.getLeaderBoardDetails = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const users = await User.findAll( {
            attributes: ['id', 'firstName', 'lastName',  'totalExpense'
        ],
        order: [['totalExpense', 'ASC']],
        order:[ [sequelize.literal('totalExpense'), 'ASC'] ]
        }, {transaction} )
        await transaction.commit();
        res.status(200).json(users);
    } catch (error) {
        transaction.rollback();
        res.status(500).json({message: 'Internal Server Error'});
    }
};

exports.generateReport = async (req, res, next )=> {
    let transaction = await sequelize.transaction();
    try {
        if (!req.file || Object.keys(req.file).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        const uploadedFile = req.file;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${req.body.fileName}.csv`,
            ACL: 'public-read',
            Body: req.file.buffer
        };
        const data = await s3.upload(params).promise();
        const reportObj = {
            fileName: req.body.fileName,
            url: data.Location,
            UserId: req.body.userId
        } 
        const report  = await Report.create(  {fileName, url, UserId} = reportObj, {transaction} );
        transaction.commit();
        res.status(200).json({
            url: data.Location,
            fileName: report.fileName,
            generatedDate: report.createdAt 
        });
        console.log('File uploaded successfully:', data.Location);
    } catch (error) {
        transaction.rollback();
        res.status(500).json({message: 'Internal Server Error'});
    }
};

exports.getAllReports = async (req, res, next ) => {
    let transaction = await sequelize.transaction();
    try {
        const userId = req.body.userId; 
        const reports = await Report.findAll({
            where: {
                UserId: userId
            }
        }, {transaction});
        const formattedReports = reports.map(report => ({
            fileName: report.fileName,
            generatedDate: report.generatedDate, 
            url: report.url
        }));
        transaction.commit();
        res.status(200).json(formattedReports);
    } catch (error) {
        transaction.rollback();
        console.log(error)
    }
};