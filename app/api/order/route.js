import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req){
 try{
  const {customer,items,total,userId}=await req.json();
  if(!customer?.name||!customer?.email||!customer?.address||!items?.length) return NextResponse.json({error:"Missing order details."},{status:400});
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const {data:order,error}=await supabase.from("orders").insert({user_id:userId,customer_name:customer.name,email:customer.email,address:customer.address,total,items}).select().single();
  if(error) throw error;
  const auth=Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64");
  const body=`Order #${order.id}\n\nThank you ${customer.name}!\nTotal: ₦${Number(total).toLocaleString()}\nItems: ${items.map(x=>x.name).join(", ")}\nDelivery address: ${customer.address}`;
  const mg=await fetch(`https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,{method:"POST",headers:{"Authorization":`Basic ${auth}`,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({from:process.env.MAIL_FROM,to:customer.email,subject:"Order confirmation",text:body})});
  if(!mg.ok) console.error("Mailgun:",await mg.text());
  return NextResponse.json({ok:true,orderId:order.id});
 }catch(e){console.error(e);return NextResponse.json({error:"Server error. Check your Supabase/Mailgun settings."},{status:500});}
}