const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const email = require('./mail');
const exec = require('child_process').exec;
//this line is required to parse the request body


/* Create - POST method */
const create = (req, res) => {
    //get the existing user data
    const existUsers = getUserData()
    //get the new user data from post request
    const userData = req.body
    //check if the userData fields are missing
    if (userData.fullname == null || userData.username == null || userData.password == null || userData.profil == null) {
        return res.status(401).send({ error: true, msg: 'User data missing' })
    } else {
        //check if the username exist already
        const findExist = existUsers.find(user => user.username == userData.username)
        console.log(findExist)
        if (findExist) {
            return res.status(409).send({ error: true, msg: 'username already exist' })
        } else {
            //append the user data
            userData.id = Date.now();
            existUsers.push(userData)
            //save the new user data
            saveUserData(existUsers);
            // email.send(userData)
            res.send({ success: true, msg: 'User data added successfully' })
        }

    }


}

/* Read - GET method */
const read = (req, res) => {
    const users = getUserData()
    res.send(users)
}
const login = (req, res) => {
    const userData = req.body
    const existUsers = getUserData()
    const findUser = existUsers.find(user => user.username === userData.username)
    if (!findUser) {
        return res.status(409).send({ error: true, msg: 'username not exist' })
    } else {
        if (findUser.password != userData.password) {
            return res.status(409).send({ error: true, msg: 'Password not correct' })
        } else {
            res.status(200).json({
                userId: userData.id,
                token: jwt.sign(
                    { userId: userData.id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '10ms' }
                )
            });
        }
    }

}
const forgot = (req, res) => {
    const userData = req.body
    userData.username
    email.forgot(userData.username)
    res.send({ success: true, msg: 'Passeword send' })
}
const find = (req, res) => {
    //get the update data
    const userData = req.params.username
    console.log(userData)
    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findUser = existUsers.find(user => user.username === userData)
    //const findPassword = existUsers.find(user => user.password == userData.password)
    if (!findUser) {
        return res.status(409).send({ error: true, msg: 'username not exist' })
    }
    /* console.log(findUser.password,userData.password)
    if (findUser.password != userData.password) {
        return res.status(409).send({ error: true, msg: 'Password not correct' })
    } else { */
    res.status(200).json(findUser.fullname);
    //}
}
/* Update - Patch method */
const update = (req, res) => {
    //get the username from url
    const username = req.params.username

    //get the update data
    const userData = req.body

    //get the existing user data
    const existUsers = getUserData()

    //check if the username exist or not       
    const findExist = existUsers.find(user => user.username === username)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'username not exist' })
    }

    //filter the userdata
    const updateUser = existUsers.filter(user => user.username !== username)

    //push the updated data
    updateUser.push(userData)

    //finally save it
    saveUserData(updateUser)

    res.send({ success: true, msg: 'User data updated successfully' })
}

/* Delete - Delete method */
const deleteUser = (req, res) => {
    const username = req.params.username

    //get the existing userdata
    const existUsers = getUserData()

    //filter the userdata to remove it
    const filterUser = existUsers.filter(user => user.username !== username)

    if (existUsers.length === filterUser.length) {
        return res.status(409).send({ error: true, msg: 'username does not exist' })
    }

    //save the filtered data
    saveUserData(filterUser)

    res.send({ success: true, msg: 'User removed successfully' })

}



/* util functions */

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./data/users.json', stringifyData)
}
//get the user data from json file
const getUserData = () => {
    const jsonData = fs.readFileSync('./data/users.json')
    return JSON.parse(jsonData)
}
const saveFileData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./data/files.json', stringifyData)
}

//get the user data from json file
const getFileData = () => {
    const jsonData = fs.readFileSync('./data/files.json')
    return JSON.parse(jsonData)
}
function reload() {
    exec('pm2 flush server.js', (err, stdout, stderr) => {
        if (err) { } else {
            exec('pm2 restart server.js', (err, stdout, stderr) => {
                if (err) { } else { }
            });
        }
    });
}
function clean() {
    exec('rm -fr uploads/res && mkdir uploads/res', (err, stdout, stderr) => {
        if (err) { } else { }
    });
    const data = []
    const findExist = getFileData()
    findExist.forEach(function (filepath, filename) {
        if (filepath.url.indexOf("res") == -1) {
            console.log(filepath)
            data.push(filepath)
        }

    });
    saveFileData(data)
}
/* util functions ends */

module.exports = {
    create,
    read,
    login,
    find,
    update,
    deleteUser,
    forgot,
    reload,
    clean
};