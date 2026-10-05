# Projet — St-Jovite · Gestion — Site

## But
Centraliser le travail relatif au site privé de gestion du restaurant McDonald's St-Jovite #22028 afin que Romuald, ChatGPT et Claude puissent reprendre le même contexte sans dépendre de copier-coller entre conversations.

## Périmètre
Le projet couvre notamment :
- la page « Ma journée » et ses KPI ;
- les pages Équipe, Mentorats, Anniversaires, Quart, Formation et Employé du mois ;
- les plannings et outils de gestion ;
- la collecte et l'actualisation des données ;
- les intégrations et connecteurs ;
- les audits, correctifs, bugs et décisions techniques ;
- l'ergonomie et la cohérence visuelle.

## Principes
- GitHub est l'espace commun de coordination.
- Le code de production doit avoir une source canonique clairement identifiée avant toute modification importante.
- Les données doivent être distinguées entre vérifiées, historiques, hypothétiques et indisponibles.
- Aucun secret, mot de passe, code 2FA, cookie ou jeton ne doit être écrit dans le dépôt.

## Responsabilités multi-agent
- ChatGPT peut piloter, analyser, documenter, vérifier et préparer des changements.
- Claude peut analyser ou modifier le code lorsqu'il travaille sur le même dépôt.
- Les deux agents consignent les décisions durables dans `coordination/`.
