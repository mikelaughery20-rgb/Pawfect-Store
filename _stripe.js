// Tiny Stripe helper (no dependencies). Needs Node 18+ and env STRIPE_SECRET_KEY.
function enc(o,p){const out=[];for(const k in o){const v=o[k],key=p?`${p}[${k}]`:k;
  if(v&&typeof v==="object")out.push(enc(v,key));else if(v!==undefined)out.push(encodeURIComponent(key)+"="+encodeURIComponent(v))}
  return out.join("&")}
async function stripe(method,path,body){
  const r=await fetch("https://api.stripe.com/v1"+path+(method==="GET"&&body?"?"+enc(body):""),{method,
    headers:{Authorization:"Bearer "+process.env.STRIPE_SECRET_KEY,"Content-Type":"application/x-www-form-urlencoded"},
    body:method==="GET"||!body?undefined:enc(body)});
  const j=await r.json();if(!r.ok)throw new Error(j.error?.message||"Stripe error");return j}
module.exports={stripe};
