const express = require('express')
const fs = require('fs')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



function create(body) {
    const start = Date.now();
    console.log(start);
    var reponse = '';
    const exist = getData()
    const data = body
    console.log('data------------------------', data)
    if (data.fullname == null || data.url == null) {
        reponse = 'Data enter missing';
    } else {
        reponse = 'Data enter exist';
    }
    const findExist = exist.find(datas => datas.fullname === data.fullname)
    console.log(findExist, '...................................................')

    if (findExist) {
        reponse = 'Data already exist';
    } else {
        data.id = start
        exist.push(data)
        console.log(data, 'existe')
        savedData(exist);
        reponse = 'Data successfully';
    }
    console.log(reponse)
    return reponse
}
/* function reads() {
    console.log('je suis arrive')
} */
const read = (req, res) => {
    const data = getData()
    res.send(data)
    // console.log('je suis arrive')
    // res.status(200).send(data);
}
function find(id) {
    const exist = getData()
    const findData = exist.find(datas => datas.id == id)
    return findData
}
const update = (req, res) => {
    const dataname = req.params.dataname
    const data = req.body
    const exist = getData()
    const findExist = exist.find(datas => datas.dataname === dataname)
    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'data not exist' })
    }
    const updateData = exist.filter(datas => datas.dataname !== dataname)
    updateData.push(data)
    savedData(updateData)

    res.send({ success: true, msg: 'data updated successfully' })
}
function deleteData(body, type) {
    response = false
    const data = body
    if (type.length > 1) {
        const exist = getData()
        //  exist.filter(datas => console.log('front data: ', datas.fullname))
        const filterdata = exist.filter(datas => datas.fullname !== data)
        // console.log('existe=', exist.length, 'filterData=', filterdata.length, data)
        if (exist.length === filterdata.length) {
            response = false
        } else {
            savedData(filterdata)
            response = true
        }
    } else {
        response = false
    }
    return response
}
const savedData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('./data/files.json', stringifyData)
}
const getData = () => {
    const jsonData = fs.readFileSync('./data/files.json')
    return JSON.parse(jsonData)
}


const saveResults = async (req, res) => {
    var tab = []
    console.log(req.body)
    var tab = req.body.data
    tab.forEach(function (item) {
        let log = create({ "fullname": item.fullname, "url": item.url, "type": req.body.type })
        console.log(log, JSON.stringify({ "fullname": item.fullname, "url": item.url, "type": req.body.type }));
    });



};
module.exports = {
    create,
    read,
    getData,
    update,
    deleteData,
    saveResults,
    find,
};