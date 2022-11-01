const Entry = require('../models/entry')
exports.list = (req, res, next) => {
    // 获取消息
    Entry.getRange(0, -1, (err, entries)=>{
        if(err) return next(err);
        // 渲染HTTP响应
        res.render('entries', {
            title: 'Entries',
            entries: entries
        })
    })
}
exports.form = (req, res)=>{
    res.render('post', {'title': 'Post'})
}
exports.submit = (req,  res, next) => {
    // 来自表单命中为 “entry[...]” 的控件
    const data = req.body.entry;
    if(! data.title){
        res.error('Title is required.');
        res.redirect('back');
        return;
    }
    if(data.title.length < 4){
        res.error('Title must be longer than 4 characters.');
        res.redirect('back');
        return;
    }
    // 加载用户数据
    const user = res.locals.user;
    const username = user ? user.name: null;
    const entry = new Entry({
        username: username,
        title: data.title,
        body: data.body
    });
    entry.save((err)=>{
        if(err) return next(err);
        res.redirect('/');
    })
}