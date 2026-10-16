const express = require('express');
const app = express();

app.use(express.json());

let users = [
    { id: 1, name: "Ashwin", age: 21 },
    { id: 2, name: "Rahul", age: 22 }
];

// CREATE - Add a user
app.post('/users', (req, res) => {
    const user = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: req.body.name,
        age: req.body.age
    };

    users.push(user);
    res.status(201).json(user);
});

// READ - Get all users
app.get('/users', (req, res) => {
    res.json(users);
});

// READ - Get a user by ID
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
});

// UPDATE - Update a user
app.put('/users/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name ?? user.name;
    user.age = req.body.age ?? user.age;

    res.json({ message: "User updated", user });
});

// DELETE - Delete a user
app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === Number(req.params.id));

    if (index === -1) return res.status(404).json({ message: "User not found" });

    users.splice(index, 1);
    res.json({ message: "User deleted successfully" });
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
