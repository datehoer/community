const redis = require('redis');
const bcrypt = require('bcrypt');
// 创建redis客户端实例
const db = redis.createClient({url: "redis://10.20.0.22:9379/14"});
db.connect()
async function redisCommand(){

}
async function bcryptHash(pass, salt){
    // 生成哈希
    let result = await bcrypt.hash(pass, salt)
    return new Promise((resolve, reject)=>{
        resolve(result)
    })
}
async function genSalt(){
    // 生成有12个字符的盐
    let sale = await bcrypt.genSalt(12)
    return new Promise((resolve, reject)=>{
        resolve(sale)
    })
}
class User{
    constructor(obj){
        for(let key in obj){
            this[key] = obj[key]
        }
    }
    static getByName(name){
        User.getId(name)
    }
    static getId(name){
        db.get(`user:id:${name}`)
            .then(res=>{
                User.get(res)
            })
    }
    static get(id){
        db.hGetAll(`user:${id}`)
            .then(res => {
                new User(res)
            })
    }
    static authenticate(name, pass, cb){
        User.getByName(name, (err, user)=>{
            if(err) return cb(err);
            if(!user.id) return cb();
            bcryptHash(pass, user.salt, (err, hash)=>{
                if(err) return cb(err);
                if(hash == user.pass) return cb(null, user)
                cb()
            })
        })
    }
    save(cb){
        // 如果设置了id则表示用户已存在
        db.get(`user:id:${this.name}`)
            .then(res=>{
                this.id = res
            })
            .catch(e=>{
                cb(e)
            })
        if(this.id){
            this.update(cb);
        }else{
            // 创建唯一ID
            db.incr('user:ids')
                .then(res=>{
                    // 设置ID方便保存
                    this.id = res;
                    // 密码哈希
                    this.hashPassword((err)=>{
                        if(err) return cb(err);
                        // 保存用户属性
                        this.update(cb);
                    });
                })
                .catch(err =>{
                    if(err) return cb(err);
                })
        }
    }
    update(cb){
        const id = this.id;
        // 用户名称索引用户id
        db.SET(`user:id:${this.name}`, id)
            .then(res =>{
                db.hSet(`user:${id}`, Object.entries(this), (err)=>{
                    cb(err);
                })
            })
            .catch(e=>{
                if(e) return cb(e);
            })
    }
    hashPassword(cb){
        genSalt()
            .then(res=>{
                bcryptHash(this.pass, res)
                    .then(result=>{
                        this.pass = result
                        cb();
                    })
            })
    }
}

// const user = new User({name: 'Example', pass: 'tes1t'});

// user.save((err)=>{
//     if(err) return console.error(err);
//     console.log('user id %d', user.id);
// })

User.getByName('Example')


db.quit()