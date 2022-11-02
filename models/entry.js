const redis = require('redis');
// 创建redis客户端实例
const db = redis.createClient({url: "redis://10.20.0.22:9379/14"});

class Entry {
    constructor(obj){
        // 循环遍历传入对象中的键
        for (let key in obj){
            // 合并值
            this[key] = obj[key];
        }
    }
    save(cb){
        // 将保存的消息转换为JSON字符串
        const entryJSON = JSON.stringify(this);
        // 将JSON字符串保存到redis列表中
        db.lPush('entries', entryJSON, (err)=>{
            if(err) return cb(err);
            cb();
        });
    }
    static getRange(from, to, cb){
        // 获取消息记录的redis lRange 函数
        db.lRange('entries', from, to, (err, items)=>{
            if(err) return cb(err);
            let entries = [];
            items.forEach((item) => {
                // 解码之前保存为JSON的消息记录
                entries.push(JSON.parse(item))
            });
            cb(null, entries);
        })
    }
}

module.exports = Entry;