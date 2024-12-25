require('dotenv').config({ path: './recipe-app-backend/.env' });
const express = require('express');
const cors = require('cors');
const userRoutes = require('./models/user/user.routes');
const recipeRoutes = require('./models/recipe/recipe.routes');
const adminRoutes = require('./models/admin/admin.routes');
const path = require("node:path");
const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/recipes', recipeRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
