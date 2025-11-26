const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Simple in-memory storage (replace with MongoDB later)
let payments = [];
let servers = [];

// Hosting Plans
const plans = {
  vps: {
    basic: { name: "Basic VPS", price: 5, specs: "1GB RAM, 1CPU, 20GB SSD" },
    pro: { name: "Pro VPS", price: 10, specs: "2GB RAM, 2CPU, 40GB SSD" }
  },
  game: {
    minecraft: { name: "Minecraft", price: 8, specs: "2GB RAM, 20GB SSD" },
    rust: { name: "Rust", price: 15, specs: "4GB RAM, 25GB SSD" }
  },
  coding: {
    nodejs: { name: "Node.js", price: 6, specs: "1GB RAM, 10GB SSD" }
  }
};

// Routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ZyntrixTech Hosting</title>
        <style>
            body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .plan { border: 1px solid #ddd; padding: 20px; margin: 10px; border-radius: 5px; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🚀 ZyntrixTech Server Hosting</h1>
        <p>Accepting UPI & Litecoin Payments</p>
        
        <h2>VPS Plans</h2>
        ${Object.entries(plans.vps).map(([id, plan]) => `
            <div class="plan">
                <h3>${plan.name} - $${plan.price}/month</h3>
                <p>${plan.specs}</p>
                <button class="btn" onclick="buyPlan('vps_${id}')">Buy Now</button>
            </div>
        `).join('')}
        
        <h2>Game Servers</h2>
        ${Object.entries(plans.game).map(([id, plan]) => `
            <div class="plan">
                <h3>${plan.name} - $${plan.price}/month</h3>
                <p>${plan.specs}</p>
                <button class="btn" onclick="buyPlan('game_${id}')">Buy Now</button>
            </div>
        `).join('')}
        
        <h2>Coding Servers</h2>
        ${Object.entries(plans.coding).map(([id, plan]) => `
            <div class="plan">
                <h3>${plan.name} - $${plan.price}/month</h3>
                <p>${plan.specs}</p>
                <button class="btn" onclick="buyPlan('coding_${id}')">Buy Now</button>
            </div>
        `).join('')}
        
        <script>
            function buyPlan(planId) {
                const method = prompt('Choose payment method: upi or litecoin');
                if (method === 'upi' || method === 'litecoin') {
                    fetch('/api/payment/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ planId, method })
                    })
                    .then(r => r.json())
                    .then(data => {
                        if (data.success) {
                            if (method === 'upi') {
                                alert('UPI ID: your-business@upi\\nAmount: $' + data.amount + '\\nAfter payment, contact support with transaction ID');
                            } else {
                                alert('Litecoin Address: ' + data.address + '\\nAmount: ' + data.amount + ' LTC');
                            }
                        }
                    });
                }
            }
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.post('/api/payment/create', (req, res) => {
  const { planId, method } = req.body;
  
  // Find plan
  let plan, amount;
  if (planId.startsWith('vps_')) {
    const planKey = planId.replace('vps_', '');
    plan = plans.vps[planKey];
  } else if (planId.startsWith('game_')) {
    const planKey = planId.replace('game_', '');
    plan = plans.game[planKey];
  } else if (planId.startsWith('coding_')) {
    const planKey = planId.replace('coding_', '');
    plan = plans.coding[planKey];
  }
  
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });
  
  amount = plan.price;
  
  // Create payment record
  const payment = {
    id: Date.now().toString(),
    planId,
    method,
    amount,
    status: 'pending',
    createdAt: new Date()
  };
  payments.push(payment);
  
  if (method === 'upi') {
    res.json({
      success: true,
      paymentId: payment.id,
      method: 'upi',
      amount: amount,
      upiId: 'your-business@upi',
      instructions: 'Send payment and contact support with transaction ID'
    });
  } else if (method === 'litecoin') {
    res.json({
      success: true,
      paymentId: payment.id,
      method: 'litecoin', 
      amount: amount * 0.001, // Approximate LTC amount
      address: 'Litecoin_Address_Will_Go_Here',
      instructions: 'Send exact LTC amount to address above'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Paymenter running on http://in1.zyntrixtech.xyz:${PORT}`);
});
