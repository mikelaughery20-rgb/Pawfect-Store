const {stripe}=require("./_stripe");
// Test-mode price IDs. For live mode, set env PRICE_IDS to the same JSON shape using your live price IDs.
const PRICES=JSON.parse(process.env.PRICE_IDS||JSON.stringify({
  1:{price:"price_1UNElFB9gg8UZzUpGdN0UxDA",cents:3400},
  2:{price:"price_1UNElHB9gg8UZzUpTzwyhHCs",cents:3200},
  3:{price:"price_1UNElJB9gg8UZzUphZzgbwhP",cents:3600},
  4:{price:"price_1UNElLB9gg8UZzUpxq1hZ9m7",cents:8500}}));
module.exports=async(req,res)=>{
  if(req.method!=="POST")return res.status(405).json({error:"POST only"});
  try{
    const items=(req.body.items||[]).filter(i=>PRICES[i.id]&&i.qty>0&&i.qty<=20);
    if(!items.length)return res.status(400).json({error:"Empty cart"});
    const subtotal=items.reduce((s,i)=>s+PRICES[i.id].cents*i.qty,0);
    const site=process.env.SITE_URL||("https://"+req.headers.host);
    const body={mode:"payment",success_url:site+"/?paid=1",cancel_url:site+"/",
      allow_promotion_codes:true,shipping_address_collection:{allowed_countries:{0:"US"}},
      metadata:{status:"Paid"},
      line_items:items.map(i=>({price:PRICES[i.id].price,quantity:i.qty})),
      shipping_options:{0:{shipping_rate_data:{type:"fixed_amount",display_name:subtotal>=6000?"Free shipping":"Standard shipping",
        fixed_amount:{amount:subtotal>=6000?0:695,currency:"usd"}}}}};
    if(req.body.email&&/\S+@\S+/.test(req.body.email))body.customer_email=req.body.email;
    const s=await stripe("POST","/checkout/sessions",body);
    res.json({url:s.url});
  }catch(e){res.status(500).json({error:e.message})}
};
