const util = require("util");
const multer = require("multer");
const fs = require('fs');
const maxSize = 2 * 1024 * 1024;


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        var rep = ''
        switch (req.params.folder) {
            case 'dataqc':
                rep = 'data'
                break;
            case 'dbsub':
                rep = 'res/qc'
                break;
            case 'datacons':
                rep = 'res/dbsub'
                break;
            case 'ref_hote':
                rep = 'references/human'
                break;
            case 'ref_patho':
                rep = 'references/parasite'
                break;
            default:
        }
        cb(null, "./uploads/" + rep + "/");
        //console.log(file.mimetype);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
        /*  readFile(data => {
              data[file.filename] = "{ name: " + file.filename + ",name: " + file.filename + ",size: " + file.size + ",url: " + file.path + "}";
              writeFile(JSON.stringify(data, null, 2), () => {
                  // res.status(200).send
                  console.log('File added');
              });
          }, true);*/


    },
});

let uploadFile = multer({
    storage: storage
}).single("file");



let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;