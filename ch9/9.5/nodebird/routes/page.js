const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');
const sequelize=require("sequelize");
const {writer}=require("repl")
const Op=sequelize.Op;


const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
  next();
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: 'MY_PROFILE' });
});



router.get('/msg', isLoggedIn, (req, res) => {
  res.render('msg', { title: 'MESSAGE' });
});
router.get('/new', isLoggedIn, (req, res) => {
  res.render('new', { title: 'NEW' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
});

router.get('/certification', isNotLoggedIn, (req, res) => {
  res.render('certification', { title: '인증' });
});

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick_id'],
      },
      order: [['createdAt', 'DESC']],
    });
 
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get('/search', async (req, res, next) => {
  const query = req.query.search;
  const opt=req.query.opt;

  console.log(query);
  if (!query) {
    return res.redirect('/');
  }
  try {
    let posts=[];

    if(opt=="hashtag"){

      const hashtag=await Post.findAll({
        include:[
        {  
          model:Hashtag,
          where:{
            title:{[Op.like]:"%"+query+"%"},
          },
        },
        {model: User},
        ],
      });
      if(hashtag) { posts=await hashtag;}
    }
      else if(opt=="writer") {
      const writer=await Post.findAll({
        include:{
          model:User,
          where:{
            nick_id:{[Op.like]:"%"+query+"%"},
          },
        },
      });
      if(writer) { posts=await writer;}
    }
      else if(opt=="text") {
        const text=await Post.findAll({
          where:{ content:{[Op.like]:"%"+query+"%"}}, 
          include:{model:User},  
        });if(text) { posts=await text;}
      }

      
  
    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});


//db에서 팔로우 목록 읽어와서 내림차순으로 정렬하기
router.get('/follow', async (req, res, next) => {
  try {
    const users= await User.findAll({
      order: [['createdAt', 'DESC']],
    });
    console.log("124");
    res.render('userlist', {
      title: 'NodeBird',
      twits: users,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
module.exports = router;
