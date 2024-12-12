// Code for mongoose config in backend
// Filename - backend/index.js

// To connect with your MongoDB database
const mongoose = require('mongoose');
const uri = "mongodb+srv://zhengzirui43:pmbfINo4tD8cf0O1@cluster0.dsgmo.mongodb.net/";

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            dbName: 'DoList',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DoList database');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit the application if the database connection fails
    }
};
connectDB();

// Schema for users of app
const UserSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    completeness: {
        type: String,
        default: "Incomplete",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const User = mongoose.model('DoList_item', UserSchema);
User.createIndexes();

// Express app setup
const express = require('express');
const app = express();
const cors = require("cors");
const path = require('path');
app.use(express.json());
app.use(cors({
    origin: ['https://zirui2333.github.io', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

console.log("App listen at port 5000");

// Route to check if backend is working
app.get("/", (req, resp) => {
    resp.send("App is Working");
});

// Route to register user
app.post("/register", async (req, resp) => {
    try {
        const user = new User(req.body);
        let result = await user.save();
        resp.send(req.body);
        console.log(result);
    } catch (e) {
        resp.status(500).send("Something Went Wrong");
    }
});

// Route to delete user by ID
app.delete("/delete/:id", async (req, resp) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (result) {
            resp.send({ message: "Task deleted successfully" });
        } else {
            resp.status(404).send({ message: "Task not found" });
        }
    } catch (e) {
        console.error("Error deleting Task:", e);
        resp.status(500).send({ message: "Internal server error" });
    }
});

app.get("/items", async (req, resp) => {
    try {
        const items = await User.find({});
        resp.status(200).send(items);
    } catch (e) {
        console.error("Error fetching items:", e);
        resp.status(500).send({ message: "Internal server error" });
    }
});



app.put('/update/:id', async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate(
            req.params.id,
            {
                task: req.body.task,
                description: req.body.description,
                completeness: req.body.completeness,
                date: req.body.date
            },
            { new: true }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



