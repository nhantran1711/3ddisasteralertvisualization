const mongoose = require('mongoose');

const eonetEventSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    categories: { type: String, required: true },
    magnitude: { type: Number, default: null },
    date: { type: String, default: null },
    longitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
    source: { type: String, default: "NASA EONET" }
});
eonetEventSchema.index({ id: 1 });

const EonetEvent = mongoose.model('EonetEvent', eonetEventSchema);

module.exports = EonetEvent;