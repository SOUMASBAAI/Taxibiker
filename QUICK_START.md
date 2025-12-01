# 🚀 Guide de Démarrage Rapide TaxiBiker

## ⚡ Démarrage en 3 étapes

### 1. Résoudre le problème de compatibilité PHP

```bash
# Dans Git Bash ou terminal
cd taxibiker-back
rm composer.lock
composer update --no-interaction
```

### 2. Configuration automatique

```bash
# Retourner à la racine du projet
cd ..
./scripts/setup-dev.sh
```

### 3. Démarrer l'application

```bash
./scripts/start-all.sh
```

## 🌐 URLs de l'application

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:8000
- **API** : http://localhost:8000/api
- **Health Check** : http://localhost:8000/api/health

## 🛠️ Scripts disponibles

### Démarrage

```bash
./scripts/start-all.sh      # Tout démarrer (recommandé)
./scripts/start-db.sh       # MySQL uniquement
./scripts/start-backend.sh  # Backend Symfony uniquement
./scripts/start-frontend.sh # Frontend React uniquement
```

### Maintenance

```bash
./scripts/setup-dev.sh      # Configuration initiale
./scripts/diagnose.sh       # Diagnostic complet
./scripts/quick-fix.sh      # Résoudre problèmes courants
./scripts/stop-db.sh        # Arrêter MySQL
```

### Déploiement

```bash
./scripts/deploy.sh production    # Déploiement manuel
./scripts/pre-deploy-check.sh    # Vérifications pré-déploiement
```

## 🐛 Problèmes courants

### Erreur de compatibilité PHP

```bash
./scripts/quick-fix.sh
```

### Base de données non accessible

```bash
./scripts/start-db.sh
```

### Permissions (Linux/macOS)

```bash
chmod +x scripts/*.sh
```

### Cache Symfony

```bash
cd taxibiker-back
rm -rf var/cache/*
php bin/console cache:clear
```

## 📚 Documentation complète

- **Installation** : [README.md](README.md)
- **Déploiement** : [DEPLOYMENT.md](DEPLOYMENT.md)
- **Dépannage** : [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **PlanetHoster** : [config/planethoster-setup.md](config/planethoster-setup.md)

## 🎯 Première utilisation

1. **Résolvez le problème PHP** (étape 1 ci-dessus)
2. **Exécutez le diagnostic** : `./scripts/diagnose.sh`
3. **Configurez l'environnement** : `./scripts/setup-dev.sh`
4. **Démarrez l'application** : `./scripts/start-all.sh`
5. **Ouvrez votre navigateur** sur http://localhost:3000

## ⚠️ Prérequis

- **PHP 8.2+**
- **Node.js 18+**
- **Composer**
- **MySQL** (XAMPP, WAMP, MAMP ou installation native)

---

**Besoin d'aide ?** Consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 📖
