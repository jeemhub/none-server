
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const credentials = require("./fir-firebase-cb9e4-firebase-adminsdk-8oi2h-524a972666.json");
const jwt = require('jsonwebtoken');
const KEY = 'r3rewr'
app.use(express.json());

app.use(express.urlencoded({ extend: true }));
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

const db = admin.firestore();
/*
لانشاء حساب جديد 
المطلوب :
#email
#password
#name
#username

*/
app.post('/signup', async (req, res) => {
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

                res.send("Done")
            } else {
                res.send("userName is regester")
            }
        } else {
            res.send("email is regester")
        }


    })

})
/*
لقراءة جميع البيانات
 */
app.get('/read/all', async (req, res) => {
    try {
        const userRef = db.collection("users");
        const response = await userRef.get();
        let responseArr = [];
        response.forEach(doc => {
            responseArr.push(doc.data());
        });
        res.send(responseArr)
    } catch (error) {
        res.send(error)
    }
})
/*

خاص بتسجيل الدخول 
المطلوب :
#email
#password

*/
app.post('/login', async (req, res) => {
    const userRef = db.collection("Users").doc(req.body.email);
    const response = await userRef.get();
    if (response.data()) {
        if (response.data().password === req.body.password) {
            res.json({token:response.data().token})
        } else {
            res.json({error:'password is not currect'});
        }
    } else {
        res.json({error:'user not register'})
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
        res.send('user NOt')
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
    let token=req.header("Authorization");
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
                    res.send('password is not currect');
                }
            } else {
                res.send('user not register')
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
    let token=req.header("Authorization");
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
                    res.send('password is not currect');
                }
            } else {
                res.send('user not register')
            }

        }
    });
})
//يعطيك جميع الادعية في الموقع
app.get('/items',async(req,res)=>{
    const userRef = db.collection("Users").doc("items");
    const response = await userRef.get();
    res.send(response.data())
})
//يعطيك الادعية التي لم تقوم باضافتها
//المطلوب
//#token
app.get('/items/user',(req,res)=>{
    let token=req.header("Authorization");
    const decoded = jwt.verify(token, KEY, async (err, decoded) => {
        if (err) {
            res.send(err)
        }
        else {
            const userRef = db.collection("Users").doc(decoded.email);
            const userResponse = await userRef.get();
            if (userResponse.data()) {
                if (userResponse.data().password === decoded.password) {
                    var useritem=userResponse.data().items;
                    const DBRef = db.collection("Users").doc("items");
                    const DBresponse = await DBRef.get();
                    var DBitems=DBresponse.data().items;
                   var arr=[];
                   for(let i=0;i<DBitems.length;i++){
                        for(let j=0;j<useritem.length;j++){
                            if(useritem[j].id !== DBitems[i].id){
                                arr.push(DBitems[i]);
                            }
                        }

                   }
                   res.send({
                    result:arr
                   })

                } else {
                    res.send('password is not currect');
                }
            } else {
                res.send('user not register')
            }

        }
    });
})
//اضافة دعاء للملف الشخصي
//المطلوب 
//#token
//#id
app.post('/items/add',(req,res)=>{
    let token=req.header("Authorization");
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
                    var DBitems=DBresponse.data().items;
                    var newarr=userResponse.data().items;
                    var itemsID=req.body.itemsID;
                    var AV = true;
                    for (let k=0;k<newarr.length;k++){
                        if (newarr[k].id == itemsID){
                            var AV=false;
                        }
                    }
                    for(let i=0;i<DBitems.length;i++){
                        if(DBitems[i].id ==itemsID & AV){
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
                    dta:newarr
                  })
                
                } else {
                    res.send('password is not currect');
                }
            } else {
                res.send('user not register')
            }

        }
    });
})

const port = 9900;
app.listen(port, () => console.log(`server is running on port : ${port}`))