var express = require("express");
var router = express.Router();
// 生成唯一id
var { v4: uuid } = require("uuid");
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

/* GET test */
router.get("/test", (req, res, next) => {
  res.json({
    code: 200,
    msg: "访问成功 test",
  });
  next();
});

/* GET 登录 */
router.get("/login", login);

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
