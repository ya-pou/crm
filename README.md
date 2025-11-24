# Light CRM — API (NestJS)

API backend du projet **Light CRM**, conçue avec **NestJS** et **TypeScript**.  
Elle fournit les fonctionnalités essentielles d’un CRM léger : gestion des utilisateurs, clients, opportunités, authentification et rôles.

Cette API sert de démonstration pour la création d’**applications métier** modernes, extensibles et sécurisées.

---

## ✨ Fonctionnalités principales

- 🔐 Authentification JWT (login & register)
- 👤 Gestion des utilisateurs  
- 🛡 RBAC (rôles) + autorisations fines (CASL)
- 🧾 Gestion des clients
- 📈 Gestion des opportunités
- 📘 Documentation Swagger intégrée
- 🧱 Architecture NestJS modulaire

---

## 🧰 Stack technique

- **NestJS** (TypeScript)
- **TypeORM**
- **MySQL**
- **JWT**, **RBAC**, **CASL**
- **Swagger** / OpenAPI

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/ya-pou/api-light-crm
cd api-light-crm
```
### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer un fichier `.env` à la racine :

```bash
# Base de données
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306

# Authentification
JWT_SECRET=secret_key
```

### 4. Lancer l'API
```bash
npm run start:dev
```
- Application disponible sur le port 3000 par défaut : http://localhost:3000
- Swagger disponible à l'adresse : http://localhost:3000/api

---

## 🔗 Frontend associé

Le frontend Angular (Light CRM UI) est disponible dans un dépôt séparé.
(Lien ajouté prochainement)

## 📄 Licence

Projet personnel / démonstration.
Libre d’utilisation pour un usage interne ou éducatif.