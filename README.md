# TaxiBiker 🚴‍♂️

Application de réservation de taxi-moto développée avec Symfony (backend) et React (frontend).

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PHP 8.2+
- Composer
- Docker (optionnel, pour la base de données locale)

### Installation

1. **Cloner le repository**

   ```bash
   git clone https://github.com/votre-username/taxibiker.git
   cd taxibiker
   ```

2. **Configuration automatique**

   ```bash
   chmod +x scripts/setup-dev.sh
   ./scripts/setup-dev.sh
   ```

3. **Démarrer l'environnement**

   ```bash
   ./scripts/start-all.sh
   ```

4. **Accéder à l'application**
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000/api

## 📁 Structure du projet

```
TaxiBiker/
├── taxibiker-back/        # Backend Symfony 7.3
│   ├── src/
│   │   ├── Controller/    # Contrôleurs API
│   │   ├── Entity/        # Entités Doctrine
│   │   ├── Repository/    # Repositories
│   │   └── Service/       # Services métier
│   ├── config/           # Configuration Symfony
│   └── migrations/       # Migrations de base de données
│
├── taxibiker-front/      # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── assets/       # Assets statiques
│   └── public/          # Fichiers publics
│
├── scripts/             # Scripts de déploiement et développement
├── .github/workflows/   # GitHub Actions CI/CD
└── config/             # Configurations de déploiement
```

## 🛠️ Technologies utilisées

### Backend

- **Symfony 7.3** - Framework PHP
- **API Platform** - API REST automatique
- **Doctrine ORM** - Mapping objet-relationnel
- **MySQL** - Base de données
- **JWT Authentication** - Authentification par tokens
- **Twilio SDK** - Notifications WhatsApp

### Frontend

- **React 19** - Bibliothèque UI
- **Vite** - Build tool moderne
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Routage côté client
- **Leaflet/Google Maps** - Cartes interactives
- **Lucide React** - Icônes

### DevOps

- **GitHub Actions** - CI/CD
- **Docker** - Conteneurisation (dev)
- **PlanetHoster** - Hébergement production

## 🔧 Commandes utiles

### Développement

```bash
# Démarrer tout l'environnement
./scripts/start-all.sh

# Démarrer individuellement
./scripts/start-db.sh       # Base de données uniquement
./scripts/start-backend.sh  # Backend Symfony
./scripts/start-frontend.sh # Frontend React

# Arrêter la base de données
./scripts/stop-db.sh
```

### Backend (Symfony)

```bash
cd taxibiker-back

# Installer les dépendances
composer install

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les fixtures (données de test)
php bin/console doctrine:fixtures:load

# Démarrer le serveur de développement
symfony serve --port=8000
```

### Frontend (React)

```bash
cd taxibiker-front

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Linter
npm run lint
```

## 🚀 Déploiement

### Déploiement automatique

Le projet utilise GitHub Actions pour le déploiement continu :

- **Push sur `main`** → Déploiement automatique vers **staging**
- **Push sur `production`** → Déploiement automatique vers **production**

### Déploiement manuel

```bash
# Créer un package de déploiement
./scripts/deploy.sh production

# Le package sera créé dans deploy/public_html/
```

### Configuration requise

1. **Secrets GitHub** (dans Settings > Secrets and variables > Actions) :

   ```
   PLANETHOSTER_STAGING_HOST
   PLANETHOSTER_STAGING_USERNAME
   PLANETHOSTER_STAGING_PASSWORD
   PLANETHOSTER_PROD_HOST
   PLANETHOSTER_PROD_USERNAME
   PLANETHOSTER_PROD_PASSWORD
   JWT_PASSPHRASE
   ```

2. **Variables d'environnement sur le serveur** :
   - Copier `config/production.env.example` vers `.env` dans le dossier API
   - Configurer la base de données PostgreSQL
   - Configurer les clés API (Twilio, Google Maps, etc.)

📖 **Guide complet** : Voir [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔐 Sécurité

- Authentification JWT avec clés RSA
- Headers de sécurité configurés
- Validation des données côté backend
- CORS configuré pour les domaines autorisés
- Chiffrement des mots de passe avec bcrypt

## 🧪 Tests

```bash
# Tests backend (à implémenter)
cd taxibiker-back
php bin/phpunit

# Tests frontend (à implémenter)
cd taxibiker-front
npm test
```

## 📊 Fonctionnalités

### Utilisateurs

- ✅ Inscription et connexion
- ✅ Gestion du profil
- ✅ Historique des réservations
- ✅ Système de crédits
- ✅ Notifications WhatsApp

### Réservations

- ✅ Réservation classique
- ✅ Réservations prédéfinies
- ✅ Tarification par zones
- ✅ Tarifs forfaitaires
- ✅ Frais basés sur le temps

### Administration

- ✅ Gestion des clients
- ✅ Gestion des réservations
- ✅ Historique des crédits
- ✅ Régularisation des comptes
- ✅ Notifications par email

### Cartes et géolocalisation

- ✅ Intégration Google Maps
- ✅ Intégration Leaflet
- ✅ Sélection de zones
- ✅ Calcul automatique des tarifs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 License

Ce projet est sous licence propriétaire. Tous droits réservés.

## 📞 Support

- **Issues GitHub** : [Créer un ticket](https://github.com/votre-username/taxibiker/issues)
- **Documentation** : [DEPLOYMENT.md](DEPLOYMENT.md)
- **Email** : support@taxibiker.com

## 🎯 Roadmap

- [ ] Tests unitaires et d'intégration
- [ ] Notifications push
- [ ] Application mobile (React Native)
- [ ] Système de paiement en ligne
- [ ] Géofencing avancé
- [ ] Analytics et reporting
- [ ] API publique pour partenaires

---

Développé avec ❤️ pour optimiser les déplacements urbains.
