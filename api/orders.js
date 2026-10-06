const {stripe}=require("./_stripe");
const STAGES=["Paid","Packed","Shipped","Delivered"];
module.exports=async(req,res)=>{
  if(!process.env.ADMIN_KEY||req.headers["x-admin-key"]!==process.env.ADMIN_KEY)return res.status(401).json({error:"Wrong admin key"});
  try{
    if(req.method==="POST"){
      const {id,status}=req.body;if(!/^cs_/.test(id)||!STAGES.includes(status))return res.status(400).json({error:"Bad request"});
      await stripe("POST","/checkout/sessions/"+id,{metadata:{status}});return res.json({ok:true});
    }
    const list=await stripe("GET","/checkout/sessions",{limit:50,status:"complete",expand:{0:"data.line_items"}});
    const orders=list.data.filter(s=>s.payment_status==="paid").map(s=>{
      const a=s.collected_information?.shipping_details?.address||s.shipping_details?.address||{};
      return{id:s.id,num:s.id.slice(-6).toUpperCase(),name:s.customer_details?.name||s.customer_details?.email||"Customer",
        addr:[a.line1,a.city,a.state,a.postal_code].filter(Boolean).join(", ")||"—",total:s.amount_total/100,
        st:Math.max(0,STAGES.indexOf(s.metadata?.status||"Paid")),
        items:(s.line_items?.data||[]).map(l=>l.description+" ×"+l.quantity).join(", ")}});
    res.json({orders:orders.reverse()});
  }catch(e){res.status(500).json({error:e.message})}
};
