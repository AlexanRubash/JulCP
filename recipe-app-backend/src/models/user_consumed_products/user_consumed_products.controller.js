const userConsumedItemsService = require('./user_consumed_products.service');

const addConsumedItem = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const itemData = req.body;

        if ((!itemData.product_id && !itemData.recipe_id) || !itemData.quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const consumedItem = await userConsumedItemsService.addConsumedItem(userId, itemData);
        res.status(201).json(consumedItem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add consumed item' });
    }
};

const getConsumedItemsByDate = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }

        const consumedItems = await userConsumedItemsService.getConsumedItemsByDate(userId, date);
        res.json(consumedItems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch consumed items' });
    }
};

const deleteConsumedItem = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const consumptionId = req.params.id;

        const isDeleted = await userConsumedItemsService.deleteConsumedItem(userId, consumptionId);
        if (!isDeleted) {
            return res.status(404).json({ error: 'Consumed item not found' });
        }

        res.json({ message: 'Consumed item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete consumed item' });
    }
};

module.exports = {
    addConsumedItem,
    getConsumedItemsByDate,
    deleteConsumedItem
};
