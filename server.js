import axios from "axios";
import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set ,  onValue } from "firebase/database";
import 'dotenv/config' 
import { Client, Intents,}  from "discord.js";
import pkg from 'discord.js-light';
const { Discord } = pkg;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS,
     Intents.FLAGS.GUILD_MESSAGES,
     "GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES",
  ],
});





client.login(process.env.BOT_TOKEN);


const firebaseConfig = {
  apiKey: "AIzaSyDgjkAFksGTqCUbA4R9m9UAMFM1Cy8MZMw",
  authDomain: "namekujilabs.firebaseapp.com",
  projectId: "namekujilabs",
  storageBucket: "namekujilabs.appspot.com",
  messagingSenderId: "527914262266",
  appId: "1:527914262266:web:b43975b52373a2b3467343",
  measurementId: "G-55B1F2E0LM"
};

const fire = initializeApp(firebaseConfig);
const app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.static("views"))




app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render("index");
 
})
app.post('/setdata', (req, res) => {
  const userid =  req.body.user_name
  const email = req.body.user_email
  const collection = req.body.collection
  const price = req.body.price
  const discord = req.body.discord
  console.log(userid,email,collection,price)
 
    const db = getDatabase();
    set(ref(db, 'users/' + userid), {
      email: email,
      collection: collection,
      price: price,
      Discord:discord
    })
    res.send("done")
  
})


async function getFloorPrice(collection) {
  try {
    const url = `https://api.opensea.io/collection/${collection}/stats`;
    const response = await axios.get(url);
    // console.log(response)
    console.log(response.data.stats.floor_price)
    return response.data.stats.floor_price;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  function alert(id,user_given_price){
    client.users.fetch(id, true).then((user) => {
      user.send(`The given collection price is reached to your price ${user_given_price}`)

    });

  }
  async function intercvaL(){
    const db = getDatabase();
      const users = ref(db, 'users/' );
      onValue(users, (snapshot) => {
      snapshot.forEach(async (childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      console.log(childData.collection)
      console.log(childData.price)
  
      const target_price = await getFloorPrice(childData.collection.trim());
      const user_given_price = childData.price
      if(user_given_price === target_price){
        alert(childData.discord,user_given_price)
        
      }else{
        console.log("not matched")
      }
      
  
    });
  });
  }
  
  const interval_calling = setInterval(intercvaL,20000)





   
  
});



const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
