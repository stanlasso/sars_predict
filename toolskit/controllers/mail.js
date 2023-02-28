const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
//this line is required to parse the request body


/* Create - POST method */
const send = (req, res) => {
    const userSend = req
    console.log('in mail : ', userSend)
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'ivoire.bioinfo@gmail.com', // generated ethereal user
            pass: '123@@Abouchou', // generated ethereal password
        },
    });
    let info = transporter.sendMail({
        from: '"Plateforme Génétique moleculaire IPCI" <Contact>', // sender address
        to: userSend.username, // list of receivers
        subject: "SIDBI - Creation of your account", // Subject line
        html: "<h2>Hi " + userSend.fullname + "</h2><br><p> Your account has been successfully created. Please connect to the application: http://pathoextract.ngstoolskit.com/ </p><p> With the password : " + userSend.password + "</p>",
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

const forgot = (req, res) => {
    //get the update data
    const userData = req.username
    console.log(userData)
    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findUser = existUsers.find(user => user.username === userData)
    //const findPassword = existUsers.find(user => user.password == userData.password)
    if (!findUser) {
        return res.status(409).send({ error: true, msg: 'username not exist' })
    }else{
        let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'ivoire.bioinfo@gmail.com', // generated ethereal user
            pass: '123@@Abouchou', // generated ethereal password
        },
    });
    let info = transporter.sendMail({
        from: '"Societe Ivoirienne de Développement Bioinformatique " <Contact>', // sender address
        to: findUser.username, // list of receivers
        subject: "SIDBI - Creation of your account", // Subject line
        html: "<h2>Hi " + findUser.fullname + "</h2><br><p> Your  password is : " + findUser.password + "</p>",
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    
    }

}

//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('./data/users.json')
    return JSON.parse(jsonData)
}

/* util functions ends */

module.exports = {
    send,forgot
};