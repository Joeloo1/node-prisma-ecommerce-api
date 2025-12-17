import express from "express";

import { addItemToCart, getMyCart, updateCartItem, removeCartItems, clearCart } from "../../controller/cartController";
import { Protect } from "../../controller/authController";

const router = express.Router();

router.use(Protect);

router
    .route('/')
    .get(getMyCart)
    .delete(clearCart)


router
    .route("/items")
    .post(addItemToCart);

router
    .route('/items/:itemId')
    .patch(updateCartItem)
    .delete(removeCartItems)


export default router;
