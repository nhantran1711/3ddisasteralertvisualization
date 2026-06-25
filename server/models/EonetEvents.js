const mongoose = require('mongoose');

const eonetEventSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    categories: { type: String, required: true },
    magnitude: { type: Number, default: null },
    magnitudeUnit: { type: String, default: null },
    date: { type: String, default: null },
    longitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
    closed: { type: String, default: null },
    link: { type: String, default: null },
    sourceUrl: { type: String, default: null },
    source: { type: String, default: "NASA EONET" }
});
eonetEventSchema.index({ id: 1 });

const EonetEvent = mongoose.model('EonetEvent', eonetEventSchema);

module.exports = EonetEvent;