const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
var appDir = path.dirname(require.main.filename);
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');


router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick_id,name, password } = req.body;

  let authNum= Math.random().toString().substring(2,6);       

  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const exUser2 = await User.findOne({ where: { nick_id } });
    if (exUser2) {
      return res.redirect('/join?error=exist');
    }
    let emailTemplete;
    ejs.renderFile(appDir+'/template/authMail.ejs', {authCode : authNum}, function (err, data) {
      if(err){console.log(err)}
      emailTemplete = data;
    });
    
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
      },
    });

    let mailOptions = await transporter.sendMail({
      from: `SSUS`,
      to: req.body.email,
      subject: '회원가입을 위한 인증번호를 입력해주세요.',
      html: emailTemplete,
    });
    
    transporter.close();
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick_id,
      name,
      password: hash,
      certi:authNum,
      
    });
    return res.redirect('/certification');
  } catch (error) {
    console.error(error);
    return next(error);
  }

  
});

router.post('/certification', isNotLoggedIn, (req,res,next)=>{
    const email_c=req.body.email_c;
    const now = new Date();
    try{
      User.findOne({where:{certi:email_c}}).then((user) =>{
        console.log(user.iscerti);
        if(user){
            user.update({iscerti:true});
          console.log(user.iscerti);
        }

      });
      return res.redirect("/");
      }catch(error){
        console.error(error);
        return next(error);
    }

});


router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    if(!user.iscerti){
      return res.redirect("/certification");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});



router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});


// router.get('/kakao', passport.authenticate('kakao'));

// router.get('/kakao/callback', passport.authenticate('kakao', {
//   failureRedirect: '/',
// }), (req, res) => {
//   res.redirect('/');
// });

module.exports = router;
