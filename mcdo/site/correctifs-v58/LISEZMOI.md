# Correctif « Ma journée » — St-Jovite Gestion v58

Base : export v58, commit source `3d84383` (branche `main` du dépôt ChatGPT).

## 1. Diagnostic confirmé (code + journaux de l'export)

1. **Le site ne collecte rien lui-même.** Aucun connecteur Clearview, Medallia, McHire, McD Connect ou Gmail n'existe dans le code. Le Worker lit un flux Make (`BRIEFING_FEED_URL`) qui renvoie le dernier bilan du Data Store.
2. **Le vrai collecteur est à l'extérieur du code.** Quelque chose appelle le scénario Make « Enregistrer le briefing quotidien » environ une fois par heure. Les journaux ne disent pas quoi. *Hypothèse probable : une tâche planifiée ChatGPT qui navigue dans les applications avec tes sessions.* C'est ce collecteur qui renvoie `reauth_required` depuis que la lecture Clearview s'est arrêtée le 23 septembre à 18:01.
3. **Le HTTP 200 est normal, mais trompeur.** Make et le Worker répondent « succès » (zéro erreur dans les journaux). Le contenu, lui, porte des sources en échec ou périmées. Le statut HTTP dit seulement que le flux a répondu, pas que les données sont du jour.
4. **Le fuseau horaire n'est pas en cause.** La page utilise `America/Toronto` : le `aujISO()` de base est en temps universel, mais `agenda-upgrades.js` et `team.js` le remplacent. Le test existant `verify-today.mjs` le confirme.
5. **Le cache fonctionne comme prévu.** Il conserve la dernière donnée fiable, et la page refusait déjà d'afficher des temps de service qui ne sont pas du jour.

## 2. Ce que corrige ce patch

| Problème | Correction |
|---|---|
| L'en-tête affichait « Données au 24 septembre » avec des ventes du 23. | Il affiche « Ventes Clearview du 23 septembre », précise « Ce ne sont pas les ventes d'aujourd'hui » et donne la date de la synthèse à part. |
| Satisfaction 97,1 % présentée sans avertissement alors que Medallia est déconnecté. | Étiquette « Dernière donnée conservée · période · Medallia à reconnecter ». |
| La carte Ventes ne disait pas de quelle journée il s'agit. | Étiquette « Journée du 23 septembre 2026, pas aujourd'hui ». |
| La carte Productivité affichait « — $ ». | Elle affiche « Non collecté » et la valeur du même jour l'an passé, si elle existe. |
| Les cases COA, FCFP, RàP, heures, VPHT et TPEH étaient vides sans référence. | Chacune garde « Donnée indisponible » pour le jour et ajoute la valeur du **même jour de semaine l'an passé** (364 jours), clairement étiquetée. |
| La comparaison annuelle acceptait n'importe quelle date. | Seule la date à 364 jours est acceptée (jeudi contre jeudi). Une autre date est refusée. |
| `/api/daily-briefing` : un 200 sans indication de fraîcheur. | Ajout d'un bloc `health` calculé par le serveur au fuseau du Québec (source par source : `current`, `stale` ou `unavailable`, avec la raison) et d'un en-tête `X-Briefing-Health: complete, degraded ou down`. |

**Règle respectée :** un temps de service de la veille n'est jamais affiché comme temps du jour. Des tests le vérifient.

**Vérification :** les 11 suites `verify*.mjs` passent. Le rendu a été contrôlé dans un navigateur avec les conditions du 24 septembre.

## 3. Ce que ce patch ne peut PAS corriger

Les cases resteront « indisponible » tant que le **collecteur** ne ramène pas de données du jour. Ça se règle hors du code :

- reconnecter les sessions Clearview, Medallia et McD Connect dans l'outil qui collecte ;
- faire envoyer par le collecteur les champs attendus (voir le message n° 2) ;
- McHire : le raccourci utilise un protocole local d'appareil, qu'un serveur ne peut pas ouvrir. Il faut passer par l'adresse web de McHire ou retirer cette collecte.

⚠️ **Conformité.** Un robot qui lit Clearview, Medallia ou McD Connect avec **tes** identifiants doit être validé par ton gérant ou ton franchisé. Ce sont des systèmes internes de McDonald's.

---

## Message n° 1 à coller dans ChatGPT : appliquer le patch

> Applique ce correctif à mon site St-Jovite Gestion (version 58, commit `3d84383`). Remplace intégralement ces 4 fichiers par les versions jointes : `worker.js`, `daily-briefing.js`, `daily-briefing.css`, `verify-briefing.mjs`. Ne modifie aucun autre fichier.
> Ensuite :
> 1. lance `npm run build` ;
> 2. lance `node verify-briefing.mjs`, `node verify-today.mjs` et `node verify-day.mjs`. Les trois doivent afficher PASS ;
> 3. publie la nouvelle version ;
> 4. appelle `/api/daily-briefing` et donne-moi la valeur de l'en-tête `X-Briefing-Health` ainsi que le contenu du bloc `health` (sans données personnelles).
>
> Si un test échoue, ne publie pas : montre-moi l'erreur exacte.

Joins les 4 fichiers de ce dossier à ton message.

## Message n° 2 à coller dans ChatGPT : réparer le collecteur

> Mon site lit un bilan que le scénario Make « St-Jovite · Enregistrer le briefing quotidien » reçoit environ toutes les heures. Réponds d'abord à ceci, avec des faits vérifiés :
> 1. Qu'est-ce qui appelle ce scénario ? Une tâche planifiée ChatGPT, un agent ou autre chose ? Donne son nom, sa fréquence et l'heure de sa dernière exécution.
> 2. Pour chaque source (Clearview GO, Medallia, McD Connect / Employé du mois, McHire, Gmail), dis-moi comment elle est lue, quand elle a été lue avec succès pour la dernière fois et l'erreur exacte de la dernière tentative.
>
> Ensuite, corrige le collecteur :
> - Si une session a expiré, dis-moi précisément où et comment me reconnecter. Ne contourne jamais la double authentification.
> - **Clearview** : collecte les données **du jour même** (date au fuseau America/Toronto) au moins toutes les 60 minutes pendant les heures d'ouverture. Remplis `restaurantDashboard.clearview` avec `status`, `date` (AAAA-MM-JJ du jour), `lastSuccessfulCollection` (horodatage ISO avec fuseau), `sales`, `channels`, `labour` (`hours`, `salesPerLabourHour`, `transactionsPerLabourHour`) et `speed` (`overall` = COA, `fcfp`, `rap`, `unit: "s"`, `hotspots`).
> - **Comparaison annuelle** : ajoute `restaurantDashboard.clearview.sameDayLastYear` avec `date` = le **même jour de semaine l'an passé** (date du jour moins 364 jours), et les mêmes blocs `speed`, `labour` et `sales`, lus dans Clearview pour cette date-là. Le site refuse toute autre date. Si Clearview ne donne pas cette date, n'envoie pas le bloc.
> - **N'envoie jamais** une valeur de la veille dans les champs du jour. Si la donnée du jour est indisponible, envoie `status: "reauth_required"` ou `"error"` avec une `note` qui explique pourquoi.
> - **Medallia et Employé du mois** : même principe. Envoie `status`, `lastSuccessfulCollection` et une `note` en cas d'échec.
> - **McHire** : n'utilise plus le raccourci à protocole local. Lis l'adresse web de McHire si c'est possible depuis ton environnement. Sinon, envoie `status: "not_available"` avec la note « McHire non lisible depuis le collecteur distant ».
> - N'invente aucune donnée. Chaque chiffre doit venir de la source, pour la date indiquée.
>
> À la fin, montre-moi un exemple réel du bilan envoyé, avec les noms d'employés remplacés par « Employé 1 », « Employé 2 », etc.
