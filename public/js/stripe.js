import axios from "axios"
import { showAlert } from "./alerts"


export const bookTour = async tourId => {
    try {
        const stripe = Stripe('pk_test_51MqYdHDJgbb5tAFAXkoMk2NG8hWuCWB343qm7ABwADRC5bN2QOTomyNewfGICKO4QdMj3pTNJFatAO4SV9A9Lxzq00KLVTsXXD')
        //1) get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

        //2) create checkoutform + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch (error) {
        console.log(error)
        showAlert('error', error)
    }
}