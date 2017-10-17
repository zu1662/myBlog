var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var setting = require('../setting.js');

exports.insertOne = insertOne;
exports.find = find;
exports.deleteMany = deleteMany;
exports.updateMany = updateMany;
exports.getCount = getCount;
exports.ID = ID;


function ID(id){
    return new ObjectId(id);
}

//创建用户名索引
init("users","username");
init("articles","title");

function init(collectionName,key){
    _connectDB((err,db)=>{
        if(err){
            throw err;
            db.close();
        }
        db.collection(collectionName).ensureIndex({key:1});
    });
}

//连接数据库的内部函数、
function _connectDB(callback){
    var url = setting.dbUrl;
    MongoClient.connect(url, function(err, db) {
     callback(err,db);
    });
}


//插入数据模块封装
//（集合、json数据、回调函数）=》db.insertOne('student',{"name":"huazi"},callback)
function insertOne(collectionName,json,callback){
    _connectDB((err,db)=>{
        if(err){
            throw err;
            db.close();
        }
        db.collection(collectionName).insertOne(json,(err,result)=>{
            callback(err,result);
            db.close();
        });
    });
}


//find查询模块封装
//（集合、查询条件、分页参数、回调函数）=》db.find('student',{"query":{"username":"huazi"},"projection":{需要输出的字段}},{"pagesize":6,"page":3,{"sort":{key:1}}},callback)
function find(collectionName,json,A,C){
    var cursor = null;
    var result = [];
  
    _connectDB((err,db)=>{
        if(err){
            res.send(err);
            db.close();
        }
        //console.log(arguments.length);
        //迭代传入的参数，判断返回的数据
        switch(arguments.length){
            case 2:
                cursor =  db.collection(collectionName).find();
                var callback = json;
                break;
            case 3:
                cursor =  db.collection(collectionName).find(json);
                var callback = A;
                var limit = 0;
                var skipNumber=0;
                break;
            case 4:
                var callback = C;
                var args = A;
                var limit = args.pagesize || 0;
                var skipNumber = args.pagesize*args.page || 0;
                var sort = args.sort || {};
                var query = json.query || {};
                var projection = json.projection || {};
                cursor =  db.collection(collectionName).find(query,projection).limit(limit).skip(skipNumber).sort(sort);
                break;
            default:
                throw new Error('find函数参数最低2个,最多4个');
                return;
        }

     cursor.each(function(err,doc){
         if(err){
             callback(err,null);
             db.close();
             return;
         }
         if(doc != null){
             result.push(doc);
         }else{
             callback(null,result);
             db.close();
         }
         
     });
    });
}

//获取数据总数
//（集合、查询条件、回调函数）=> db.getCount("users",{},callback);
function getCount(collectionName,json,callback){
    _connectDB((err,db)=>{
        if(err){
            throw err;
            db.close();
        }

       db.collection(collectionName).find(json).count().then(function(count){
            callback(count);
            db.close();
       });
    });
}

//deleteMany删除模块封装
//（集合、json数据、回调函数）=》db.insertOne('student',{"id":"001"},callback)
function deleteMany(collectionName,json,callback){
    _connectDB((err,db)=>{
        if(err){
            throw err;
            db.close();
        }
        db.collection(collectionName).deleteMany(json,function(err,result){
            callback(err,result);
            db.close();
          });
    });
}


//updataMany修改模块封装
//（集合、被数据项、修改后的数据、回调）=》 db.updateMany('student',{"sex":"人妖"}, {$set: {"sex": "男"}},callback)
function updateMany(collectionName,json,newjson,callback){
    _connectDB((err,db)=>{
        if(err){
            throw err;
            db.close();
        }
        db.collection(collectionName).updateMany(json, newjson, function(err, result){
            callback(err,result);
            db.close();
        });
    });
}