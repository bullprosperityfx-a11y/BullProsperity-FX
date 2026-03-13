export default async function handler(req, res) {

const cookie = req.headers.cookie || ""

const tokenMatch = cookie.match(/whop_access_token=([^;]+)/)

if (!tokenMatch) {
return res.json({
ok:true,
role:"guest",
email:"",
hasMembership:false
})
}

const token = tokenMatch[1]

try {

const userRes = await fetch("https://api.whop.com/api/v5/me",{
headers:{
Authorization:`Bearer ${token}`
}
})

const user = await userRes.json()

const email = user.email || ""

let role = "guest"

if(email === "bullprosperityfx@gmail.com"){
role = "admin"
}

res.json({
ok:true,
role,
email,
hasMembership:true
})

}catch(e){

res.json({
ok:true,
role:"guest",
email:"",
hasMembership:false
})

}

}
