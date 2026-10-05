# Collaboration IA — règles communes

Ce dépôt sert d'espace de travail partagé entre Romuald, ChatGPT et Claude.

## Règle principale
GitHub est la source commune de vérité pour les fichiers de projet présents dans ce dépôt. Avant de commencer un travail, lire les instructions globales puis les fichiers de coordination du projet concerné.

## Ordre de lecture
1. `AGENTS.md`
2. `CLAUDE.md` si l'agent est Claude
3. le `README.md` du projet concerné
4. les fichiers du dossier `coordination/` du projet, dans cet ordre :
   - `PROJECT.md`
   - `ARCHITECTURE.md`
   - `DECISIONS.md`
   - `BUGS.md`
   - `TODO.md`
   - `HANDOFF.md`

## Travail multi-agent
- Ne jamais supposer que l'autre agent a vu une conversation privée.
- Toute décision qui doit survivre à une conversation doit être écrite dans GitHub.
- Avant une modification importante, vérifier `DECISIONS.md`, `TODO.md` et le dernier `HANDOFF.md`.
- Après un travail substantiel, mettre à jour `HANDOFF.md`.
- Si deux agents arrivent à des conclusions différentes, ne pas écraser silencieusement la décision précédente : documenter le désaccord.
- Ne pas modifier simultanément les mêmes fichiers sans coordination. Pour le code, privilégier une branche ou une pull request dédiée.

## Sécurité
Ne jamais committer de mot de passe, code 2FA, jeton, cookie de session, clé API, secret, donnée bancaire ou autre identifiant sensible. Utiliser les mécanismes de secrets/variables d'environnement appropriés.

## Exigence de vérification
Pour les normes, procédures, chiffres ou exigences McDonald's, ne rien inventer. Si l'information n'est pas présente dans une source officielle accessible, indiquer qu'elle n'est pas vérifiée.
