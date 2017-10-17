var express = require('express');
var app = express();
var router = require('./controller/router.js');
var session = require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//设置模版引擎
app.set('view engin','ejs');

//设置静态页面路径
app.use(express.static('./public'));
app.use('/images',express.static('./images'));


//设置中间件
app.get('/',router.showIndex);

//注册界面
app.get('/regist',router.showRegist);

//ajax注册表单
app.post('/doregist',router.doRegist);

//登录界面
app.get('/login',router.showLogin);
//登录请求
app.post('/dologin',router.doLogin);

//注销请求
app.get('/logout',router.logOut);

//用户信息修改界面
app.get('/setting',router.setting);
//用户信息修改表单操作
app.post('/doseeting',router.doSetting);

//显示上传界面
app.get('/uppic',router.upPic)
//图片上传处理
app.post('/doUpPic',router.doUpPic);

//图片剪切表单处理
app.get('/docut',router.doCut);
//显示图片剪切界面
app.get('/cut',router.cutPic);

//编辑文章界面
app.get('/editor',router.showEditor);
//文章表单的处理
app.post('/dopublish',router.doPublish);

//返回所需页码文章
app.get('/getallaticles',router.getAllAticles);

//获取总文章数
app.get('/getcount',router.getAllCount);

//获取用户首页
app.get('/users/:username',router.showUser);

//获取某个用户所有文章归档信息
app.get('/getuseraticles',router.getUserAticles);

//获取自己用户的文章归档信息
app.get('/myhome',router.myHome);

//文章页面显示
app.get('/articles/:articleId',router.showArticle);
//404界面呈递
app.use(function(req,res){
    res.render('404.ejs',{
        url:'/'
    });
});
app.listen(80);