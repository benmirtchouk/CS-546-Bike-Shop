const mongoCollections = require("../config/mongoCollections");
const mongoConnection = require("../config/mongoConnection");
const users = mongoCollections.users;
const products = mongoCollections.products;
const reviews = mongoCollections.reviews;
const orders = mongoCollections.orders;
const slugify = require('slugify');
const data = require("../data");
// #MARK:- Data construction operations, does *not* do validation, that is handled in data functions

const isNonBlankString = (string) => {
    return typeof string == 'string' && string.trim();
}

const createSpecs = (length, width, height, frame, fork, shock, tire, shifter, chain) => {
    const specs = {
        length: length,
        width: width,
        height, height
    }
    // Optional elements. Filter to ensure the keys aren't blank as those are not semantically valid
    const values = [("frame", frame), ("fork", fork), ("shock", shock), ("tire", tire), ("shifter", shifter), ("chain", chain)];
    for(let {key, value} in values) {
        if(!isNonBlankString(value)) { continue; }
        specs[key] = value;
    }
    return specs;
}


const createProduct = (name, description, tags, stock, pictures, price, specs ) => {
    return {
        name: name,
        slug: slugify(name, {lower: true}),
        description: description,
        tags: tags,
        stock: stock,
        pictures: pictures,
        price: price,
        specs: specs
    }
}


const createAddress = (streetAddress, country, city, zipCode) => {
    return {
        address: streetAddress,
        country: country,
        city: city,
        zipcode: zipCode
    }
}

const createUser = (email, firstName, lastName, isAdmin, password, address, cart) => {
    return {
        email: email,
        firstName: firstName,
        lastName: lastName,
        admin: isAdmin,
        password: password,
        confirmPassword: password,
        address: address,
        cart: Array.isArray(cart) ? cart : [cart]
    }
}

const createOrder = (items, owner, datePlaced,price) => {
    return{
        items:Array.isArray(items) ? items : [items],
        owner:owner,
        datePlaced:datePlaced,
        price:price
    }
}

const createReview = (owner, product, verified, rating, body, pictures) => {
    return {
        owner:owner,
        product:product,
        verified:verified,
        rating:rating,
        body:body,
        pictures:Array.isArray(pictures) ? pictures : [pictures]
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


        // Create the spec objects, these can be reused between products
        const specs = 
        [
            createSpecs(5, 10, 15, "someFrame", "someFork"),
            createSpecs(12, 10, 15, "someOtherFrame", "someFork", "An Amazing Shock", "20\" Tire"),
            createSpecs(15, 20, 8, "someOtherFrame", "someFork", "An Amazing Shock", "20\" Tire", "Average Shifter", "Rusty Chain")
        ];

        const productsData = 
        [
            createProduct("A bike", "The best bike", ["Fast", "Colorful"], 4, [], 3000.15, specs[2]),
            createProduct("Cheap Bike", "The cheapest bike money can buy", ["Slow", "Rusted", "No Kickstand"], 10, [], 100.20, specs[0]),
            createProduct("Average Bike", "A normal street bike", ["Street"], 20, [], 150.60, specs[1]),
            createProduct("Child's Training Bike", "The perfect training bike!", ["Small", "Child", "Training Wheels"], 5, [], 50.10, specs[0])

        ];
        
        // This is a map of the string id -> the inserted bike object. 
        const mongoBikeIdsMap = {};
        for(const product of productsData) {
            const {_id } = await data.products.create(product);
            mongoBikeIdsMap[_id] = product;
        }
        console.log("Products seeded");
        // Pull out the ids separately if the backing object is not needed for context
        const mongoBikeIds = Object.keys(mongoBikeIdsMap);

        // Address are only US addresses as zip code is an int
        const bikeShopAddress = createAddress("600 Bike Shop Road", "United States", "Hoboken", '07030');
        const addresses = [
            createAddress("123 Fake Street", "United States", "AnyTown", '01234'),
            createAddress("1 Castle Point Terrace", "United States", "Hoboken", '07030'),
            createAddress("350 Oak Avenue", "United States", "SomeTown", '55555')
        ];

        const bikeShopEmail = "bikeShop.com";
        const userData = [
            createUser(`owner@${bikeShopEmail}`, "John", "Smith", true, "secure_password", bikeShopAddress, []),
            createUser(`frontDesk@${bikeShopEmail}`, "Johnny", "Smith", true, "helloworld!", bikeShopAddress, [] ),
            createUser('bikeBuyer@gmail.com', "Bob", "Wilson", false, "familymemberbirthday", addresses[0], mongoBikeIds),
            createUser('onlyTheBest@yahoo.com', "Jessica", "Miller", false, "very_secure_password", addresses[2], mongoBikeIds[0]),
            createUser("attila@stevens.edu", "Attila", "The Duck", false, "ImOutOfCreativity", addresses[1], [])
        ];

        const userIdsMap = {};
        for(const user of userData) {
            const {_id } = await data.users.create(user);
            userIdsMap[_id] = user;

            for(const productid of user.cart) {
                console.log('addtocart',_id,productid)
                data.users.addToCart(_id, productid);
            }
        }
        console.log("users seeded");
        const userIds = Object.keys(userIdsMap);

        //adding Orders
        
        // Define the bikes the users have bought
        bikeOrderMap = {}
        bikeOrderMap[userIds[0]] = [mongoBikeIds[0]];
        bikeOrderMap[userIds[1]] = [];
        bikeOrderMap[userIds[2]] = mongoBikeIds.slice(1,4);
        bikeOrderMap[userIds[3]] = [mongoBikeIds[0]];
        bikeOrderMap[userIds[4]] = [ mongoBikeIds[0], mongoBikeIds[2]];

        const orderIdsMap = {};
        for(const userId of userIds){
            //let product1 = await data.products.getbyName('A bike')

            let products = bikeOrderMap[userId];
            if(products.length == 0) { continue; }
            let newOrder = createOrder(products, userId, '7/31/2021',121);
            const {_id} = await data.orders.create(newOrder);
            orderIdsMap[_id] = newOrder;
        }
        console.log("orders seeded");
        const orderIds = Object.keys(orderIdsMap);

        //adding Reviews
        const reviewIdsMap = {};
        for(const orderId of orderIds){
            let order = await data.orders.get(orderId);
            let newReview = createReview(order.owner, order.items[0], true, 3, "Average Bike with average price", "raw code for png");
            const {_id} = await data.reviews.create(newReview);
            reviewIdsMap[_id] = newReview;
        }
        console.log("review seeded");
        const reviewIds = Object.keys(reviewIdsMap);

        console.log("Seeding DB completed!");
        const db = await mongoConnection();
        await db.serverConfig.close();
        console.log("Connection closed!");
    } catch (err) {
        console.error(err);
    }
}

seedDB();
