const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jbxtt4r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const categoriesCollection = client.db('laptopResale').collection('categories');

        app.get('/categories' , async(req , res)=>{
           const query = {};
           const categories = await categoriesCollection.find(query).toArray();
           res.send(categories);      
        })
    }
    finally{

    }
}
run().catch(error => console.error(error))


 

app.get('/' , (req , res)=>{
   res.send('Laptop resale server is running :)')
})

app.listen(port , ()=> console.log('> Laptop Resale Server is running on port : ' + port))