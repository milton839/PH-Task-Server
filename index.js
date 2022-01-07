const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Password=sBkizWrOWI4u1H7C

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.cf5ms.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('PH-Task');
        const billingCollection = database.collection('PH-Billing-Task');
        console.log("database connected")

        app.post('/addNewBill', async (req, res) => {
            const newBill = req.body;
            const result = await billingCollection.insertOne(newBill);
            res.json(result);
        })

        app.get('/allBills', async (req, res) => {
            const cursor = billingCollection.find();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let allBills;
            if (page){
                allBills = await cursor.skip(page*size).limit(size).sort({_id:-1}).toArray();
            }
            else{
                allBills = await cursor.toArray();
            }
            res.send({
                count,
                allBills
            });
        })

        app.get('/allBills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await billingCollection.findOne(query);
            console.log("load with id", id);
            res.send(result)
        })

        app.put('/allBills/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBill = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    name: updatedBill.name,
                    email: updatedBill.email,
                    phone: updatedBill.phone,
                    billAmount: updatedBill.billAmount
                },
            };
            const result = await billingCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.delete('/billsDelete/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await billingCollection.deleteOne(query);

            console.log('deleting user with id ', result);

            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Programming Hero!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

