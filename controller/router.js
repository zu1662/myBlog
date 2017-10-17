var formidable = require('formidable');
var db = require('../modules/db_IDUF.js');
var md5 = require('../modules/md5.js');
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var timestamp = require('time-stamp');
//暴露相关方法
exports.showIndex = showIndex;
exports.showRegist = showRegist;
exports.doRegist = doRegist;
exports.logOut = logOut;
exports.showLogin = showLogin;
exports.doLogin = doLogin;
exports.setting = setting;
exports.doSetting = doSetting;
exports.doUpPic = doUpPic;
exports.upPic = upPic;
exports.cutPic = cutPic;
exports.doCut= doCut;
exports.showEditor = showEditor;
exports.doPublish =doPublish;
exports.getAllAticles = getAllAticles;
exports.getAllCount = getAllCount;
exports.showUser = showUser;
exports.getUserAticles = getUserAticles;
exports.myHome = myHome;
exports.showArticle = showArticle;
//显示首页
function showIndex(req,res,next){
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }

        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }
        
        res.render('../views/index.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"index"
        });
    });
}

//显示注册页面
function showRegist(req,res,next){
    res.render('../views/regist.ejs');
}

//进行注册表单的处理
function doRegist(req,res,next){
    var form = new formidable.IncomingForm();
    
       form.parse(req, function(err, fields, files) {
         //判断前端过来的的用户名在数据库中是否存在
         var username = fields.username;
         var password = fields.password;
         //console.log(username);
         db.find('users',{"username":username},function(err,result){
           // console.log(result.length);

            if(err){
                //服务器错误
                res.send('-2');
                return;
            }
            if(result.length != 0){
                //已存在此用户名
                res.send('-1');
                return;
            }else{
                 //密码进行MD5加密
                password = md5(md5(password)+'huazi');
                db.insertOne('users',{"username":username,"password":password,"avatar":"/images/avatar/avatar.jpg"},function(err,result){
                    if(err){
                        //服务器错误
                        res.send('-2');
                        return;
                    }
                
                    //写入session
                    req.session.login = "1";
                    req.session.username = username;

                    res.send('1');
                });
            }
        });
       });
}

//进行注销操作
function logOut(req,res,next){
    req.session.destroy(function(err) {
        if(err){
            res.send('-1');
            return;
        }  
        // req.session.loginUser = null;
        res.clearCookie(req.session);
        res.redirect('/');
    });
}

//显示登录界面
function showLogin(req,res,next){
    res.render('../views/login.ejs');
}

//执行登录表单处理操作
function doLogin(req,res,next){
    var form = new formidable.IncomingForm();
    
    form.parse(req, function(err, fields, files) {
        var username = fields.username;
        var password = fields.password;

        //查找数据库，1、判断是否存在用户名；2、判断密码是否正确
        db.find('users',{"username":username},function(err,result) {
            if(err){
                res.send('-3');//服务器错误
                return;
            }
            //console.log(result);
            if(result.length == 0){
                //不存在此用户
                res.send('-1');
                return;
            }else{
               // 用户输入的密码进行转换
               password = md5(md5(password)+'huazi');
                //存在用户名，判断密码是否正确
                if(result[0].password == password){
                   
                    //设置session
                    req.session.login = '1';
                    req.session.username = username;
                    
                    res.send('1');
                    return;
                }else{
                    res.send('-2');//用户名不一致
                    return;
                }
            }
        });
    });
}


//显示上传界面
function upPic(req,res,next){
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }

        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }
        
        res.render('../views/upPic.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"index"
        });
    });
}
//上传头像操作
function doUpPic(req,res,next){
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname ,"../images/temp");
    
       form.parse(req, function(err, fields, files) {
            var oldpath = files.avatarFile.path;
            var extname = path.extname(files.avatarFile.name);
            var newpath = path.join(__dirname,'../images/temp/',(req.session.username+extname));
            fs.rename(oldpath,newpath,function(err){
                if(err){
                   res.send('-1');
                    return;
                }
                req.session.avatar = (req.session.username + extname);
                res.redirect('/cut');
            });
       });
}

//显示图片剪切界面
function cutPic(req,res,next){
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }

       var avatar = req.session.avatar;
        res.render('../views/cut.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "avatar":avatar
        });
    });
}

//图片剪切表单处理
function doCut(req,res,next){
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    //console.log(w,h,x,y);
     
    //裁剪图片，并存到avatar目录
    gm("./images/temp/" + filename)
    .crop(w, h, x, y)
    .resize(100, 100, "!")
    .write("./images/avatar/" + filename, function (err) {
        if (err) {
            res.send("-1");
            return;
        }
        
        //更改数据库当前用户的avatar这个值
        db.updateMany("users", {"username": req.session.username}, {
            $set: {"avatar":"/images/avatar/"+req.session.avatar}
        }, function (err, results) {
            if(err){
                throw err;
                return;
            }
            res.send("1");
        });

         //删除temp文件夹内缓存图片内容
        fs.unlink("./images/temp/" + filename,(err)=>{
            if(err){
                console.log(err);
            }
        });
    });

}

//显示信息修改界面
function setting(req,res,next){
    if (req.session.login != "1") {
        res.send("此页面需要登录，请先登录！！");
        return;
    }
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        
        if(err){
            res.send('服务器抽风中，请稍后重试！！');
        }

        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
            var singna = result[0].singna;
            var intro = result[0].intro;
        }
        
        res.render('../views/setting.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"setting",
            "singna":singna,
            "intro":intro
        });
    });
}
//执行设置用户信息表单操作
function doSetting(req,res,next){
    var form = new formidable.IncomingForm();
    
       form.parse(req, function(err, fields, files) {
           var username = req.session.username;
            
           //更改数据库当前用户的【信息】值
            db.updateMany("users", {"username": req.session.username}, {
                $set: {"singna":fields.singna,"sex":fields.sex,"hobby":fields.hobby,"intro":fields.intro}
            }, function (err, results) {
                if(err){
                    res.send('-1');
                    return;
                }
                res.send("1");
            });
       });
}

//显示编辑界面
function showEditor(req,res,next){
    if (req.session.login != "1") {
        res.send("此页面需要登录，请先登录！！");
        return;
    }
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }

        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }
        
        res.render('../views/editor.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"editor"
        });
    });
}

//文章表单的处理
function doPublish(req,res,next){
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname ,"../images/temp");
       form.parse(req, function(err, fields, files) {
            var username = req.session.username;
            var pubtime = timestamp('YYYY-MM-DD HH:mm');
           //两种情况，上传图片和没有图片的情况！！
           //console.log(files);
            if(files.introImg.size != 0){
                var oldpath = files.introImg.path;
                var extname = path.extname(files.introImg.name);
                var newpath = path.join(__dirname,"../images/articles/intro-img",timestamp('YYYYMMDDHHmmss')+extname);
            // console.log(pubtime);
                fs.rename(oldpath,newpath,function(err){
                    if(err){
                        res.send('服务器抽风了，请稍后重试！！');//重命名文件失败，返回失败信息
                        return;
                    }
                    //如果改名成功，把数据写入数据库内
                    db.insertOne('articles',{
                        "username":username,
                        "title":fields.title,
                        "author":fields.author,
                        "intro":fields.intro,
                        "field":fields.field,
                        "pubtime":pubtime,
                        "introImg":newpath
                    },function(err,result){
                        if(err){
                            res.send('发布文章失败！！');//写入数据库失败
                            return;
                        }
                        //发布成功，转到首页
                        res.redirect('/');
                    });

                });
           }else{
                db.insertOne('articles',{
                    "username":username,
                    "title":fields.title,
                    "author":fields.author,
                    "intro":fields.intro,
                    "field":fields.field,
                    "pubtime":pubtime
                },function(err,result){
                    if(err){
                        res.send('发布文章失败！！');//写入数据库失败
                        return;
                    }
                    //发布成功，转到首页
                    res.redirect('/');
                });
           }        
       });
}

//获取某页码的文章总数
function getAllAticles(req,res,next){
    var page = req.query.page;
    var pagesize =parseInt(req.query.pagesize) ;
    //console.log(pagesize,page);
    db.find('articles',{"query":{},"projection":{
            "title":1,
            "pubtime":1,
            "_id":1,
            "intro":1,
            "introImg":1,
            "username":1
    }},{"pagesize":pagesize,"page":page-1,"sort":{"pubtime":-1}},function(err,result){
        if(err){
            res.send('-1');//获取文章信息失败
            return;
        }
        res.send(result);
        
    });
}

//获取总的文章数
function getAllCount(req,res,next){
    db.getCount('articles',{},function(result){
        res.send(result+'');
    });
}

//获取用户首页
function showUser(req,res,next){
    var user = req.params['username'];
    // if (req.session.login != "1") {
    //     res.send("此页面需要登录，请先登录！！");
    //     return;
    // }
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }
        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }

        res.render('../views/user.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"index",
            "user":user
        });
    });
        
}

//获取用户所有文章归档信息
function getUserAticles(req,res,next){
    var username = req.query.user;
    //console.log(username);
    db.find('articles',{"query":{"username":username},"projection":{
        pubtime:1,
        title:1
    }},{"sort":{"pubtime":-1}},function(err,result){
        if(err){
            res.send('-1');
            return;
        }

        res.send(result);
    });
}

//获取自己首页
function myHome(req,res,next){
    if (req.session.login != "1") {
        res.send("此页面需要登录，请先登录！！");
        return;
    }
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }
        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            var avatarUrl = result[0].avatar;
        }

        res.render('../views/user.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"myhome",
            "user":username
        });
    });
}

//显示文章页面
function showArticle(req,res,next){
    var avatarUrl;
    var username = req.session.username;
    //根据用户名查找用户头像
    db.find('users',{"username":username},function(err,result){
        //console.log(result);
        if(err){
            res.send('服务器抽风中，请稍后！！');
        }
        //当result[0]没有结果时，使用result[0].avatar会报错，所以需要规避
        if(result[0] != null){
            avatarUrl = result[0].avatar;
        }

    });


    var id = req.params['articleId'];

    db.find('articles',{"_id":db.ID(id)},function(err,result){
        //console.log(result);
        res.render('../views/article.ejs',{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login == "1" ? req.session.username :"",
            "avatarUrl":avatarUrl,
            "active":"index",
            "title":result[0].title,
            "field":result[0].field,
            "author":result[0].username,
            "pubtime":result[0].pubtime
        });
     });
}

