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
        ]

        const productsData = 
        [
            createProduct("A bike", "The best bike", ["Fast", "Colorful"], 3, [], 3000.15, specs[2]),
            createProduct("Cheap Bike", "The cheapest bike money can buy", ["Slow", "Rusted", "No Kickstand"], 10, [], 100.20, specs[0]),
            createProduct("Average Bike", "A normal street bike", ["Street"], 20, [], 150.60, specs[1]),
            createProduct("Child's Training Bike", "The perfect training bike!", ["Small", "Child", "Training Wheels"], 5, [], 50.10, specs[0])

        ]
        
        // This is a map of the string id -> the inserted bike object. 
        const mongoBikeIdsMap = {}
        for(const product of productsData) {
            const {_id } = await data.products.create(product)
            mongoBikeIdsMap[_id] = product
        }
        console.log("Products seeded");
        // Pull out the ids separately if the backing object is not needed for context
        const mongoBikeIds = Object.keys(mongoBikeIdsMap)

        // Address are only US addresses as zip code is an int
        const bikeShopAddress = createAddress("600 Bike Shop Road", "United States", "Hoboken", 07030)
        const addresses = [
            createAddress("123 Fake Street", "United States", "AnyTown", 01234),
            createAddress("1 Castle Point Terrace", "United States", "Hoboken", 07030),
            createAddress("350 Oak Avenue", "United States", "SomeTown", 55555)
        ]

        const bikeShopEmail = "bikeShop.com"
        const userData = [
            createUser(`owner@${bikeShopEmail}`, "John", "Smith", true, "2409e5123615094ba274e0f0a87cf69df178fac2aa574b77a5360019e5b466e1", bikeShopAddress, []),
            createUser(`frontDesk@${bikeShopEmail}`, "Johnny", "Smith", true, "496259b009d76112545ac62b77424b3ae8478862a26e09c0409860e6437f820f", bikeShopAddress, [] ),
            createUser('bikeBuyer@gmail.com', "Bob", "Wilson", false, "4836bb7bd2171483f95423b51701f79ae26e25d9ccb52e6bb3cd324e04bb35b2", addresses[0], mongoBikeIds),
            createUser('onlyTheBest@yahoo.com', "Jessica", "Miller", false, "2e3ae0b394ce329349491cef54ee7533ffd9a1630a51c988f84d441b0a02b4e8", addresses[2], mongoBikeIdsMap[0]),
            createUser("attila@stevens.edu", "Attila", "The Duck", false, "c8553a39235a2c31e1260839207537deef67b0e091764156bca5d5ae51e54ebd", addresses[1], [])
        ]

        const userIdsMap = {}
        for(const user of userData) {
            const {_id } = await data.users.create(user)
            userIdsMap[_id] = user
        }
        console.log("users seeded");
        const userIds = Object.keys(userIdsMap)

        //adding Orders
        const orderIdsMap = {}
        for(const userId of userIds){
            //let product1 = await data.products.getbyName('A bike')
            let product2 = await data.products.getbyName('Average Bike')
            let newOrder = createOrder([product2._id], userId, '7/31/2021',121)
            const {_id} = await data.orders.create(newOrder)
            orderIdsMap[_id] = newOrder
        }
        console.log("orders seeded");
        const orderIds = Object.keys(orderIdsMap)


        console.log("Seeding DB completed!");
        const db = await mongoConnection();
        await db.serverConfig.close();
        console.log("Connection closed!");
    } catch (err) {
        console.error(err);
    }
}

seedDB();
