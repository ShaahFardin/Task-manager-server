const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
require('colors')

const app = express();

app.use(express.json());
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://Motion:Motion123@cluster0.il5mbbt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Motion
// Motion123

async function run() {
    try {
        await client.connect();
        console.log("MongoDB Database connected");
    } catch (error) {
        console.log(error.message.bgRed.bold, error.name.bgRed, error.stack.cyan);
    }
}
run();


const taskCollection = client.db("Motion").collection('Tasks');


// post
app.post('/tasks', async (req, res) => {

    const result = await taskCollection.insertOne(req.body);

    try {
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully added the ${req.body.task} to the database with id ${result.insertedId}`,
                data: result
            })
        } else {
            res.send({
                success: false,
                message: "Could not add the task to Database"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// find 

app.get('/tasks', async (req, res) => {

    try {
        const cursor = taskCollection.find({});
        const result = await cursor.toArray();

        res.send({
            success: true,
            message: "Successfully got all the data",
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error
        })
    }
})



// get one task

app.get('/tasks/:id', async(req, res)=>{
    try {
        
        const id = req.params.id;
        const result = await taskCollection.findOne({_id:ObjectId(id)});

        res.send({
            success: true,
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// delete

app.delete('/tasks/:id',async (req, res) => {
    try {
        const id = req.params.id;
        const task = await taskCollection.findOne({ _id: ObjectId(id) });
        if (!task?._id) {
            res.send({
                success: false,
                message: "Task does not exist"
            });
            return;
        };

        const result = await taskCollection.deleteOne({ _id: ObjectId(id) });

        if (result.deletedCount) {
            res.send({
                success: true,
                message: `Task ${task.task} delted successfully`
            })
        } else {
            res.send({
                success: `Could not delete the task ${task.task}`
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
});


// update

app.patch('/task/edit/:id', async(req, res)=>{
    const id = req.params.id
    try {
        const result =await taskCollection.updateOne({_id:(ObjectId(id))} , {$set: req.body});

        if(result.modifiedCount){
            res.send({
                success: true,
                message: 'Updated successfully',
              
            })
        }else{
            res.send({
                success: false,
                message: 'Could not update the task'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// update completed task status

app.put('/task/completed/:id', async(req, res)=>{
    try {
        const id = req.params.id;
        const result =await taskCollection.updateOne({_id:ObjectId(id)}, {$set: req.body})

        if(result.modifiedCount){
            res.send({
                success: true,
                message: 'Updated successfully',    
            })
        }else{
            res.send({
                success: false,
                message: 'Could not update the product'
            })
        }
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Find completed task

app.get('/task/completed', async(req, res)=>{

    try {
        
        const result = await taskCollection.find({completed:true}).toArray();

        res.send({
            success: true,
            message: "Successfully got all the completed task",
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})




app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})