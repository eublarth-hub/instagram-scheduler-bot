# Instagram Scheduler Bot

Un MVP de SaaS pour planifier des publications Instagram, les enregistrer dans une base de données, puis les publier automatiquement à l'heure prévue.

## Fonctionnalités MVP

- création d'utilisateurs
- connexion de comptes Instagram (mocké pour le MVP)
- création d'une publication avec photo/vidéo, légende, date et heure
- stockage en base SQLite
- planificateur automatique qui vérifie les publications à publier
- publication simulée sur Instagram
- statut : `scheduled`, `published`, `failed`
- historique de tentative / échec
- retry automatique jusqu'à 3 essais
- dashboard simple pour tester l'API

## Stack

- Node.js
- Express
- SQLite
- Better-SQLite3

## Démarrage rapide

```bash
npm install
cp .env.example .env
npm start
```

Puis ouvrez :

- http://localhost:3000
- http://localhost:3000/api/health

## Points d'intégration Instagram réel

Le module `src/services/instagramService.js` contient un simulateur de publication pour le MVP. Pour passer en vrai intégration Instagram, il faudra remplacer ce service par un appel Facebook Graph API / Instagram Graph API avec OAuth2, access token et gestion du refresh token.

## Structure principale

```text
src/
  app.js
  config.js
  db.js
  routes/
    accounts.js
    publications.js
    users.js
  services/
    instagramService.js
    schedulerService.js
public/
  index.html
  app.js
server.js
```

## Exemple d'utilisation API

### Créer un utilisateur

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

### Ajouter un compte Instagram

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user-id>",
    "username":"alice_insta",
    "accessToken":"fake_access_token",
    "refreshToken":"fake_refresh_token"
  }'
```

### Créer une publication planifiée

```bash
curl -X POST http://localhost:3000/api/publications \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user-id>",
    "accountId":"<account-id>",
    "mediaType":"image",
    "mediaUrl":"https://example.com/image.jpg",
    "caption":"Bonjour le monde !",
    "scheduledAt":"2030-01-01T12:00:00.000Z"
  }'
```

### Lister les publications

```bash
curl http://localhost:3000/api/publications
```

## Roadmap

- ✅ MVP scheduler
- ✅ historique + retry
- ✅ dashboard local
- ✅ statuts de publication
- 🔄 multipliques comptes
- �� Reels
- 🔄 calendrier visuel
- 🔄 analytics
- 🔄 intégration OAuth Instagram réelle

## Licence

MIT
