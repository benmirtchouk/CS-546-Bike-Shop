const products = require("../data").products;


function getSubTotal(){
    //calc subtotal based on product price and amount
    if(!$("#product")||!$("#amount")){
        $("#subtotal").append(0);
    }else{
        const prdct = await products.get($("#product"));
        $("#subtotal").append($("#amount")*prdct.price);
    }
}