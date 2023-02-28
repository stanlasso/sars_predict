const express = require("express");
const router = express.Router();
const controller = require("../controllers/upload");


router.post("/upload/:folder", controller.upload);
router.get("/files/:folder", controller.getListFiles);
router.post("/delete", controller.deleteFiles);
router.get("/download/:file_id", controller.download);
router.get("/dwlgraph/:file_id", controller.graph);
router.get("/getconsole", controller.consoledwl);
router.get("/getconsoleEx", controller.consoledwlEx);
router.get("/getconsoleGr", controller.consoledwlGr);


module.exports = router;