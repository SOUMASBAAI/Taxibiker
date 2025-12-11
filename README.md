# TaxiBiker 🚴‍♂️

Application de réservation de taxi-moto développée avec Symfony (backend) et React (frontend).

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PHP 8.2+
- Composer

### Installation et démarrage

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd taxibiker

# 2. Démarrer le backend
cd taxibiker-back
composer install
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
./scripts/start-backend.sh

# 3. Démarrer le frontend (nouveau terminal)
cd taxibiker-front
npm install
npm run dev
```

**URLs locales :**

- Frontend : http://localhost:3000
- Backend API : http://localhost:8000/api

## 📁 Structure du projet

```
taxibiker/
├── taxibiker-back/     # Backend Symfony (API)
├── taxibiker-front/    # Frontend React
├── scripts/           # Scripts essentiels
├── config/           # Configurations d'environnement
└── .github/workflows/ # CI/CD automatique
```

## 🚀 Déploiement

### Déploiement automatique

1. Configurez les secrets GitHub dans `Settings > Secrets and variables > Actions`
2. Poussez sur `main` pour déclencher le déploiement automatique

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

### Scripts disponibles

- `./scripts/deploy.sh` - Déploiement complet
- `./scripts/start-backend.sh` - Démarrer le backend local
- `./scripts/start-frontend.sh` - Démarrer le frontend local

## 📋 Fonctionnalités

### Interface utilisateur

- ✅ Inscription et connexion
- ✅ Réservation de trajets avec calcul automatique des prix
- ✅ Gestion du crédit utilisateur
- ✅ Historique des réservations

### Interface administrateur

- ✅ Gestion des clients et réservations
- ✅ Suivi des paiements et statistiques

### API Backend

- ✅ API REST avec authentification JWT
- ✅ Système de réservations et calcul de prix dynamique
- ✅ Gestion des utilisateurs et crédits

## 🛠️ Technologies

**Backend :** Symfony 7.3, API Platform, Doctrine ORM, MySQL, JWT Authentication  
**Frontend :** React 19, Vite, TailwindCSS, React Router, Leaflet/Google Maps  
**DevOps :** GitHub Actions, PlanetHoster

## 🔧 Configuration

### Variables d'environnement essentielles

**Backend (.env)**

```env
DATABASE_URL=mysql://user:password@localhost:3306/taxibiker
JWT_PASSPHRASE=your_secure_passphrase
```

**Frontend (automatique)**

- Développement : `http://localhost:8000/api`
- Production : `/api` (URL relative)

## 📄 Licence

Ce projet est sous licence propriétaire.
