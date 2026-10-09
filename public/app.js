<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Instagram Scheduler Bot</title>
    <style>
      :root {
        --bg: #0f172a;
        --panel: #111827;
        --panel-2: #1f2937;
        --text: #e5e7eb;
        --muted: #9ca3af;
        --primary: #3b82f6;
        --primary-2: #2563eb;
        --success: #22c55e;
        --danger: #ef4444;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family: Arial, sans-serif;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 30px 20px 60px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 0 28px;
      }

      .brand {
        font-size: 1.8rem;
        font-weight: 700;
      }

      .actions { display: flex; gap: 12px; align-items: center; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
      }

      .card {
        background: var(--panel);
        border: 1px solid var(--panel-2);
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.18);
      }

      h1, h2, h3, p { margin-top: 0; }

      label {
        display: block;
        margin-bottom: 8px;
        color: var(--muted);
        font-size: 0.9rem;
      }

      input, textarea, select, button {
        width: 100%;
        border-radius: 10px;
        padding: 12px 14px;
        border: 1px solid var(--panel-2);
        background: #0b1220;
        color: var(--text);
        font-size: 1rem;
        margin-bottom: 14px;
      }

      button {
        border: none;
        background: var(--primary);
        cursor: pointer;
        font-weight: 700;
      }

      button:hover { background: var(--primary-2); }
      button.secondary { background: var(--success); }
      button.secondary:hover { background: #1f9d4a; }
      button.danger { background: var(--danger); }
      button.danger:hover { background: #dc2626; }

      .hidden { display: none !important; }

      .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }

      .summary-box {
        background: #0b1220;
        border: 1px solid var(--panel-2);
        border-radius: 12px;
        padding: 16px;
      }

      .summary-box .value {
        font-size: 1.5rem;
        font-weight: 700;
      }

      .muted { color: var(--muted); }

      .post-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 12px;
      }

      .post-item {
        background: #0b1220;
        border: 1px solid var(--panel-2);
        border-radius: 12px;
        padding: 16px;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .status-pill {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .scheduled { background: rgba(245,158,11,0.2); color: #fbbf24; }
      .published { background: rgba(34,197,94,0.2); color: #4ade80; }
      .failed { background: rgba(239,68,68,0.2); color: #f87171; }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }

      .day-name, .day-cell {
        background: #0b1220;
        border: 1px solid var(--panel-2);
        border-radius: 10px;
        padding: 10px;
        text-align: center;
      }

      .day-name {
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 700;
      }

      .day-cell {
        min-height: 70px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
      }

      .day-cell.has-posts {
        border-color: var(--primary);
        background: rgba(59, 130, 246, 0.08);
      }

      .day-number {
        font-size: 0.9rem;
        margin-bottom: 6px;
      }

      .day-count {
        font-size: 0.75rem;
        color: #bfdbfe;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header class="header">
        <div class="brand">Instagram Scheduler Bot</div>
        <div id="authActions" class="actions">
          <button id="logoutBtn" class="danger hidden">Déconnexion</button>
        </div>
      </header>

      <section id="authSection" class="grid">
        <div class="card">
          <h2>Inscription</h2>
          <label>Email</label>
          <input id="registerEmail" type="email" placeholder="you@example.com" />
          <label>Mot de passe</label>
          <input id="registerPassword" type="password" placeholder="••••••••" />
          <button id="registerBtn">Créer mon compte</button>
        </div>

        <div class="card">
          <h2>Connexion</h2>
          <label>Email</label>
          <input id="loginEmail" type="email" placeholder="you@example.com" />
          <label>Mot de passe</label>
          <input id="loginPassword" type="password" placeholder="••••••••" />
          <button id="loginBtn" class="secondary">Se connecter</button>
        </div>
      </section>

      <section id="dashboardSection" class="hidden">
        <div class="card" style="margin-bottom: 20px;">
          <h2>Tableau de bord</h2>
          <p id="welcomeText" class="muted">Bienvenue.</p>
          <div class="summary" id="summaryBoxes"></div>
        </div>

        <div class="grid" style="margin-bottom: 20px;">
          <div class="card">
            <h3>Ajouter un compte Instagram</h3>
            <label>Nom d'utilisateur</label>
            <input id="accountUsername" type="text" placeholder="mon_compte_ig" />
            <label>Access Token</label>
            <input id="accountToken" type="text" placeholder="fake_token" />
            <label>IG User ID</label>
            <input id="igUserId" type="text" placeholder="1234567890" />
            <button id="addAccountBtn">Ajouter le compte</button>
          </div>

          <div class="card">
            <h3>Planifier une publication</h3>
            <label>Compte</label>
            <select id="postAccountSelect"></select>
            <label>Type</label>
            <select id="mediaType">
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
            </select>
            <label>Choisir un fichier (optionnel)</label>
            <input id="mediaFile" type="file" accept="image/*,video/*" />
            <label>URL média</label>
            <input id="mediaUrl" type="text" placeholder="https://..." />
            <label>Caption</label>
            <textarea id="caption" rows="4" placeholder="Votre légende ..."></textarea>
            <label>Date de publication</label>
            <input id="scheduledAt" type="datetime-local" />
            <button id="createPostBtn" class="secondary">Planifier</button>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <h3>Calendrier</h3>
          <div id="calendarGrid" class="calendar-grid"></div>
        </div>

        <div class="card">
          <h3>Publications</h3>
          <button id="refreshPostsBtn">Rafraîchir</button>
          <ul id="postList" class="post-list"></ul>
        </div>
      </section>
    </div>

    <script src="./app.js"></script>
  </body>
</html>
