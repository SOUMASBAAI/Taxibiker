# Twilio Phone Number + WhatsApp Setup Guide

## 🚀 Faster Alternative: Buy Twilio Number + Self-Signup

This is a **faster and simpler** alternative to the full WhatsApp Business API process.

### Step 1: Purchase Twilio Phone Number

1. **Go to Twilio Console**

   - Navigate to **Develop** → **Phone Numbers** → **Manage** → **Buy a Number**

2. **Select Number Requirements**

   ```
   Country: France (+33)
   Capabilities: Voice + SMS (required for WhatsApp)
   Type: Local or Mobile
   Cost: ~€1-3/month
   ```

3. **Choose Your Number**
   - Pick a French number for local presence
   - Ensure it supports Voice + SMS
   - Purchase the number

### Step 2: WhatsApp Self-Signup Process

1. **Access Self-Signup**

   - Go to Twilio Console → **Messaging** → **WhatsApp** → **Get Started**
   - Choose **"Self-Signup"** option

2. **Connect Meta Business Manager**

   - Link your Facebook Business Manager account
   - Simpler than full Business API verification
   - Basic business verification required

3. **Register Your Twilio Number**
   - Submit your purchased Twilio number
   - Verify ownership (you already own it via Twilio)
   - Wait for WhatsApp approval (1-3 days)

### Step 3: Message Templates

Same templates as Business API, but faster approval:

#### Template 1: Reservation Confirmation

```
Name: taxibiker_reservation_confirmation
Category: TRANSACTIONAL
Language: French (fr)

🏍️ *TAXI BIKER PARIS - Confirmation*

Bonjour {{1}},
Réservation reçue pour le {{2}} à {{3}}
📍 {{4}} → {{5}}
💰 {{6}}€

En attente de confirmation.
Merci ! 🙏
```

#### Template 2: Reservation Status

```
Name: taxibiker_status_update
Category: TRANSACTIONAL
Language: French (fr)

🏍️ *TAXI BIKER PARIS - Mise à jour*

Bonjour {{1}},
Votre réservation du {{2}} : {{3}}

{{4}}
```

### Step 4: Environment Configuration

Update your environment with the purchased number:

```bash
# Your purchased Twilio number
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+33XXXXXXXXX  # Your purchased number

# Admin notifications
ADMIN_WHATSAPP_NUMBER=whatsapp:+33XXXXXXXXX
```

### Step 5: Code Updates

Your existing code will work perfectly! Just update the template names:

```php
// In WhatsAppService.php - update template names to match approved ones
private const TEMPLATE_NAMES = [
    'reservation_confirmation' => 'taxibiker_reservation_confirmation',
    'reservation_accepted' => 'taxibiker_status_update',
    'reservation_cancelled' => 'taxibiker_status_update',
    'admin_new_reservation' => 'taxibiker_admin_notification',
];
```

## Comparison: Self-Signup vs Full Business API

| Feature                   | Self-Signup   | Full Business API |
| ------------------------- | ------------- | ----------------- |
| **Setup Time**            | 1-3 days      | 5-10 days         |
| **Business Verification** | Basic         | Comprehensive     |
| **Template Approval**     | Faster        | Standard          |
| **Message Limits**        | Standard      | Higher            |
| **Support Level**         | Standard      | Priority          |
| **Cost**                  | Same          | Same              |
| **Features**              | Full features | Full features     |

## Recommended Approach for Taxi Biker Paris

**I recommend the Self-Signup approach because:**

1. ✅ **Faster to market** (1-3 days vs 5-10 days)
2. ✅ **Same functionality** for your use case
3. ✅ **Professional appearance** (your own number)
4. ✅ **Better than sandbox** (no limitations)
5. ✅ **Scalable** (can upgrade later if needed)

## Cost Breakdown

### Monthly Costs:

- **Twilio Phone Number**: €1-3/month
- **WhatsApp Messages**: €0.055 per template message
- **Total for 1000 messages/month**: ~€58/month

### Example Monthly Usage:

```
100 reservations × 2 messages each = 200 customer messages
100 admin notifications = 100 admin messages
Total: 300 messages × €0.055 = €16.50 + €3 number = ~€20/month
```

## Next Steps

1. **Purchase Twilio Number** (today)
2. **Start Self-Signup Process** (today)
3. **Submit Templates** (after approval)
4. **Update Environment** (when ready)
5. **Test & Deploy** (1-3 days total)

This approach gets you production WhatsApp notifications much faster while maintaining professional quality!

