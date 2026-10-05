 "use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Home() {
  const [products,setProducts]=useState([]);
  const [cart,setCart]=useState([]);
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const saved=JSON.parse(localStorage.getItem("cart")||"[]"); setCart(saved);
    supabase.from("products").select("*").order("created_at",{ascending:false})
      .then(({data,error})=>{
        if(error) console.error(error);
        setProducts(data||[]);
        setLoading(false);
      });
    supabase.auth.getUser().then(({data})=>setUser(data.user));
    const {data:listener}=supabase.auth.onAuthStateChange((_e,session)=>setUser(session?.user||null));
    return ()=>listener.subscription.unsubscribe();
  },[]);

  function add(p){
    const next=[...cart,p]; setCart(next); localStorage.setItem("cart",JSON.stringify(next));
    alert(`${p.name} added to cart`);
  }
  async function login(){
    await supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo:window.location.origin}});
  }
  async function logout(){ await supabase.auth.signOut(); }
  return <main>
    <header className="header">
      <h1>QuickShop</h1>
      <nav><Link href="/checkout">Cart ({cart.length})</Link>
      {user ? <button onClick={logout}>Sign out</button> : <button onClick={login}>Sign in with Google</button>}</nav>
    </header>
    <section className="hero"><h2>Simple. Fast. Secure.</h2><p>HNG15 Lesson 2 shop demo.</p></section>
    <section className="grid">
      {loading ? <p>Loading products...</p> : products.length===0 ? <p>No products yet. Add products in Supabase.</p> :
      products.map(p=><article className="card" key={p.id}>
        <div className="emoji">🛍️</div><h3>{p.name}</h3><p>{p.description}</p><strong>₦{Number(p.price).toLocaleString()}</strong>
        <button onClick={()=>add(p)}>Add to cart</button>
      </article>)}
    </section>
  </main>
}