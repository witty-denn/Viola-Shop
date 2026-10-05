 "use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function Checkout(){
 const [cart,setCart]=useState([]); const [user,setUser]=useState(null);
 const [form,setForm]=useState({name:"",email:"",address:""}); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
 useEffect(()=>{setCart(JSON.parse(localStorage.getItem("cart")||"[]")); supabase.auth.getUser().then(({data})=>{setUser(data.user); if(data.user?.email)setForm(f=>({...f,email:data.user.email}))});},[]);
 const total=useMemo(()=>cart.reduce((s,p)=>s+Number(p.price),0),[cart]);
 function remove(i){const n=cart.filter((_,x)=>x!==i);setCart(n);localStorage.setItem("cart",JSON.stringify(n));}
 async function placeOrder(e){
   e.preventDefault(); if(!cart.length)return setMessage("Your cart is empty.");
   setBusy(true); setMessage("");
   const res=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer:form,items:cart,total,userId:user?.id||null})});
   const data=await res.json(); setBusy(false);
   if(res.ok){setMessage("Order placed! A confirmation email was sent.");setCart([]);localStorage.removeItem("cart");}
   else setMessage(data.error||"Could not place order.");
 }
 return <main><header className="header"><h1>Checkout</h1><Link href="/">← Shop</Link></header>
 <div className="checkout"><section><h2>Your cart</h2>{cart.map((p,i)=><div className="row" key={i}><span>{p.name}</span><span>₦{Number(p.price).toLocaleString()}</span><button onClick={()=>remove(i)}>Remove</button></div>)}<h2>Total: ₦{total.toLocaleString()}</h2></section>
 <form onSubmit={placeOrder}><h2>Customer details</h2><input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><textarea required placeholder="Delivery address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><button disabled={busy}>{busy?"Processing...":"Place order"}</button>{message&&<p>{message}</p>}</form></div></main>
}