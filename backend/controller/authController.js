const formidable = require("formidable");
const validator = require("validator");
const registerModel = require("../models/authModel");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorMessage = "";

module.exports.userRegister = (req, res) => {
  const form = formidable();
//   const form = new formidable.IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    const { userName, email, password, confirmPassword } = fields;

    const { image } = files;
    const error = [];
    if (!userName) {
      console.log("user name : ", userName);
      error.push("Please provide your user name");
    }
    if (!email) {
      error.push("Please provide your Email");
    }

    if (email && !validator.isEmail(email)) {
      error.push("Please provide your Valid Email");
    }

    if (!password) {
      error.push("Please provide your Password");
    }
    if (!confirmPassword) {
      error.push("Please provide your confirm Password");
    }
    if (password && confirmPassword && password !== confirmPassword) {
      error.push("Your Password and Confirm Password not same");
    }
    if (password && password.length < 6) {
      error.push("Please provide password mush be 6 charecter");
    }

    if (Object.keys(files).length === 0) {
      error.push("Please provide user image");
    }

    if (error.length > 0) {
      res.status(400).json({
        error: {
          errorMessage: error,
        },
      });
      console.log(error);
    } else {
      const getImageName = files.image.originalFilename;
      const randNumber = Math.floor(Math.random() * 99999);
      const newImageName = randNumber + getImageName;
      files.image.originalFilename = newImageName;
      const newPath =
        __dirname +
        `../../../frontend/public/image/${files.image.originalFilename}`;
      try {
        const checkUser = await registerModel.findOne({
          email: email,
        });

        if (checkUser) {
          res.status(404).json({
            error: {
              errorMessage: ["Your email is already registered"],
            },
          });
        } else {
          fs.copyFile(files.image.filepath, newPath, async (error) => {
            if (!error) {
              const userCreate = await registerModel.create({
                userName,
                email,
                password: await bcrypt.hash(password, 10),
                image: files.image.originalFilename,
              });

              const token = jwt.sign(
                {
                  id: userCreate._id,
                  email: userCreate.email,
                  userName: userCreate.userName,
                  image: userCreate.image,
                  registerTime: userCreate.createdAt,
                  // due to timestamp
                },
                process.env.SECRET,
                {
                  expiresIn: process.env.TOKEN_EXP,
                }
              );
              const options = {
                expires: new Date(
                  Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000
                ),
              };
              res.status(201).cookie("authToken", token, options).json({
                successMessage: "Your Registration is successful",
                token,
              });
            } else {
              res.status(500).json({
                error: {
                  errorMessage: ["Internal server error"],
                },
              });
            }
          });
        }
      } catch (error) {
        res.status(500).json({
          error: {
            errorMessage: ["Internal server error"],
          },
        });
      }
    }
  });
};

module.exports.userLogin = async (req, res) => {
  const error = [];
  const { email, password } = req.body;
  console.log("User Login : ", email, password);
  if (!email) {
    error.push("Please provide your Email");
  }

  if (email && !validator.isEmail(email)) {
    error.push("Please provide your Valid Email");
  }

  if (!password) {
    error.push("Please provide your Password");
  }
  if (error.length > 0) {
    res.status(400).json({
      error: {
        errorMessage: error
      },
    });
  } else {
    try {
      const checkUser = await registerModel
        .findOne({
          email: email,
        })
        .select("+password");
      console.log("IN TRY : ", checkUser);
      if (checkUser) {
        console.log(" CHEKC USER : ", checkUser);
        const matchPassword = await bcrypt.compare(
          password,
          checkUser.password
        );
        console.log(" PASSWORD : ", matchPassword);
        if (matchPassword) {
          const token = jwt.sign(
            {
              id: checkUser._id,
              email: checkUser.email,
              userName: checkUser.userName,
              image: checkUser.image,
              registerTime: checkUser.createdAt
              // due to timestamp
            },
            process.env.SECRET,
            {
              expiresIn: process.env.TOKEN_EXP
            }
          );
          const options = {
            expires: new Date(
              Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000
            ),
          };
          res.status(201).cookie("authToken", token, options).json({
            successMessage: "Your login is successful",
            token,
          });
        } else {
          res.status(400).json({
            error: {
              errorMessage: ["Your Password is incorrect"]
            },
          });
        }
      } else {
        res.status(400).json({
          error: {
            errorMessage: ["Your email is not found"]
          },
        });
      }
    } catch {
      res.status(404).json({
        error: {
          errorMessage: ["Internal Server Error"]
        },
      });
    }
  }
};
module.exports.userLogout=(req,res)=>{
  // we have made the authToken empty,the one in inspect in application 
   res.status(200).cookie('authToken','').json({
    success:true
  })
}