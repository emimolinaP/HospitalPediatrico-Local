const cloudinary = require("cloudinary").v2;

cloudinary.config({
cloud_name:"dsi9ccmhm",
api_key:"757498267328839",
api_secret:"4_pr6eKhRR6ZnuEBNDHEYmMsbqY",
secure:true,
});

module.exports = cloudinary;