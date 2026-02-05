import{tool} from"@langchain/core/tools";
import {z} from"zod";
import axios from"axios";


const searchProduct = tool(async ({query,token})=>{

    console.log("searchProdcut called with data:",{query,token})


const response = await axios.get(`https://localhost:3000/api/products?q=${query}`,{
    headers:{
        Authorization:`Bearer ${token}`
    }
})
 return JSON.stringify(response.data);

},{
    name:"search_product",
    description:"search for products based on a query",
    schema:z.object({
        query:z.string().describe("the search query for the product")
    })
})

const addProductToCart = tool(async({productId,qty = 1,token})=>{

    const response = await axios.post(`http://localhost:3002/api/cart/items`,{
        productId,
        qty
    },{
        headers:{
            Authorization:`Bearer ${token}`
        }
    })

    return `added product with id ${productId} to cart with quantity ${qty}`;

},{
    name:"addproducttocart",
    description:"add a product to the user's shopping cart",
    schema:z.object({
        productId:z.string().describe("the ID of the product to add to the cart"),
        qty:z.number().describe("the quantity of the product to add").default(1),
    })
})

export default{
    searchProduct,
    addProductToCart
}