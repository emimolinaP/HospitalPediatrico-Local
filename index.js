const express = require("express");
const app = express();
const path = require("path");
const morgan = require("morgan");
const session = require("cookie-session");
const nodemailer = require("nodemailer");
const  imgbbUploader  =  require ( "imgbb-uploader" ) ;
//Base de Datos
const mongoose = require("mongoose");
const Admin = require("./models/myModel");
const PostModel = require("./models/postModel");
const upload = require("./js/multer")
const cloudinary = require("./js/cloudinary");
//hashS
const bcrypt = require("bcrypt");
const { stringify } = require("querystring");

//variables globales para el logeo y los sweetsalert
global.isLogin = 0;
global.login = false;
global.idPosts=1;
global.formulario=1;
global.cerrar=0;
global.contactSweet=false;


//vistas
app.set("view engine", "ejs");
//Defino la localización de mis vistas
app.set("views", path.join(__dirname, "views"));

//Middlewares
app.use(
    session({
        login: false,
        cerrar:false,
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true },
    })
);


app.use(morgan("dev"));
//Middleware para poder obtener data de los requests con BodyParser
app.use(express.json());
//Configurando archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const port = 3300;

//Corremos el servidor en el puerto seleccionado
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port} correctamente`);
});

// Falta de mantenimiento en la base de datos, se cerró...
/* mongoose.connect("mongodb+srv://AsmaGrave:asmagrave2022@asmagravep.fqctihf.mongodb.net/?retryWrites=true&w=majority", {
    serverSelectionTimeoutMS:0, // Defaults to 30000 (30 seconds)
}) 
.then((con) => {
    console.log("Conectado a la DB");
}); */


//controlador principal
app.get("/", (req, res) => {
    isLogin= 0;
    res.status(200).render("index", { login: req.session.login, isLogin: isLogin, cerrar:0, contactSweet:false});
});

//Controlador de Admin
app.get("/login", (req, res) => {
    res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
});

app.post("/login", (req, res) => {
    //Admin.find({ apellido :1  }, (err, docs) => {
        if(req.body.usuario != "Doctor"){
            isLogin = 2;
            res.status(200).render("login", { isLogin: isLogin, login: req.session.login });
        }
        else{
            bcrypt.compare(req.body.contraseña,bcrypt.hashSync("adm", 5),(err, resul) => {
                if (err) throw err;

                if (resul) {
                    req.session.login = true;
                    res.status(200).redirect("/seccionAdmin");                  
                }     
                else {
                    res.status(200).render("login", {isLogin: 2,login: req.session.login});
                }
            });
        }
    }); 
//});

app.get('/seccionAdmin', (req, res) => {
    if(req.session.login){
                res.status(200).render("edicionPosteos", );
            }
    else{
        res.status(200).render("index", {isLogin: 4,login: req.session.login, cerrar:0 , contactSweet:false}); 
    }
});

app.get("/config", (req, res) => {
    if(req.session.login){
        Admin.find({ apellido:1 }, (err, post) => {  
            console.log(post);
            res.status(200).render("config",{isLogin:5,login:req.session.login,data:post});
        });
        
    }
    else{
        res.status(200).render("index", {login: req.session.login,isLogin: 4, cerrar:0 , contactSweet:false});
    }
});

app.get("/postear", (req, res) => {
    if(req.session.login){
        Admin.find({ apellido:1 }, (err, post) => {  
        res.status(200).render("postPrueba", { isLogin: isLogin, login: req.session.login, data:post });
        PostModel.findOne().sort({id: -1}).exec(function(err, post) {   
            console.log("Ultimo Id:"+post.id.toString());
            idPosts=post.id;
        });
        });
        
    }
    else{
        res.status(200).render("index", {isLogin: 4,login: req.session.login, cerrar:0 , contactSweet:false}); 
    }
});

app.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.login =false;  
        res.status(200).render("index", {isLogin: 4,login: req.session.login, cerrar:1 , contactSweet:false}); 
        //cerrar=true;
    } else {
        res.redirect("/");
    }
});

app.get("/error404", (req, res) => {
    res.status(200).render("error404");

});

app.post("/upload", (req, res) => {
    if(!req.files) {
        return res.status(400).send("No files were uploaded.");
    }
    const file = req.files.foto;
    const path ="./public/files/" + file.name;
    console.log("HOAA"+path);
    file.mv(path, (err) => {
    if(err) {
        return res.status(500).send(err);
    }
    console.log("/files/" + file.name);
        imgbbUploader("04facdbd2e755d55e56fdc0f9e422f92", "./public/files/" + file.name)
                    .then((res) => console.log(res.url))
                    .catch((error) => console.error(error));
    return res.send({ status: "success", path: path });
    });
});

app.get('/visualizar/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }, (err, post) => {  
        console.log(post);
        res.status(200).render("visualizarPost", {data:post});
    }); 
});

app.get('/eliminarPost/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }).remove().exec();
    PostModel.find().sort({id: -1}).exec(function(err, post) {   
        console.log(post);
        res.status(200).render("edicionPosteos", {data:post});
    });
    res.redirect("/seccionAdmin");
    
});

app.get('/verPostsUsuario', (req, res) => {
    PostModel.find(function(err, data) {
        if(err){
            console.log(err);
        }
        else{
            console.log(data);
            PostModel.find().sort({id: -1}).exec(function(err, post) {   
                console.log(post);
                res.status(200).render("verPostsUsuario", {data: post,login:req.session.login});
            });
            
        }
    }); 
});

app.get('/contactanos', (req, res) => {
    PostModel.find(function(err, data) {
        if(err){
            console.log(err);
        }
        else{
            console.log(data);
            res.status(200).render("vistaContacto", {data: data,login:req.session.login });
        }
    }); 
});


app.get('/editarpost/:id', (req, res) => {
    var id= req.params.id;
    PostModel.find({ id:id }, (err, post) => {  
        console.log(post);
        res.status(200).render("editPosteo", {data:post});
    });
    
});

app.post('/editarposteo/:id', (req, res) => {
    var id= req.params.id;
    PostModel.findOneAndUpdate({ id: id },
    { $set: { titulo: req.body.titulo,descripcion: req.body.descripcion,fecha: req.body.fecha,enlace: req.body.enlace,tags: req.body.tag} }, { new: true }, function (err, doc) {
        if (err) console.log("Error ", err);
                console.log("Updated Doc -> ", doc);
                PostModel.find().sort({id: -1}).exec(function(err, post) {   
                    console.log(post);
                    res.status(200).render("edicionPosteos", {data:post});
                });
                
            });
});

app.get("/visualizar/:id",  (req, res) => {
    let id= req.params.id;
    PostModel.find({ id:id }, (err, post) => {  
        console.log(post);
        res.status(200).render("visualizarPost", {data:post});
    }); 
});

app.get("/kinesiologia", (req, res) => {
   res.status(200).render("kinesiologia", {login:req.session.login });
});

app.get("/saludMental", (req, res) => {
    res.status(200).render("saludmental");
});

app.get("/neumonologia", (req, res) => {
    res.status(200).render("neumonologia");   
});

app.post("/contactForm1", async (req, res) => {
    console.log("ENTRE"+req.body.nombreCompleto);
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "envioconsultasasma@gmail.com",
            pass: "lrtcjwvnleeczvdt"
        }
      });
    let contenido = {
        from: 'envioconsultasasma@gmail.com', // sender address
        to: 'programaasmagrave@gmail.com', // list of receivers
        subject: "consulta de paciente", // Subject line
        text:
            "\n" +
            "Nombre:"+
            "\n" +
            req.body.nombreCompleto +
            "\n" +
            "Numero:"+
            "\n" +
            req.body.telefono +
            "\n" +
            "consulta:" +
            "\n" +
            req.body.consulta +
            "\n" +
            "mail del paciente:" +
            "\n" +
            req.body.email, // plain text body
    };
    transporter.sendMail(contenido, function (err, data) {
        if (err) {
            res.status(200).render("index", { login: req.session.login, isLogin: isLogin, cerrar:0, contactSweet:false});
            console.log(`error encontrado : ${err}`);
        } else {
            res.status(200).render("index", { login: req.session.login, isLogin: isLogin, cerrar:0, contactSweet:true});
            console.log(`Email enviado`);
        }
    });
});
app.post("/subirpost",upload.single("imagen"),(req, res) => {
    let fecha=req.body.fecha;
    let titulo= req.body.titulo;
    let descripcion = req.body.descripcion;
    let imagen;
    let enlace = req.body.enlace;
    let tag = req.body.tag;

    let cloudinary_image = cloudinary.uploader.upload(req.file.path,{folder: "fotos",}).then(result=>{
        PostModel.findOne().sort({id: -1}).exec(function(err, post) {   
            idPosts=post.id;
        let posteo = new PostModel({
        id:idPosts+1,
        fecha: fecha,
        titulo: titulo,
        descripcion: descripcion,
        imagen: result.url,
        enlace: enlace,
        tags: tag,
        });  
        posteo.save((err,db)=>{
            if(err){
            console.log(err);
            res.status(200).render("index", {isLogin: 8,login: req.session.login, cerrar:0, contactSweet:false }); 
            } 
            else{
            res.status(200).render("index", {isLogin: 7,login: req.session.login, cerrar:0, contactSweet:false }); 
            } 
            })
        }); 
    });   
});



app.post("/ChangeDatos", (req, res) => {
    if (req.session.login) {
        Admin.findOneAndUpdate({ nombre: "admin" },{ $set: { contraseña: req.body.contraseña } }, { new: true }, function (err, doc) {
            if (err) console.log("Error ", err);
            console.log("Updated Doc -> ", doc);
        });

        Admin.findOneAndUpdate({ nombre: "admin" },{ $set: { usuario: req.body.usuario } }, { new: true }, function (err, doc) {
            if (err) console.log("Error ", err);
            console.log("Updated Doc -> ", doc);
        });
    }
    res.status(200).render("login", { isLogin: 4, login: req.session.login });
});

app.get("/*", (req, res) => {
    res.status(200).render("error404"); 
});

app.post("/cargarImagen",upload.single("imagen"),(req, res) => {
    let cloudinary_image = cloudinary.uploader.upload(req.file.path,{folder: "fotos",}).then(result=>{
        Admin.findOneAndUpdate({ nombre: "admin" },{ $set: { avatar: result.url } }, { new: true }, function (err, doc) {
            if (err) console.log("Error ", err);
            console.log("Updated Doc -> ", doc);
            Admin.find({ apellido:1 }, (err, post) => {  
                console.log(post);
                res.status(200).render("config",{isLogin:5,login:req.session.login,data:post});
            });
        });
        
    });     
});

module.exports = app;
