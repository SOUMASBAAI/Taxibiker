# WhatsApp Business API - Message Templates for Taxi Biker Paris

## Template 1: Reservation Confirmation

**Template Name:** `reservation_confirmation`
**Category:** TRANSACTIONAL
**Language:** French (fr)

```
🏍️ *TAXI BIKER PARIS - Confirmation de réservation*

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

## Template 2: Reservation Accepted

**Template Name:** `reservation_accepted`
**Category:** TRANSACTIONAL
**Language:** French (fr)

```
🏍️ *TAXI BIKER PARIS - Mise à jour*

Bonjour {{1}},

✅ *Bonne nouvelle !*
Votre réservation du {{2}} à {{3}} a été *confirmée* !

📍 {{4}} → {{5}}
💰 Prix : {{6}}€

Nous serons là à l'heure ! 🏍️
```

## Template 3: Reservation Cancelled

**Template Name:** `reservation_cancelled`
**Category:** TRANSACTIONAL
**Language:** French (fr)

```
🏍️ *TAXI BIKER PARIS - Mise à jour*

Bonjour {{1}},

❌ *Réservation annulée*
Nous sommes désolés, votre réservation du {{2}} à {{3}} n'a pas pu être confirmée.

N'hésitez pas à faire une nouvelle demande pour d'autres créneaux. 🙏
```

## Template 4: Admin Notification

**Template Name:** `admin_new_reservation`
**Category:** TRANSACTIONAL
**Language:** French (fr)

```
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

## Template Variables Mapping

### For reservation_confirmation:

1. {{1}} = firstname
2. {{2}} = date
3. {{3}} = time
4. {{4}} = departure
5. {{5}} = arrival
6. {{6}} = price

### For reservation_accepted:

1. {{1}} = firstname
2. {{2}} = date
3. {{3}} = time
4. {{4}} = departure
5. {{5}} = arrival
6. {{6}} = price

### For reservation_cancelled:

1. {{1}} = firstname
2. {{2}} = date
3. {{3}} = time

### For admin_new_reservation:

1. {{1}} = firstname
2. {{2}} = lastname
3. {{3}} = phone
4. {{4}} = email
5. {{5}} = date
6. {{6}} = time
7. {{7}} = departure
8. {{8}} = arrival
9. {{9}} = price

## Setup Instructions

1. **Submit these templates** in Twilio Console → WhatsApp → Message Templates
2. **Wait for approval** (usually 24-48 hours)
3. **Update your WhatsAppService.php** to use templates instead of free-form messages
4. **Test with approved templates**

## Pricing Information

- **Template messages**: ~€0.055 per message
- **Session messages**: €0.016 per message (within 24h of customer reply)
- **Authentication messages**: €0.045 per message

## Business Verification Requirements

- Business registration documents
- Proof of address
- Website with privacy policy
- Business phone number verification
- Facebook Business Manager account
