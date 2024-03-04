const mongoose = require("mongoose");

const summarySchema = mongoose.Schema({
    title: {
        type: String,
    },
    summary400: {
        type: String,
        required: true,
    },
    summary600: {
        type: String,
        required: true,
    },
    keywords: {
        type: [[String,Number]],
        required: true,
    }
});
summarySchema.index({ summary: "text" });

const summaryModel = mongoose.model('summary', summarySchema);
module.exports = summaryModel;
