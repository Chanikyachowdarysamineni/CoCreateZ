"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const models_1 = require("../models");
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const data = await models_1.Dashboard.getData(userId);
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: err });
    }
};
exports.getDashboardData = getDashboardData;
