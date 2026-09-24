# Mise à niveau v60 vers v61 · St-Jovite Gestion

À appliquer sur la v60 déjà publiée. Deux fichiers seulement : `daily-briefing.js` et `verify-briefing.mjs`. `worker.js`, `daily-briefing.css` et `verify-collector.mjs` ne changent pas.

## Correction

En v60, la valeur « An passé » des cases du jour venait de la date du bloc Clearview. Avec un bloc en cache du mercredi 23 septembre, les cases du jeudi 24 affichaient « mer. 24 sept. 2025 ». En v61, une case du jour n'affiche une valeur de l'an passé que si sa date est exactement aujourd'hui moins 364 jours.

## Installation

1. Applique `v60-vers-v61.patch` sur la v60. S'il ne s'applique pas proprement, remplace les deux fichiers par ceux du dossier `fichiers/`, sans les modifier.
2. `npm run build`, puis les 12 `verify-*.mjs`. Tous doivent passer. Le test modifié échoue volontairement sur la v60.
3. Publie. Ne crée pas le secret `COLLECTOR_TOKEN`.

## Instructions de collecte

`instructions-collecte-v2.txt` remplace les instructions de la tâche planifiée qui alimente le tableau de bord. Ne l'installer qu'après que Romuald a rempli les deux adresses web entre crochets (McHire et McD Connect / Blink), ou en acceptant que ces deux sources restent « non disponibles ».
