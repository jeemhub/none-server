
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require("./fir-firebase-cb9e4-firebase-adminsdk-8oi2h-524a972666.json");
const jwt = require('jsonwebtoken');
const KEY = 'r3rewr';
var bodyParser = require('body-parser')
const cors = require("cors")
require("dotenv").config();
app.use(express.json());
app.use(cors())
app.use(bodyParser())
app.use(express.urlencoded({ extend: true }));
admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

const db = admin.firestore();
app.get("/", (req, res) => {
  res.json({
    "/signup": {
      method: "Post",
      email: "String",
      password: "String",
      name: "String",
      username: "String",
      function: "لانشاء حساب جديد"

    },
    "/login": {
      method: "Post",
      email: "String",
      password: "String",
      function: "لتسجيل الدخول"
    },
    "/user": {
      method: "Get",
      username: "String",
      function: "يعطيك بيانات غير حساسة عن المستخدم"
    },
    "/username": {
      method: "Get",
      token: "String",
      function: "يعطيك معلومات  حساسة عن المستخدم"
    },
    "/items/delete": {
      method: "Post",
      token: "String",
      id: "number",
      function: "حذف دعاء من المستخدم"
    },
    "/items/add": {
      method: "Post",
      token: "String",
      id: "number",
      Function: "اضافه دعاء للمستخدم"
    },
    "/items": {
      method: "Get",
      Function: "يعطيك جميع الادعية في الموقع"
    },
    "/items/user": {
      method: "Get",
      token: "String",
      Function: "يعطيك الادعية التي لم تقوم باضافتها"
    }

  })
})
/*
لانشاء حساب جديد 
المطلوب :
#email
#password
#name
#username

*/
app.get('/test12', (req, res) => {
  res.json({ msg: "123123" });
})
app.post('/signup', async (req, res) => {
  //تحقق من اسم المستخدم
  if (!req.body.username) {
    res.json({ msg: "ادخل اسم المستخدم من فضلك" })
  }
  //تحقق من الاسم
  if (!req.body.name) {
    res.json({ msg: "ادخل الاسم من فضلك" })
  }
  //تحقق من الايميل
  if (!req.body.email) {
    res.json({ msg: "ادخل الايميل من فضلك" })
  }
  //تحقق من كلمة السر
  if (!req.body.password) {
    res.json({ msg: "ادخل كلمة السر من فضلك" })
  }
  const emailverify = db.collection("Users").doc(`${req.body.email}`);
  const emailresponse = await emailverify.get();
  const usernameverify = db.collection("Users").doc(`${req.body.username}`);
  const usernameresponse = await usernameverify.get();

  const item = [
    {
      id: 1,
      title: "استغفر الله",
      number: 0,
      isSetNumber: false
    },
    {
      id: 2,
      title: "الحمد لله",
      number: 100,
      isSetNumber: true
    },
    {
      id: 3,
      title: "اللهم صل وسلم على نبينا محمد",
      number: 10,
      isSetNumber: true
    }
  ]
  jwt.sign({
    email: req.body.email,
    password: req.body.password
  }, KEY, (err, token) => {
    if (err) throw err;
    if (!emailresponse.data()) {
      if (!usernameresponse.data()) {
        db.collection('Users').doc(req.body.email).set({
          email: req.body.email,
          password: req.body.password,
          username: req.body.username,
          name: req.body.name,
          token: token,
          description: "اتمنى منك قراءة هذه الأذكار بارك الله فيك..",
          items: item
        });
        db.collection('Users').doc(req.body.username).set({
          username: req.body.username,
          name: req.body.name,
          description: "اتمنى منك قراءة هذه الأذكار بارك الله فيك..",
          items: item
        });

        res.json({ msg: "تم انشاء حساب" })
      } else {
        res.json({ msg: "اسم المستخدم تم استخدامه بالفعل" })
      }
    } else {
      res.json({ msg: "تم استخدام الايميل بالفعل" })
    }
  })
})
/*
لقراءة جميع البيانات
 */
app.get('/read/all', async (req, res) => {

  const userRef = db.collection("Users");
  const response = await userRef.get();
  console.log(response);
  res.send("done");
})
/*

خاص بتسجيل الدخول 
المطلوب :
#email
#password

*/
app.post('/login', async (req, res) => {
  if (req.body.email) {
    if (req.body.password) {
      const userRef = db.collection("Users").doc(req.body.email);
      const response = await userRef.get();
      if (response.data()) {
        if (response.data().password === req.body.password) {
          res.json({ token: response.data().token })
        } else {
          res.json({ error: 'الرمز السري غير صحيح' });
        }
      } else {
        res.json({ error: 'المستخدم لم يقم بالتسجيل في الموقع' })
      }
    } else {
      res.json({ msg: "ادخل كلمة السر من فضلك" })
    }
  } else {
    res.json({ msg: "ادخل الايميل من فضلك" })
  }
})
/*
يعطيك البيانات الغير حساسة لاي مستخدم
المطلوب :
#user

*/
app.get('/user', async (req, res) => {
  const userRef = db.collection("Users").doc(req.body.user);
  const response = await userRef.get();
  if (!response.data()) {
    res.json({msg:"لا يوجد مستحدم"})
  } else {
    res.send({
      username: response.data().username,
      name: response.data().name,
      description: response.data().description,
      items: response.data().items
    })
  }
})
/* 
يعطيك بيانات المستخدم الحساسة
المطلوب :
#token

*/
app.get('/username', async (req, res) => {
  let token = req.header("Authorization");
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const response = await userRef.get();
      if (response.data()) {
        if (response.data().password === decoded.password) {


          res.send(
            {
              username: response.data().username,
              name: response.data().name,
              description: response.data().description,
              email: response.data().email,
              items: response.data().items
            }
          )
        } else {
          res/json({msg:"الرمز السري غير صحيح"});
        }
      } else {
        res.json({msg:'السمتخدم لم يقم بالتسجيل في الموقع'})
      }

    }
  });
})
/* 
تحذف دعاء من ملفك الشخصي
: المطلوب 
#token
#itemsID

*/

app.post('/items/delete', (req, res) => {
  let token = req.header("Authorization");
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const response = await userRef.get();
      if (response.data()) {
        if (response.data().password === decoded.password) {
          var ree = req.body.itemsID
          var oldarr = response.data().items;
          var newarr = [];
          var num = response.data().items.length;
          for (let i = 0; i < num; i++) {
            if (oldarr[i].id !== ree) {
              newarr.push(oldarr[i])
            }
          }
          var newjson = response.data();
          newjson.items = newarr;
          const o = db.collection("Users").doc(decoded.email).set(newjson);
          const p = db.collection("Users").doc(response.data().username).set({
            username: newjson.username,
            name: newjson.name,
            description: newjson.description,
            email: newjson.email,
            items: newjson.items
          });
          res.send(o);

        } else {
          res.json({msg:"الرمز السري غير صحيح"})
        }
      } else {
        res.json({msg:"لم يقم المستخدم بالتسجيل في الموقع"})
      }

    }
  });
})
//يعطيك جميع الادعية في الموقع
app.get('/items', async (req, res) => {
  const userRef = db.collection("Users").doc("items");
  const response = await userRef.get();
  res.send(response.data())
})
//يعطيك الادعية التي لم تقوم باضافتها
//المطلوب
//#token
app.get('/items/user', (req, res) => {
  let token = req.header("Authorization");
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const userResponse = await userRef.get();
      if (userResponse.data()) {
        if (userResponse.data().password === decoded.password) {
          var useritem = userResponse.data().items;
          const DBRef = db.collection("Users").doc("items");
          const DBresponse = await DBRef.get();
          var DBitems = DBresponse.data().items;
          var arr = [];
          for (let i = 0; i < DBitems.length; i++) {
            for (let j = 0; j < useritem.length; j++) {
              if (useritem[j].id !== DBitems[i].id) {
                arr.push(DBitems[i]);
              }
            }
          }
          res.send({
            result: arr
          })

        } else {
          res.json({msg:"الرمز السري غير صحيح"})

        }
      } else {
        res.json({msg:"لم يقم المستخدم بالتسجيل في الموقع"})
      }

    }
  });
})
//اضافة دعاء للملف الشخصي
//المطلوب 
//#token
//#id
app.post('/items/add', (req, res) => {
  let token = req.header("Authorization");
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const userResponse = await userRef.get();
      if (userResponse.data()) {
        if (userResponse.data().password === decoded.password) {
          const DBRef = db.collection("Users").doc("items");
          const DBresponse = await DBRef.get();
          var DBitems = DBresponse.data().items;
          var newarr = userResponse.data().items;
          var itemsID = req.body.itemsID;
          var AV = true;
          for (let k = 0; k < newarr.length; k++) {
            if (newarr[k].id == itemsID) {
              var AV = false;
            }
          }
          for (let i = 0; i < DBitems.length; i++) {
            if (DBitems[i].id == itemsID & AV) {
              newarr.push(DBitems[i])
            }
          }
          var newjson = userResponse.data();
          newjson.items = newarr;
          const o = db.collection("Users").doc(decoded.email).set(newjson);
          const p = db.collection("Users").doc(userResponse.data().username).set({
            username: newjson.username,
            name: newjson.name,
            description: newjson.description,
            email: newjson.email,
            items: newjson.items
          });
          res.send({
            dta: newarr
          })

        } else {
          res.json({msg:"الرمز السري غير صحيح"})
        }
      } else {
        ewa.json({msg:"لم يقم المستخدم بالتسجيل في الموقع"})
      }

    }
  });
})
app.post('/logout', (req, res) => {
  let token = req.header("Authorization");
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const userResponse = await userRef.get();
      if (userResponse.data()) {
        if (userResponse.data().password === decoded.password) {
          var newjson = userResponse.data();
          jwt.sign({ email: newjson.email, password: newjson.password }, KEY, (err, newtoken) => {
            if (err) throw err;
            newjson.token = newtoken;
            const o = db.collection("Users").doc(decoded.email).set(newjson);
          })
          res.send('dn')
        } else {
          res.json({msg:"الرمز السري غير صحيح"})
        }
      } else {
        ewa.json({msg:"لم يقم المستخدم بالتسجيل في الموقع"})
      }

    }
  });
})
app.post('/items/edit', (req, res) => {
  let token = req.header("Authorization");
  var number = req.body.number;
  var id = req.body.id;
  const decoded = jwt.verify(token, KEY, async (err, decoded) => {
    if (err) {
      res.send(err)
    }
    else {
      const userRef = db.collection("Users").doc(decoded.email);
      const userResponse = await userRef.get();
      if (userResponse.data()) {
        if (userResponse.data().password === decoded.password) {
          var idable = false;
          var numi = 0;
          var itemsarr = userResponse.data().items;
          for (let i = 0; i < itemsarr.length; i++) {
            if (itemsarr[i].id == id) {
              idable = true
              numi = i;
            }
          }
          if (idable) {
            itemsarr[numi].number = number;
            if (number > 0) {
              itemsarr[numi].isSetNumber = true;
            } else {
              itemsarr[numi].isSetNumber = false;
            }
            var newjson = userResponse.data();
            newjson.items = itemsarr;
            const o = db.collection("Users").doc(decoded.email).set(newjson);
            res.json({ msg: "تم التعديل بنجاح" })
          } else {
            res.json({msg:'الايدي غير موجود'})
          }

        } else {
          res.json({msg:"الرمز السري غير صحيح"})
        }
      } else {
        ewa.json({msg:"لم يقم المستخدم بالتسجيل في الموقع"})
      }

    }
  });

}
);

const port = process.env.PORT || 9900;
app.listen(port, () => console.log(`server is running on port : ${port}`))
