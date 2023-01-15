var express = require("express");
var router = express.Router();
var _ = require("lodash");
// 生成唯一id
var { v4: uuid } = require("uuid");
// 实用工具
const { inspect } = require("util");
const {
  existsSync,
  appendFileSync,
  writeFileSync,
} = require("fs");;
const { 
  resolve,
  extname
 } = require("path");
// 文件数据库
var lowdb = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
const menu = new FileSync("./db/menu.json");
const role = new FileSync("./db/role.json");
// 菜单表
const db_menu = lowdb(menu);
// 角色表
const db_role = lowdb(role);
const { login } = require("../api/user");
const { downloadFilesByUrl, getFileByPath } = require("../utils/index")

const production = process.env.NODE_ENV == "production" ? "pro" : 'dev'
/* GET test */
router.get("/test", (req, res, next) => {
  res.json({
    code: 200,
    msg: "访问成功 test",
  });
});

/* GET 登录 */
router.get("/login", login);

/* POST 文件上传 */
router.post("/upload_files", async (req, res, next) => {
    const { file } = req.files || {} // 文件对象
    if(!file){
      res.json({
        code: 1001,
        msg: "请选择文件!",
      });
      return;
    }
    const {  
      name,
      type,
      size,
      fileName,
      uploadedSize,
    } = req.body;
    console.log(req.body)
    const filename = fileName // + extname(name)
    const filePath = resolve(__dirname,'../download/',filename)
    let files_url = {
      dev :'http://localhost:8081/download/',
      pro :'https://service-2v8ie360-1307934606.gz.apigw.tencentcs.com/release/download/'
    }

    // if(uploadedSize !== '0'){
    //   if(!existsSync(filePath)){
    //     res.send({
    //       code: 1003,
    //       msg: ""
    //     })
    //     return
    //   }
    //   appendFileSync(filePath,file.data)
    // }
    writeFileSync(filePath, file.data);
    res.json({
      code: 200,
      msg: 123,
      data:{
        file_url: files_url[production] + filename
      }
    });
});

/* GET 返回菜单列表 */
router.get("/menu/query", async (req, res, next) => {
  res.json(db_menu.get("menu").value());
});

/* GET 新增菜单 */
router.get("/menu/add", async (req, res, next) => {
  // id为父级id
  let { parentId, path, title, icon, componentName } = req.query;
  if (parentId && path && title && icon && componentName) {
    let parentMenu = db_menu.get("menu").find({ id: parentId }).value();
    if (parentMenu) {
      let currentId = uuid(); //生成唯一ID
      let currentMenu = {
        id: currentId,
        url: `${parentMenu.url}${path[0] === "/" ? "" : "/"}${path}`,
        path,
        componentName,
        meta: {
          title,
          icon,
          auth: [],
        },
        children: [],
      };
      db_menu.get("menu").push(currentMenu).write(); //数据库添加菜单表
      parentMenu.children.push(currentId);
      db_menu
        .get("menu")
        .find({ id: parentId })
        .assign({ children: parentMenu.children })
        .write();
      res.json(db_menu.get("menu").value()); //返回新菜单表
    } else {
      res.json({ code: 400, msg: "参数不合法" });
    }
  } else {
    res.json({ code: 400, msg: "参数不合法" });
  }
  next();
});

/* GET 删除菜单 */
router.get("/menu/delete", async (req, res, next) => {
  let { ids } = req.query;
  if (ids.length) {
    ids.forEach((id) => {
      let parentNode = db_menu
        .get("menu")
        .find((item) => {
          return item.children.indexOf(id) > -1;
        })
        .value();
      let updatedChildren = parentNode.children.filter((v) => v !== id);

      db_menu
        .get("menu")
        .find((item) => {
          return item.children.indexOf(id) > -1;
        })
        .assign({ children: updatedChildren })
        .write();
      db_menu.get("menu").remove({ id }).write();
    });
    res.json(db_menu.get("menu").value());
  } else {
    res.json({ code: 400, msg: "参数不合法" });
  }
  next();
});

/* GET 更新菜单 */
router.get("/menu/update", async (req, res, next) => {
  console.dir(req.query)
  if (_.has(req.query, "id", "path", "title", "icon")) {
    let { id, path, title, icon } = req.query;
    db_menu
      .get("menu")
      .find({ id })
      .assign({ path, meta: { title, icon, auth: [], modify: false } })
      .write();
    // componentName
    res.json(db_menu.get("menu").value());
  } else {
    res.json({ code: 400, msg: "参数不合法" });
  }
  next();
});

/* GET 获取全部角色 */
router.get("/role/query", async (req, res, next) => {
  let result = db_role.get("role").value();
  res.json({
    code: 200,
    msg: "ok",
    result,
  });
  next();
});

module.exports = router;
