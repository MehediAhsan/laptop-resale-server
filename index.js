const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        const productsCollection = client.db('laptopResale').collection('products');
        const bookingCollection = client.db('laptopResale').collection('bookings');
        const usersCollection = client.db('laptopResale').collection('users');
        const paymentsCollection = client.db('laptopResale').collection('payments');

        app.get('/categories' , async(req , res)=>{
           const query = {};
           const categories = await categoriesCollection.find(query).toArray();
           res.send(categories);      
        })

        app.get('/category/:id' , async(req , res)=>{
           const id = req.params.id;
           const query = {category_id:id}
           const product = await productsCollection.find(query).toArray();
           res.send(product);
        })


        app.get('/bookings' , async(req , res)=>{
            const email = req.query.email;
            const query = {
               email: email 
            } 
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings);
        })

        app.get('/bookings/:id' , async(req , res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const booking = await bookingCollection.findOne(query)
            res.send(booking);        
        })

        app.post('/bookings' , async(req , res)=>{            
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking); 
            res.send(result); 
        })

        app.post("/create-payment-intent", async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
          
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res) =>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = {_id: ObjectId(id)}
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingCollection.updateOne(filter, updatedDoc)
            res.send(result);
        })

        app.get('/products' , async(req , res)=>{
            const email = req.query.email;
            const query = {
               seller_email: email
            }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.post('/products' , async(req , res)=>{
         const product = req.body;
         const date = new Date();
         const result = await productsCollection.insertOne({...product, time:date});
         res.send(result);
        })

        app.delete('/products/:id' , async(req , res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        })

        app.patch('/products/:id' , async (req, res) => {
            const id = req.params.id;
            const isAdvertised = req.body.isAdvertised;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                    isAdvertised: isAdvertised
                }
            }
            const result = await productsCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.get('/advertise' , async(req , res)=>{
            const query = {
                isAdvertised: true
            }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.post('/users' , async(req , res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);        
        })

        app.get('/buyers' , async(req , res)=>{
            const query = {
               role: 'buyer'
            }
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
        })
        
        app.get('/sellers' , async(req , res)=>{
            const query = {
               role: 'seller'
            }
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        app.get('/users/:email' , async(req , res)=>{
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        app.patch('/users/:id' , async (req, res) => {
            const id = req.params.id;
            const verified = req.body.verified;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                    verified: verified
                }
            }
            const result = await usersCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/users/:id' , async(req , res)=>{
            const id = req.params.id;
            const filter = {_id:ObjectId(id)}
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })
        
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
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