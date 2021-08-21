const { ObjectId } = require('mongodb');
const metricSchema = require('../schemas/new_metric');
const metrics = require('../config/mongoCollections').metrics;
const mongoOperations = require('./mongoOperations');


const getAll = async () => {
    const metricCollection = await metrics();
    const allMetrics = await metricCollection.find({}).toArray();

    return mongoOperations.resultsToSet(allMetrics, "productId", "pageView");
}

/// Internal function, all functions exposed in module.exports should validate before calling this function.
upsertPageView = async (id) => {
    
    const metricCollection = await metrics();
    const query = { productId:  id};
    const result = await metricCollection.updateOne(query, {$inc: { pageView: 1}}, {upsert: true});
    
    if(!result || (result.modifiedCount == 0 && result.upsertedCount == 0) ) {
        console.error(`Failed to record page view for ${id}`);
    }
}

const notifyProductPageView = async (rawId) => {
    const { error } =  metricSchema.validate({id: rawId}, {abortEarly: false, allowUnknown: true, stripUnknown: true});
    // Log instead of throw for this error. Metrics are a side effect to the request and should not prevent the main request from going through.
    if (error) {
        console.error(`Failed to valid ${rawId} due to ${error}, ignoring metric`);
        return;
    }
    await upsertPageView(ObjectId(rawId));
}
   

const notifyLandingPageView = async () => {
    await upsertPageView("landingPage");
}



module.exports = {
    getAll,
    notifyLandingPageView,
    notifyProductPageView
  };
  