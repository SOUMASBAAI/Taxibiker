# WhatsApp Business API Production Setup Guide

## 🚀 Complete Setup Process for TaxiBiker

### Step 1: Business Prerequisites

Before starting, ensure you have:

1. **WhatsApp Business Account**

   - Download WhatsApp Business app
   - Verify your business phone number
   - Complete business profile

2. **Facebook Business Manager Account**

   - Create at [business.facebook.com](https://business.facebook.com)
   - Verify your business
   - Add your business phone number

3. **Business Documentation**
   - Business registration certificate
   - Proof of business address
   - Government-issued ID
   - Business website with privacy policy

### Step 2: Twilio WhatsApp Business API Application

1. **Go to Twilio Console**

   - Navigate to [console.twilio.com](https://console.twilio.com)
   - Go to **Messaging** → **WhatsApp** → **Senders**

2. **Click "Request Access"**

   - Choose "WhatsApp Business API"
   - Fill out the application form

3. **Required Information**:

   ```
   Business Name: TaxiBiker
   Business Type: Transportation/Taxi Service
   Business Website: https://taxibikerparis.com
   Business Phone: +33 X XX XX XX XX (your business number)
   Use Case: Customer notifications for taxi reservations
   Expected Volume: X messages per month
   ```

4. **Business Verification**
   - Upload business documents
   - Provide business address
   - Verify phone number ownership

### Step 3: Message Templates Creation

Once approved, create these templates in Twilio Console:

#### Template 1: Reservation Confirmation

```
Name: reservation_confirmation
Category: TRANSACTIONAL
Language: French (fr)

Content:
🚕 *TAXIBIKER - Confirmation de réservation*

Bonjour {{1}},

Votre demande de course a été reçue :

📅 *Date :* {{2}}
🕒 *Heure :* {{3}}
📍 *Départ :* {{4}}
🏁 *Arrivée :* {{5}}
💰 *Prix :* {{6}}€

Votre réservation est *en attente de confirmation*.
Vous recevrez une notification dès qu'elle sera validée.

Merci de votre confiance ! 🙏
```

#### Template 2: Reservation Accepted

```
Name: reservation_accepted
Category: TRANSACTIONAL
Language: French (fr)

Content:
🚕 *TAXIBIKER - Mise à jour*

Bonjour {{1}},

✅ *Bonne nouvelle !*
Votre réservation du {{2}} à {{3}} a été *confirmée* !

📍 {{4}} → {{5}}
💰 Prix : {{6}}€

Nous serons là à l'heure ! 🚕
```

#### Template 3: Reservation Cancelled

```
Name: reservation_cancelled
Category: TRANSACTIONAL
Language: French (fr)

Content:
🚕 *TAXIBIKER - Mise à jour*

Bonjour {{1}},

❌ *Réservation annulée*
Nous sommes désolés, votre réservation du {{2}} à {{3}} n'a pas pu être confirmée.

N'hésitez pas à faire une nouvelle demande pour d'autres créneaux. 🙏
```

#### Template 4: Admin Notification

```
Name: admin_new_reservation
Category: TRANSACTIONAL
Language: French (fr)

Content:
🔔 *NOUVELLE DEMANDE DE COURSE*

👤 *Client :* {{1}} {{2}}
📞 *Téléphone :* {{3}}
📧 *Email :* {{4}}

📅 *Date :* {{5}}
🕒 *Heure :* {{6}}
📍 *Départ :* {{7}}
🏁 *Arrivée :* {{8}}
💰 *Prix :* {{9}}€

⚡ *Action requise dans le dashboard admin*
```

### Step 4: Environment Configuration

Update your production environment file:

```bash
# Configuration Twilio pour WhatsApp Business API
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+33XXXXXXXXX  # Your approved business number

# Admin WhatsApp number
ADMIN_WHATSAPP_NUMBER=whatsapp:+33XXXXXXXXX
```

### Step 5: Template SIDs Configuration

After templates are approved, you'll get Template SIDs. Update your service:

```php
// In WhatsAppService.php, replace template names with SIDs:
private const TEMPLATE_SIDS = [
    'reservation_confirmation' => 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'reservation_accepted' => 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'reservation_cancelled' => 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'admin_new_reservation' => 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];
```

### Step 6: Testing Process

1. **Start with Sandbox** (for development)

   ```bash
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox number
   ```

2. **Switch to Production** (after approval)
   ```bash
   TWILIO_WHATSAPP_NUMBER=whatsapp:+33XXXXXXXXX  # Your business number
   ```

### Step 7: Compliance Requirements

1. **Opt-in Process**

   - Customers must opt-in to receive WhatsApp messages
   - Add checkbox in reservation form
   - Store consent in database

2. **Opt-out Process**

   - Provide way for customers to unsubscribe
   - Honor opt-out requests immediately

3. **Message Frequency**
   - Don't send promotional messages
   - Only transactional notifications
   - Respect customer preferences

### Step 8: Monitoring and Analytics

1. **Message Status Tracking**

   - Monitor delivery rates
   - Track failed messages
   - Set up error alerts

2. **Cost Monitoring**
   - Track message costs
   - Set up billing alerts
   - Optimize message frequency

### Pricing (Approximate)

- **Template Messages**: €0.055 per message
- **Session Messages**: €0.016 per message (within 24h window)
- **Authentication Messages**: €0.045 per message

### Timeline

- **Application Submission**: 1 day
- **Business Verification**: 3-7 business days
- **Template Approval**: 24-48 hours
- **Total Setup Time**: 5-10 business days

### Support Resources

- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **Business API Guide**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Twilio Support**: https://support.twilio.com

### Next Steps

1. ✅ Submit WhatsApp Business API application
2. ⏳ Wait for business verification
3. ⏳ Create and submit message templates
4. ⏳ Update production environment variables
5. ⏳ Test with approved templates
6. ⏳ Deploy to production

---

**Note**: Your code is already prepared to handle both sandbox (development) and production modes automatically based on the environment and phone number configuration.

