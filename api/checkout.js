const {stripe}=require("./_stripe");
const PRODUCTS={
  1:{name:"Joint Care Chews",cents:3400},
  2:{name:"Calm & Cozy Chews",cents:3200},
  3:{name:"Skin & Coat Boost",cents:3600},
  4:{name:"Complete Bundle (3-pack)",cents:8500}};
module.exports=async(req,res)=>{
  if(req.method!=="POST")return res.status(405).json({error:"POST only"});
  try{
    const items=(req.body.items||[]).filter(i=>PRODUCTS[i.id]&&i.qty>0&&i.qty<=20);
    if(!items.length)return res.status(400).json({error:"Empty cart"});
    const subtotal=items.reduce((s,i)=>s+PRODUCTS[i.id].cents*i.qty,0);
    const site=process.env.SITE_URL||("https://"+req.headers.host);
    const body={mode:"payment",success_url:site+"/?paid=1",cancel_url:site+"/",
      allow_promotion_codes:true,shipping_address_collection:{allowed_countries:{0:"US"}},
      metadata:{status:"Paid"},
      line_items:items.map(i=>({quantity:i.qty,price_data:{currency:"usd",unit_amount:PRODUCTS[i.id].cents,product_data:{name:PRODUCTS[i.id].name}}})),
      shipping_options:{0:{shipping_rate_data:{type:"fixed_amount",display_name:subtotal>=6000?"Free shipping":"Standard shipping",
        fixed_amount:{amount:subtotal>=6000?0:695,currency:"usd"}}}}};
    if(req.body.email&&/\S+@\S+/.test(req.body.email))body.customer_email=req.body.email;
    const s=await stripe("POST","/checkout/sessions",body);
    res.json({url:s.url});
  }catch(e){res.status(500).json({error:e.message})}
};
