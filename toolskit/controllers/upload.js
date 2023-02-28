const uploadFile = require("../middleware/upload");
const data = require("../controllers/managerData")
const fs = require('fs');
const exec = require('child_process').exec;
var http = require('http')
const path = require('path')
var mime = require('mime');
var zip = require('express-zip');
const { DownloaderHelper } = require('node-downloader-helper');
const { stringify } = require("querystring");
var spawn = require('child_process').spawn
var request = require('request');
const upload = async (req, res) => {
    var tab = []
    var dataType = ''
    switch (req.params.folder) {
        case 'dataqc':
            dataType = 'sequences'
            break;
        case 'dbsub':
            dataType = 'sequences_clean'
            break;
        case 'datacons':
            dataType = 'sequences_substract'
            break;
        case 'ref_hote':
            dataType = 'ref_hote';
            break;
        case 'ref_patho':
            dataType = 'ref_patho';
            break;
        default:
        /*  directoryPath = "./uploads/data/";
         type = 'sequences'; */
    }
    // console.log('upload---------------------------',dataName,req.destination,)
    try {
        await uploadFile(req, res);
        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }
        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname
        });
        tab.push(req.file)
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
    tab.forEach(function (item) {
        let log = data.create({ "fullname": item.originalname, "url": item.path, "type": dataType })
        console.log(log, JSON.stringify({ "fullname": item.originalname, "url": item.path, "type": dataType }));
    });
};
const deleteFiles = (req, res, callback) => {
    var files = []
    files = req.body.data
    console.log(req.body)
    var i = files.length;
    jsFileReturn = false;
    console.log(i);
    files.forEach(function (filepath, filename) {
        directoryPath = './' + filepath.url;
        jsFileReturn = data.deleteData(filepath.fullname, req.body.type)
        console.log('delete : ', directoryPath, jsFileReturn, req.body.type)
        let stats = fs.statSync(directoryPath);
        if (stats.isFile()) {
            directoryPath = filepath.url;
            fs.unlinkSync(directoryPath);
            files = []
        } else {
            directoryPath = filepath.url;
            fs.rmdirSync(directoryPath, { recursive: true });
            files = []
        }
        //   }
    });
    res.status(200).send({
        message: "Delete process finish"
    });
}
const getListFiles = (req, res) => {
    var folder = req.params.folder;
    var directoryPath = '';
    var type = '';
    console.log('Folder sended by front ', folder)
    switch (folder) {
        case 'data':
            directoryPath = "./uploads/data/";
            type = 'sequences';
            break;
        case 'dataqc':
            directoryPath = "./uploads/data/";
            type = 'sequences';
            break;
        case 'dbsub':
            directoryPath = "./uploads/res/qc/";
            type = 'qc';
            break;
        case 'datacons':
            directoryPath = "./uploads/res/dbsub/";
            type = 'subtracfile';
            break;
        case 'ref_hote':
            directoryPath = "./uploads/references/human/";
            type = 'ref_hote';
            break;
        case 'ref_patho':
            directoryPath = "uploads/references/parasite/";
            type = 'ref_patho';
            break;
        case 'res_fastq':
            directoryPath = "./uploads/res/fastq/";
            type = 'res_fastq';
            break;
        case 'res_redbsub':
            directoryPath = "./uploads/res/dbsub/";
            type = 'res_redbsub';
            break;
        case 'res_db_sub':
            directoryPath = "./uploads/res/dbsub/";
            type = 'res_db_sub';
            break;
        case 'res_qc':
            directoryPath = "./uploads/res/qc/";
            type = 'res_qc';
            break;
        case 'res_cons':
            directoryPath = "./uploads/res/cons/res/";
            type = 'res_cons';
            break;
        case 'vres_redbsub':
            type = 'vres_redbsub';
            break;
        case 'vres_fastq':
            type = 'vres_fastq';
            break;
        case 'vres_qc':
            type = 'vres_qc';
            break;
        case 'vres_db_sub':
            type = 'vres_db_sub';
            break;
        case 'vres_cons':
            type = 'vres_cons';
            break;
        case 'ref_hote':
            type = 'ref_hote';
            break;
        case 'ref_patho':
            type = 'ref_patho';
            break;
        default:
            directoryPath = "";
            type = 'sequences';
    }

    if (type.split('_')[0] == 'vres' || type.split('_')[0] == 'ref') {
        console.log('__------------The Results-----------_')
        filterdata = data.getData().filter(datas => datas.type == type)
        console.log('By database', filterdata)
        res.status(200).send(filterdata)
    } else {
        fs.readdir(directoryPath, function (err, files) {
            if (err) {
                res.status(500).send({
                    message: "Unable to scan files!",
                });
            }
            let fileInfos = [];
            files.forEach((file) => {
                fileInfos.push({
                    fullname: file,
                    url: directoryPath + file
                });
            });
            console.log(JSON.stringify({ fileInfos }));
            res.status(200).send(fileInfos);
        });
    }
};
const download = (req, res) => {
    console.log(req.params.file_id)
    data.find(req.params.file_id).url
    res.download('./' + data.find(req.params.file_id).url)
}
const graph = (req, res) => {
    var data = (req.params.file_id.split(','))
    console.log(data)
    // res.setHeader('Content-Type', 'application/json');
    //tab = [][n, hm, pm, pu]
    var samples = "paramettre :\n" // += 
    samples += "    name : " + data[0] + "\n"
    samples += "    read : " + data[1] + "\n"
    samples += "    hm : " + data[2] + "\n"
    samples += "    pm : " + data[3] + "\n"
    samples += "    pu : " + data[4] + "\n"
    console.log(samples)
    fs.writeFile('config.yaml', samples, function (err) {
        if (err) {
            throw err;
        } else {
            console.log("Config.yaml generate");
        }
    });
    exec("cp ./controllers/graph_snk/Snakefile .", (err, stdout, stderr) => {
        if (err) { } else { }
    });
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    var commands = [
        conda_path,
        conda_path + ' init',
        conda_path + ' activate snakemake',
        '~/miniconda3/condabin/conda run -v -n snakemake snakemake --cores all',
    ]
    var spawn_ = spawn(commands.join('&'), { shell: true });
    spawn_.stdout.on('data', function (data) {
        console.log('stdout', data.toString())
        //samples += data.toString()
    });
    spawn_.stderr.on('data', function (data) {
        console.log('stderr', data.toString())
        //samples += data.toString()
    });
    spawn_.on('exit', function (code) {
        console.log('on', code)
        //  if (code == false) {
        var file = data[0].replace(" ", "_") + '.png'
        var filelocation = path.join('./uploads/res/img', file)
        console.log(filelocation)
        res.download(filelocation)
        // } else {

        // }
    });



    /*data.find(req.params.file_id).url
    res.download('./' + data.find(req.params.file_id).url)*/
}
const consoledwl = (req, res) => {
    res.download('./console.txt')
}
const consoledwlEx = (req, res) => {
    res.download('./Excel.xlsx')
}
const consoledwlGr = (req, res) => {
    res.download('./uploads/graph.zip')
}




module.exports = {
    upload,
    getListFiles,
    deleteFiles,
    download,
    consoledwl,
    consoledwlEx,
    consoledwlGr,
    graph
};