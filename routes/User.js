const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken")

const Authmiddleware = require("../middleware/Middleware")

const PASS_SEC = "Ankur"

const JWT_SEC = "Ankur"

//Register

router.post("/register", async (req, res) => {
   
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, PASS_SEC).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser)
    } catch (err) {
        res.status(500).json(err)
    }

})


//Login 


router.post("/login", async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(401).json("Wrong Credentials..!");
        }

        const hashedPassword = CryptoJS.AES.decrypt(user.password, PASS_SEC);

        const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (Originalpassword !== req.body.password) {
            res.status(401).json("Wrong Credentials..!");
        }

        const accessToken = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
            
        }, JWT_SEC,
            { expiresIn: "3d" }
        );

        const { password, ...others } = user._doc;

        res.status(200).json({ ...others, accessToken })

    } catch (err) {
        res.status(500).json(err)
    }

})


router.get("/getProfile",Authmiddleware,async(req,res)=>{

    const {email} = req.body;

    try {

        let user = await User.findOne({email:email});

        if(user){
            res.send({user})
        }else{
            res.send(500).send("user not logged in")
        }
        
    } catch (err) {
        
    }res.send(500).send(e.message)

})


router.post("/calculateEmi", Authmiddleware, (req,res)=>{
    const { loanAmount, interest, tenure }  = req.body

    try {
        let R = +interest/12/100;
        let E = (+loanAmount)*R*((1+R)**(+tenure))/ ((1+R)**(+tenure)-1);
        res.status(200).send(E)
    } catch (err) {
        res.status(401).send(err.message)
    }
})






module.exports = router;