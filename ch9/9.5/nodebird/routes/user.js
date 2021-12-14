const express = require('express');
const { smtpTransport } = require('../config/email');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/unfollow', isLoggedIn, async(req,res,next) => {
   try{ 
     const user = await User.findOne({ where: {id: req.params.id } });
      if (user){ //데이터베이스에서 찾은 사용자가 있다면 
        await user.removeFollower(parseInt(req.user.id)); //팔로잉 끊기 
        res.send('success'); 
      }
     } catch (error){ 
       next(error); 
      }
 });

  

module.exports = router;


// var generateRandom = function (min, max) {
//   var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
//   return ranNum;
// }

// const auth = {
//   SendEmail : async(req, res) => {
//       const number = generateRandom(111111,999999)

//       const { sendEmail } = req.body;

//       const mailOptions = {
//           from: "정욱이네러버덕",
//           to: sendEmail,
//           subject: "[러버덕]인증 관련 이메일 입니다",
//           text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
//       };

//       const result = await smtpTransport.sendMail(mailOptions, (error, responses) => {
//           if (error) {
//               return res.status(statusCode.OK).send(util.fail(statusCode.BAD_REQUEST, responseMsg.AUTH_EMAIL_FAIL))
//           } else {
//             /* 클라이언트에게 인증 번호를 보내서 사용자가 맞게 입력하는지 확인! */
//               return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMsg.AUTH_EMAIL_SUCCESS, {
//                   number: number
//               }))
//           }
//           smtpTransport.close();
//       });
//   }
// }