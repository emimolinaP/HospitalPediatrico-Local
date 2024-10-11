const multer = require ("multer");
const path = require ("path");
var bodyParser = require('body-parser')

module.exports = multer({
    storage: multer.diskStorage({}),
    
    fileFilter: (req,file,cb)=> {
        let ext = path.extname(file.originalname);
        if(ext !==".jpg"&& ext !==".png"&&ext !==".jpeg"){
            cb(
                new Error(
                    "EL FORMATO ES INCORRECTO"
                ),
                false
            );
            return;
        }
        cb(null,true);
    },
});