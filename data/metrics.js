const { ObjectId } = require('mongodb');
const metrics = require('../config/mongoCollections').metrics;
const mongoOperations = require('./mongoOperations');


const getAll = async () => {
    const metricCollection = await metrics();
    const allMetrics = await metricCollection.find({}).toArray();

    return mongoOperations.resultsToSet(allMetrics, "productId", "pageView");
}

const notifyProductPageView = async (id) => {
    const metricCollection = await metrics();

    const query = { productId: ObjectId(id) };
    const result = await metricCollection.updateOne(query, {$inc: { pageView: 1}}, {upsert: true});
    // Log instead of throw, as metrics are a side effect to the request
    if(!result || (result.modifiedCount == 0 && result.upsertedCount == 0) ) {
        console.error(`Failed to record page view for ${id}`);
    }
}



module.exports = {
    getAll,
    notifyProductPageView
  };
  