const products = require("../data").products;

const getSubTotal = async (productID, amount) => {
    //calc subtotal based on product price and amount
    if(!productID||!amount){
        return 0
    }else{
        const prdct = await products.get(productID);
        return amount*prdct.price;
    }
}