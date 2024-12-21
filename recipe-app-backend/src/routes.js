const express = require('express');
const multer = require('multer');
const path = require('path'); // Импортируем path перед его использованием
const userRoutes = require('./models/user/user.routes'); // Импортируем маршруты для пользователя
const recipeRoutes = require('./models/recipe/recipe.routes'); // Импортируем маршруты для рецептов
const authMiddleware = require('./shared/middlewares/authMiddleware'); // Импортируем middleware для авторизации
const adminRoutes = require('./models/admin/admin.routes');
const fs = require('fs'); // Для работы с файловой системой
const productRoutes = require('./models/product/product.routes'); // Подключаем маршруты для продуктов
const tagRoutes = require('./models/tags/tag.routes')
const router = express.Router();

// Настройка для multer
const upload = multer({ dest: path.join(__dirname, 'uploads/temp') });
router.post('/uploads', upload.single('file'), (req, res) => {
    const folder = req.body.folder; // folder: "recipeImage" или "stepsImage"
    const recipeId = req.body.recipeId; // ID рецепта
    const stepNumber = req.body.stepNumber; // Номер шага (если применимо)
    const originalExtension = path.extname(req.file.originalname); // Получаем расширение файла
    let newFileName;

    if (folder === 'recipeImage') {
        newFileName = `${recipeId}${originalExtension}`; // Формат: id_рецепта.формат
    } else if (folder === 'stepsImage') {
        newFileName = `${recipeId}_${stepNumber}${originalExtension}`; // Формат: id_рецепта_номершага.формат
    } else {
        return res.status(400).json({ error: 'Invalid folder specified' });
    }

    const targetFolder = path.join(__dirname, 'uploads', folder);

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, newFileName);

    fs.rename(req.file.path, filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/api/uploads/${folder}/${newFileName}`;
        res.json({ url: fileUrl });
    });
});


// Настройка статического пути для изображений рецептов
router.use('/uploads/recipeImage', express.static(path.join(__dirname, 'uploads', 'recipeImage')));

// Настройка статического пути для изображений шагов
router.use('/uploads/stepsImage', express.static(path.join(__dirname, 'uploads', 'stepsImage')));

// Все маршруты для пользователя
router.use('/users', userRoutes);

// Все маршруты для рецептов
router.use('/recipes', recipeRoutes);

// Можно добавить дополнительные маршруты, например, для администраторов
router.use('/admin', adminRoutes);

router.use('/tags', tagRoutes)
router.use('/products', productRoutes);
module.exports = router;
