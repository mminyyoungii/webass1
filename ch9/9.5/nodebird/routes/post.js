const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});


//사진 upload에 저장하고 전달해서 미리보기 
router.post('/img', upload.array('img',5), (req, res) => {
  console.log("파일 이름: ",req.files);
  let urlArr = new Array(); 
  for (let i = 0; i < req.files.length; i++) { 
    urlArr.push(`/img/${req.files[i].filename}`); 
    console.log(urlArr[i]); 
  } 
  let jsonUrl = JSON.stringify(urlArr);
  res.json(jsonUrl);

  //res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();


router.post("/", upload2.array("img", 5), async (req, res, next) => { 
  console.log(req.body.content); 
  console.log(req.body.url);
  console.log("toString()");
  console.log(req.body.url.toString()); //올린 사진 개수에 따라 배열로 나옴 
  try { 
    console.log(req.user);
    const post = await Post.create({ 
      content: req.body.content, 
      img: req.body.url.toString(), 
      UserId: req.user.id, 
      index:req.body.url.toString().split(",").length,
    });

    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all( 
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }

     res.redirect("/"); 
    } catch (error) { 
      console.error(error); 
      next(error); 
    }
   }
  );





module.exports = router;

