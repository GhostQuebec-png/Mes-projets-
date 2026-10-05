# Architecture — état de référence

## Espace commun
Dépôt de coordination : `GhostQuebec-png/Mes-projets-`
Projet : `mcdo/`
Coordination : `mcdo/coordination/`

## Source publiée identifiée (vérifiée le 2026-10-05 par Claude)

| Élément | Valeur |
|---|---|
| Dépôt du code | `GhostQuebec-png/plan-stjovite` (public, **distinct** de `Mes-projets-`) |
| Branche | `main` (seule branche) |
| Commit publié | `aef30dbc67b3bc105b1562a7ea991893b1f975b5` (« index », 2026-09-09 14:20 -0400) |
| Hébergement | GitHub Pages |
| URL publique | https://ghostquebec-png.github.io/plan-stjovite/ |
| Fichier principal | `index.html` (263 642 octets, `<title>St-Jovite 22028</title>`) |
| Fichier secondaire | `outil_plannings_stjovite.html` (chargé en iframe dans l'onglet Calendrier) |
| Dernière mise en ligne | `last-modified: Wed, 09 Sep 2026 18:21:28 GMT` |

### Méthode de vérification
- Téléchargement de la page servie par GitHub Pages et comparaison SHA-256 avec le fichier au commit `aef30db` :
  - `index.html` : `b04c171a5e5921df8f3223dec4502a71b6c2a38de838e18e94f4afe513476a94` — **identique** entre le site public et le dépôt.
  - `outil_plannings_stjovite.html` : `eca7a1f89861ca4e0f867edc359a2fcee05a57431d4c8ac69fd83e78bdbb3735` — **identique**.
- Conclusion factuelle : le contenu servi sur `ghostquebec-png.github.io/plan-stjovite/` est exactement `plan-stjovite@aef30db`.

### Structure de l'application publiée (constatée dans le code)
- Fichier HTML unique, sans build ni dépendance npm. Bibliothèques chargées par CDN (`html2canvas`, `pdf-lib`).
- Écran de code d'accès : codes comparés par empreinte SHA-256 côté client (aucun code en clair dans le fichier).
- Navigation latérale : Ma journée, Le quart, Équipe, Formation, Calendrier, Département, Réglages.
- Sous-onglets Équipe : Évaluations, Employés, Mentorats, etc. Le modèle de données contient aussi `anniversaires`, `employeMois`, `punchs`, `bulletins`, `documents`, `taches`.
- Stockage des données : un **Gist GitHub privé** (`gestion-rh-22028.json`) lu et écrit par l'API GitHub avec un jeton personnel saisi dans Réglages et conservé dans le `localStorage` du navigateur. Synchronisation toutes les 45 s. Aucun jeton n'est dans le dépôt.
- Fichiers hérités intégrés : fiches de positionnement / comptoir (même lignée que `mcdo/outils/index.html` du présent dépôt).

## Écart à lever avant tout correctif — IMPORTANT
La version publiée **ne correspond pas entièrement** à la description du projet dans `PROJECT.md` et `BUGS.md` :
- le libellé « St-Jovite · Gestion » n'apparaît nulle part (titre affiché : « St-Jovite 22028 ») ;
- aucune page « Employé du mois » ni « Anniversaires » dans la navigation (seulement dans le modèle de données) ;
- aucune trace de Clearview GO, de collecte automatique des ventes, de KPI de ventes ou d'états de connecteurs.

Hypothèses (non vérifiées) :
1. une version plus récente de « St-Jovite · Gestion » existe ailleurs (conversation ChatGPT, artefact claude.ai non partagé, fichier local, autre hébergement) et n'a jamais été poussée sur GitHub ;
2. ou les bugs historiques concernent une version de travail qui n'a pas été publiée.

Tant que Romuald n'a pas confirmé l'URL qu'il utilise réellement au quotidien, **`plan-stjovite@aef30db` est la seule production vérifiable**, mais il n'est pas prouvé que ce soit « St-Jovite · Gestion ».

## Autres sources examinées (et écartées)
- `Mes-projets-/mcdo/outils/index.html` : « Préparation des quarts » (outil plus ancien, juin 2026). Pas la production du site de gestion.
- `Mes-projets-/mcdo/outils/plan-positionnement-redessine.html` : plan de positionnement seul.
- Artefact claude.ai « St-Jovite Gestion — Avant/Après » : maquette de design (canevas), pas l'application.
- `GhostQuebec-png/on-embauche-21-22-23-aout-2026` : page d'embauche. `GhostQuebec-png/docs` : gabarit Mintlify. Sans lien.
- Historique `plan-stjovite` : un fichier `gestion-rh.html` a existé (juillet 2026) puis a été supprimé au commit `7a48c45` (2026-09-08) et fusionné dans `index.html`.

## Flux souhaité
Romuald
→ ChatGPT ou Claude
→ branche/commit GitHub (dans `plan-stjovite` pour le code, `Mes-projets-` pour la coordination)
→ tests et vérification
→ revue par l'autre agent si nécessaire
→ validation
→ déploiement (fusion sur `plan-stjovite/main` = mise en ligne immédiate par GitHub Pages)

## Règle de déploiement
Ne jamais considérer une archive historique, un ancien correctif ou une copie locale comme la production actuelle sans vérification.
Attention : sur `plan-stjovite`, tout push sur `main` est publié en production. Travailler sur une branche et fusionner seulement après validation de Romuald.
