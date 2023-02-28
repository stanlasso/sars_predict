const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//this line is required to parse the request body


/* Create - POST method */
const create = (req, res) => {
    var reponse = '';
    //get the existing parameter data
    const existparameters = getparameterData()
    console.log(existparameters)
    //get the new parameter data from post request    
    const parameterData = req.body
    //check if the parameterData fields are missing
    if (parameterData.fullname == null || parameterData.type == null || parameterData.trim_front1 == null || parameterData.trim_front2 == null || parameterData.trim_tail1 == null || parameterData.trim_tail2 == null || parameterData.n_base_limit == null || parameterData.max_ql == null || parameterData.max_lg == null) {
        return res.status(401).send({ error: true, msg: 'parameter data missing' })
        // reponse = 'parameter data missing';
    }
    //check if the parametername exist already
    const findExist = existparameters.find(parameter => parameter.fullname === parameterData.fullname)
    console.log("parameter:", findExist)
    if (findExist) {
        console.log('------------------Exist---------------------')
        return res.status(409).send({ error: true, msg: 'parametername already exist' })
        //reponse = 'parametername already exist';
    } else {
        //append the parameter data
        existparameters.push(parameterData)
        //save the new parameter data
        saveparameterData(existparameters);
        res.send({ success: true, msg: 'parameter data added successfully' })
    }

    //  return reponse
}

/* Read - GET method */
const read = (req, res) => {
    const parameters = getparameterData()
    res.send(parameters)
}


/* Update - Patch method */
const update = (req, res) => {
    console.log(req.body)
    //get the parametername from url
    //get the update data
    const parameterData = req.body

    //get the existing parameter data
    const existparameters = getparameterData()

    //check if the parametername exist or not       
    const findExist = existparameters.find(parameter => parameter.fullname === parameterData.fullname)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'parametername not exist' })
    } else {
        //filter the parameterdata
        const updateparameter = existparameters.filter(parameter => parameter.fullname !== parameterData.fullname)

        //push the updated data
        updateparameter.push(parameterData)

        //finally save it
        saveparameterData(updateparameter)

        res.send({ success: true, msg: 'parameter data updated successfully' })
    }



}

/* Delete - Delete method */
const getparameter = (req, res) => {

    const parametername = req.params.fullname
    //get the update data
    const parameterData = req.body

    //get the existing parameter data
    const existparameters = getparameterData()

    //check if the parametername exist or not       
    const findExist = existparameters.find(parameter => parameter.fullname === parametername)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'parameter not exist' })
    } else {
        res.send(findExist)
    }

}

function getForConda(fullname) {
    const parametername = fullname
     
    const existparameters = getparameterData()

      
    const findExist = existparameters.find(parameter => parameter.fullname === parametername)
    if (!findExist) {
        console.log(msg, 'parameter not exist')
    } else {
        return findExist
    }
}

/* Delete - Delete method */
const deleteparameter = (req, res) => {
    response = ''
    const parametername = req.params.fullname
    //get the existing parameterdata
    const existparameters = getparameterData()
    //filter the parameterdata to remove it
    const filterparameter = existparameters.filter(parameter => parameter.fullname !== parametername)

    if (existparameters.length === filterparameter.length) {
        response = 'parametername does not exist'
    }
    //save the filtered data
    saveparameterData(filterparameter)
    res.send({ success: true, msg: 'parameter removed successfully' })

}



/* util functions */

//read the parameter data from json file
const saveparameterData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./data/parameters.json', stringifyData)
}

//get the parameter data from json file
const getparameterData = () => {
    const jsonData = fs.readFileSync('./data/parameters.json')
    return JSON.parse(jsonData)
}

/* util functions ends */

module.exports = {
    create,
    read,
    getparameter,
    getForConda,
    update,
    deleteparameter,
};