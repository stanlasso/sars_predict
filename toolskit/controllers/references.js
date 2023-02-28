const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//this line is required to parse the request body


/* Create - POST method */
function create(body) {
    var reponse = '';
    //get the existing reference data
    const existreferences = getreferenceData()
    console.log(existreferences)
    //get the new reference data from post request
    const referenceData = body
    //check if the referenceData fields are missing
    if (referenceData.fullname == null || referenceData.url == null) {
        //   return res.status(401).send({ error: true, msg: 'reference data missing' })
        reponse = 'reference data missing';
    }
    //check if the referencename exist already
    const findExist = existreferences.find(reference => reference.fullname === referenceData.fullname)
    console.log("reference:", findExist)
    if (findExist) {
        console.log('------------------Exist---------------------')
        // return res.status(409).send({ error: true, msg: 'referencename already exist' })
        reponse = 'referencename already exist';
    } else {
        //append the reference data
        existreferences.push(referenceData)
        //save the new reference data
        savereferenceData(existreferences);
        reponse = 'reference data added successfully';
    }
    // res.send({ success: true, msg: 'reference data added successfully' })
    return reponse
}

/* Read - GET method */
const read = (req, res) => {
    const references = getreferenceData()
    res.send(references)
}


/* Update - Patch method */
const update = (req, res) => {
    //get the referencename from url
    const referencename = req.params.referencename

    //get the update data
    const referenceData = req.body

    //get the existing reference data
    const existreferences = getreferenceData()

    //check if the referencename exist or not       
    const findExist = existreferences.find(reference => reference.referencename === referencename)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'referencename not exist' })
    }

    //filter the referencedata
    const updatereference = existreferences.filter(reference => reference.referencename !== referencename)

    //push the updated data
    updatereference.push(referenceData)

    //finally save it
    savereferenceData(updatereference)

    res.send({ success: true, msg: 'reference data updated successfully' })
}

/* Delete - Delete method */
function deletereference(body) {
    response = ''
    const referencename = body
    //get the existing referencedata
    const existreferences = getreferenceData()
    //filter the referencedata to remove it
    const filterreference = existreferences.filter(reference => reference.fullname !== referencename)
    if (existreferences.length === filterreference.length) {
        response = 'referencename does not exist'
    }
    //save the filtered data
    savereferenceData(filterreference)
    response = 'reference removed successfully'

}



/* util functions */

//read the reference data from json file
const savereferenceData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./data/references.json', stringifyData)
}

//get the reference data from json file
const getreferenceData = () => {
    const jsonData = fs.readFileSync('./data/references.json')
    return JSON.parse(jsonData)
}

/* util functions ends */

module.exports = {
    create,
    read,
    update,
    deletereference
};