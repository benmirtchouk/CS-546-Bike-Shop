const mongoCollections = require("../config/mongoCollections");
const mongoConnection = require("../config/mongoConnection");
const users = mongoCollections.users;
const products = mongoCollections.products;
const reviews = mongoCollections.reviews;
const orders = mongoCollections.orders;
const data = require("../data")

// #MARK:- Data construction operations, does *not* do validation, that is handled in data functions

const isNonBlankString = (string) => {
    return typeof string == 'string' && string.trim()
}

const createSpecs = (length, width, height, frame, fork, shock, tire, shifter, chain) => {
    const specs = {
        length: length,
        width: width,
        height, height
    }
    // Optional elements. Filter to ensure the keys aren't blank as those are not semantically valid
    const values = [("frame", frame), ("fork", fork), ("shock", shock), ("tire", tire), ("shifter", shifter), ("chain", chain)]
    for(let {key, value} in values) {
        if(!isNonBlankString(value)) { continue }
        specs[key] = value
    }
    return specs
}


const createProduct = (name, description, tags, stock, pictures, price, specs ) => {
    return {
        name: name,
        description: description,
        tags: tags,
        stock: stock,
        pictures: pictures,
        price: price,
        specs: specs
    }
}




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


        const specs = 
        [
            createSpecs(5, 10, 15, "someFrame", "someFork"),
            createSpecs(12, 10, 15, "someOtherFrame", "someFork", "An Amazing Shock", "20\" Tire"),
            createSpecs(15, 20, 8, "someOtherFrame", "someFork", "An Amazing Shock", "20\" Tire", "Average Shifter", "Rusty Chain")
        ]

        const productsData = 
        [
            createProduct("A bike", "The best bike", ["Fast", "Colorful"], 3, [], 3000.15, specs[2]),
            createProduct("Cheap Bike", "The cheapest bike money can buy", ["Slow", "Rusted", "No Kickstand"], 10, [], 100.20, specs[0]),
            createProduct("Average Bike", "A normal street bike", ["Street"], 20, [], 150.60, specs[1]),
            createProduct("Child's Training Bike", "The perfect training bike!", ["Small", "Child", "Training Wheels"], 5, [], 50.10, specs[0])

        ]
        
        const mongoBikeIds = {}
        for(const product of productsData) {
            const {_id } = await data.products.create(product)
            mongoBikeIds[_id] = product
        }


        console.log(mongoBikeIds);



        // Reminder to write comment that ids return string, and pass in as string

        //let userData = [];
        //let productData = [];
        //let reviewData = [];
        //let orderData = [];

        //await userCollection.insertMany(userData);
        //await productCollection.insertMany(productData);
        //await reviewCollection.insertMany(reviewData);
        //await orderCollection.insertMany(orderData);

        console.log("Seeding DB completed!");
        const db = await mongoConnection();
        await db.serverConfig.close();
    } catch (err) {
        console.error(err);
    }
}

seedDB();
