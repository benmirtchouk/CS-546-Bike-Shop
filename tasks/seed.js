const mongoCollections = require("../config/mongoCollections");
const mongoConnection = require("../config/mongoConnection");
const users = mongoCollections.users;
const products = mongoCollections.products;
const reviews = mongoCollections.reviews;
const orders = mongoCollections.orders;

async function seedDB() {
    try {
        const userCollection = await users();
        await userCollection.deleteMany({});
        const productCollection = await products();
        await productCollection.deleteMany({});
        const reviewCollection = await reviews();
        await reviewCollection.deleteMany({});
        const orderCollection = await orders();
        await orderCollection.deleteMany({});

        let userData = [];
        let productData = [];
        let reviewData = [];
        let orderData = [];

        await userCollection.insertMany(userData);
        await productCollection.insertMany(productData);
        await reviewCollection.insertMany(reviewData);
        await orderCollection.insertMany(orderData);

        console.log("Seeding DB completed!");
        const db = await mongoConnection();
        await db.serverConfig.close();
    } catch (err) {
        console.error(err);
    }
}

seedDB();
