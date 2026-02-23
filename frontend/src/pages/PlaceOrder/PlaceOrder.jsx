import React, { useContext,useState,useEffect } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
    const { getTotalCartAmount,token,food_list,cartItems,url } = useContext(StoreContext)

    const [data,setData]=useState({
        firstName:"",
        lastName:"",
        email:"",
        street:"",
        city:"",
        state:"",
        zipcode:"",
        country:"",
        phone:""
    })

    const onChangeHandler = (event) =>{
        const name= event.target.name;
        const value = event.target.value;
        setData(data=>({...data,[name]:value}))
    }

    const placeOrder = async (event) =>{
        event.preventDefault();
        let orderItems = [];
        food_list.map((item) =>{
            if (cartItems[item._id]>0){
                let itemInfo= item;
                itemInfo["quantity"] = cartItems[item._id];
                orderItems.push(itemInfo)
            }
        })
        let orderData={
            address:data,
            items:orderItems,
            amount:getTotalCartAmount()+2
        }
        try {
            let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}})
            if (response.data.success){
                const esewaData = response.data.esewa_data;
                initiateEsewaPayment(esewaData);
            }
            else{
                alert("Error placing order")
            }
        } catch (error) {
            alert("Error: " + error.message)
        }
    }

    // eSewa payment initiation function
    const initiateEsewaPayment = (esewaData) => {
        // Create a form dynamically and submit to eSewa
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://esewa.com.np/epay/main");

        const fields = {
            amount: esewaData.amount,
            failure_url: esewaData.failure_url,
            product_delivery_charge: esewaData.product_delivery_charge,
            product_service_charge: esewaData.product_service_charge,
            product_code: esewaData.product_code,
            signature: esewaData.signature,
            signed_field_names: esewaData.signed_field_names,
            success_url: esewaData.success_url,
            tax_amount: esewaData.tax_amount,
            total_amount: esewaData.total_amount,
            transaction_uuid: esewaData.transaction_uuid
        };

        Object.keys(fields).forEach(key => {
            const input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", key);
            input.setAttribute("value", fields[key]);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    const navigate = useNavigate();
    useEffect(() =>{
        if(!token){
            navigate('/cart')
        }
        else if(getTotalCartAmount()===0){
            navigate('/cart')
        }
    },[token, getTotalCartAmount, navigate]);

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className="title">Delivery Information</p>
                <div className="multi-fields">
                    <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
                    <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
                </div>
                <input required name="email" onChange={onChangeHandler} value={data.email} type="text" placeholder='Email address' />
                <input required name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
                <div className="multi-fields">
                    <input required name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
                    <input required name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
                </div>
                <div className="multi-fields">
                    <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip-code' />
                    <input required name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
                </div>
                <input required name="phone" onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
            </div>

            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
                        </div>
                    </div>
                    <button type="submit">PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder