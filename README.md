# Calendrier FFBC on map

> **Calendrier FFBC : où vais-je aller ?**  
> Carte interactive OpenStreetMap des randonnées FFBC avec calendrier journalier, filtres par discipline (Route, Gravel, VTT) et consultation des détails des parcours.

---

## 🚀 Déploiement automatique sur GitHub Pages

Le projet inclut un workflow **GitHub Actions** (`.github/workflows/deploy.yml`) qui compile et déploie automatiquement le site à chaque `git push`.

### 1. Activer GitHub Pages sur votre dépôt

1. Rendez-vous sur votre dépôt GitHub (ex. `https://github.com/FabriziodelaRusta/<nom-du-repo>`).
2. Allez dans l'onglet **Settings** > **Pages** (dans le menu de gauche).
3. Sous **Build and deployment** > **Source**, sélectionnez **GitHub Actions** (au lieu de *Deploy from a branch*).
4. C'est tout ! À chaque commit sur la branche `main`, le site sera compilé et mis en ligne automatiquement.

---

## 💻 Commandes Git pour pousser le projet

```bash
# 1. Initialiser git si ce n'est pas déjà fait
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le commit (version 0.3)
git commit -m "feat: version 0.3 calendrier FFBC on map"

# 4. Définir la branche principale
git branch -M main

# 5. Lier votre dépôt GitHub (remplacez l'URL par la vôtre)
git remote add origin https://github.com/FabriziodelaRusta/<nom-du-repo>.git

# 6. Pousser vers GitHub
git push -u origin main
```

---

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Lancer le serveur local
npm run dev

# Tester la compilation de production
npm run build
```
