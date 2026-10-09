<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Instagram Scheduler Bot</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        background: #0f172a;
        color: #e2e8f0;
      }

      .container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .card {
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      input, textarea, button, select {
        width: 100%;
        margin-top: 8px;
        margin-bottom: 16px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #374151;
        background: #0b1220;
        color: #fff;
        box-sizing: border-box;
      }

      button {
        background: #3b82f6;
        border: none;
        cursor: pointer;
        font-weight: 700;
      }

      button.secondary {
        background: #16a34a;
      }

      pre {
        background: #020817;
        border-radius: 8px;
        padding: 12px;
        overflow: auto;
      }

      h1, h2, h3 {
        margin-top: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Instagram Scheduler Bot</h1>

      <div class="grid">
        <div class="card">
          <h2>Créer un utilisateur</h2>
          <input id="userEmail" type="email" placeholder="Email" />
          <input id="userPassword" type="password" placeholder="Mot de passe" />
          <button id="createUserBtn">Créer l'utilisateur</button>
        </div>

        <div class="card">
          <h2>Ajouter un compte Instagram</h2>
          <input id="userId" type="text" placeholder="User ID" />
          <input id="accountUsername" type="text" placeholder="Nom d'utilisateur Instagram" />
          <input id="accountToken" type="text" placeholder="Access token" />
          <button id="createAccountBtn">Ajouter le compte</button>
        </div>

        <div class="card">
          <h2>Créer une publication</h2>
          <input id="postUserId" type="text" placeholder="User ID" />
          <input id="postAccountId" type="text" placeholder="Account ID" />
          <input id="mediaType" type="text" value="image" placeholder="image/video" />
          <input id="mediaUrl" type="text" placeholder="URL du média" />
          <textarea id="caption" rows="4" placeholder="Légende"></textarea>
          <input id="scheduledAt" type="datetime-local" />
          <button class="secondary" id="createPostBtn">Planifier la publication</button>
        </div>
      </div>

      <div class="card" style="margin-top: 30px;">
        <h2>Publications</h2>
        <button id="refreshPostsBtn">Rafraîchir</button>
        <pre id="postsResult">Chargement...</pre>
      </div>
    </div>

    <script src="./app.js"></script>
  </body>
</html>
