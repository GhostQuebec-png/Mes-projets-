Actualise le tableau de bord privé du restaurant McDonald's St-Jovite 22028, en lecture seule. Fuseau de référence pour toutes les dates : America/Toronto.

## 0. Règles absolues
- Lecture seule : aucune écriture, aucun message, aucune modification dans Gmail, Medallia, Clearview, McHire ou McD Connect.
- N'invente jamais une donnée, une URL, un identifiant ou une fréquence. Une valeur absente = null, jamais 0.
- Une panne d'accès n'est jamais une absence de problème, ni une boîte vide, ni un zéro.
- Une panne d'une source n'arrête pas les autres. Tente les cinq sources à chaque exécution.
- Ne réinstalle pas de plugin et ne multiplie pas les onglets. Réutilise les sessions valides.
- Ne publie aucun détail privé dans la conversation.

## 1. Horodatage (dans chaque bloc ET dans sources[])
Blocs concernés : mail, medallia, clearview, mchire, employeeOfMonth, restaurantDashboard.medallia et restaurantDashboard.clearview.
- checkedAt et lastAttemptAt : heure réelle de la tentative, format ISO-8601 avec fuseau (ex. 2026-09-24T10:20:00-04:00).
- lastSuccessfulCollection : heure réelle de la dernière lecture réussie. En cas d'échec, garde l'ancienne valeur ; ne mets jamais l'heure de l'exécution en cours.
- Une source ne peut être ok ou none que si elle a été réellement lue maintenant, avec une preuve de contenu. Sinon : reauth_required (session expirée), error (panne technique) ou not_available (source non lisible depuis cet environnement).
- sources[] contient mail, medallia, clearview, mchire et employeeOfMonth, avec label, status, checkedAt et lastSuccessfulCollection, identiques aux blocs.
- Statut global : complete seulement si les cinq sources sont ok ou none ; sinon partial ; action_required si une intervention de Romuald est nécessaire.

## 2. Reprise de session (une tentative par source et par exécution, avant tout échec)
- **Gmail** : vérifie l'adresse réellement connectée. Seule romuald.mcdo22028@gmail.com est autorisée. Si c'est une autre adresse, n'utilise aucun de ses courriels, mets status=reauth_required et garde le dernier bilan fiable. Une erreur du connecteur (outil inconnu, délai) est status=error, pas une expiration.
- **Clearview** : réutilise la session. Si elle a expiré, ouvre https://www.qssweb.com/clearview/mcdsso/timeout.aspx, puis « Login / Connexion ». Vérifie ensuite que le restaurant affiché est bien 22028 - St-Jovite avant de lire quoi que ce soit.
- **Medallia** : réutilise la session. Si elle a expiré, ouvre le lien du dernier « Guest Feedback Weekly Summary » reçu dans la boîte romuald.mcdo22028@gmail.com. Vérifie que la page Medallia/SGEI et le restaurant 22028 sont ouverts. Ne fabrique aucune URL ni chemin SSO.
- **McHire et McD Connect/Blink** : n'utilise PAS les raccourcis du site : ce sont des liens d'application locale, illisibles dans ton navigateur. Réutilise une session web existante si elle est valide. Sinon, cherche dans la boîte professionnelle le dernier courriel de notification McHire (ou McD Connect) et suis uniquement le lien web officiel réellement trouvé. Si aucun lien web n'existe, mets status=not_available avec la note « Non lisible depuis le collecteur distant : aucun accès web disponible ». Ne réessaie pas ce parcours plus d'une fois par exécution.
- Si le fournisseur exige une validation humaine (double authentification, captcha, mot de passe), arrête pour cette source, mets status=reauth_required et note précisément ce qu'il faut faire (« Se reconnecter à Clearview depuis le navigateur de l'agent », par exemple).
- Une connexion réussie ne prouve pas que les données sont à jour : lis réellement les chiffres et les dates du rapport.

## 3. Collecte par source
**Gmail** : uniquement les nouveaux courriels liés à St-Jovite 22028 (opérations, personnel, formation, résultats, action à faire). Ignore les promotions et le contenu personnel. Bloc mail : account (adresse vérifiée), checkedAt, status, items[{title, detail, action, date}].

**Medallia, 22028**
- Nouvelles réponses, alertes ou plaintes depuis le dernier passage.
- Bilan glissant 30 jours et comparaison avec la même période l'an passé.
- responseCount (réponses avec score) et rawRecordCount (réponses brutes, si visible).
- Métriques : Satisfaction totale, En restaurant, Service au volant / stationnement réservé, Probabilité de recommandation, Courtoisie, Rapidité, Propreté globale, Exactitude, Qualité de la nourriture.
- Tendance hebdomadaire : score lu dans le rapport ou calcul traçable (très satisfaits / réponses notées de la semaine × 100). Si un terme manque, value=null. zeroVerified=true seulement pour un vrai 0 lu dans le rapport.
- Distribution très satisfait / intermédiaire / faible.
- Sous 25 réponses, caution=true, et ne généralise pas.
- Signal à examiner : OPH, alerte, note ≤ 3/5, commentaire clairement négatif. Thèmes récurrents avec un décompte traçable uniquement.
- Salubrité, intoxication ou comportement : toujours « allégation non vérifiée ».

**Clearview GO, 22028 : journée en cours uniquement**
- Ouvre chaque rapport en mode « En direct ». Confirme que la date affichée est la date du jour (America/Toronto) et copie-la dans clearview.date. Si Clearview affiche encore la journée précédente (entre minuit et la bascule de la journée d'affaires), ne copie aucune de ses valeurs dans le bloc du jour : laisse les champs du jour à null avec la note « Journée d'affaires du jour pas encore ouverte dans Clearview. ».
- La journée n'est pas terminée : provisional=true. Ne la compare jamais directement à une journée complète.
- Sommaire de caisse : ventes brutes, nettes et produit, transactions, facture moyenne, remboursements, annulations, réductions, dépôt attendu, dépôt réel, écart.
- « Rapidité de service », ligne TOTAL : « Temps moy. tous côtés » → speed.overall ; « FCFP » → speed.fcfp ; « RàP » → speed.rap, en secondes, unit="s". Tranches horaires publiées → speed.hotspots.
- « Coûts main-d'œuvre/heure », ligne TOTAUX : « Heures » → labour.hours ; « VPHT » → labour.salesPerLabourHour ; « TPEH » → labour.transactionsPerLabourHour. cost et costRate seulement s'ils sont affichés en chiffres (--- = null). Lignes horaires → peakSales et staffingSignals, seulement si le signal est vérifiable.
- Les temps de rapidité sont publiés environ 7,5 minutes après chaque intervalle de 15 minutes. S'ils manquent, fais une seule nouvelle tentative, puis laisse null avec la note « Dernier intervalle publié : HH:MM. ».
- **Interdit** : mettre une valeur d'une autre journée dans clearview.sales, labour, speed, peakSales ou staffingSignals. Le site rejette automatiquement tout temps de service dont la date n'est pas celle du jour.
- Dernière journée complète : si elle est utile au résumé, mets-la uniquement dans restaurantDashboard.lastCompleteDay (date + chiffres), jamais dans clearview. Toute mention dans le résumé doit indiquer sa date.
- Répartition par point de paiement → channels. Messages ou indisponibilités système pertinents → note.

**Comparaison avec l'an passé : MÊME JOUR DE SEMAINE**
- Date de comparaison = date du jour moins 364 jours. Exemple : jeudi 2026-09-24 → jeudi 2025-09-25. Jamais la même date civile (2025-09-24 était un mercredi).
- Ouvre dans Clearview le rapport de cette date exacte, une fois par jour, et réutilise ce même bloc aux passages suivants de la journée. Mets-le dans clearview.sameDayLastYear : {"date":"AAAA-MM-JJ", "sales":{…}, "labour":{…}, "speed":{…}}, avec uniquement les valeurs réellement lues.
- Si Clearview ne permet pas d'ouvrir cette date, omets le bloc. Le site refuse toute autre date.

**McHire, ST-JOVITE 22028** : nouveaux candidats, entrevues, embauches, actions requises. Aucune modification, aucun message.

**McD Connect/Blink** : dans Discussions, nouvelles réponses individuelles au scrutin actif de l'employé du mois envoyé par Romuald. Le candidat est obligatoire, les adjectifs facultatifs. Aucun message.

## 4. Analyse
- Pour chaque indicateur : tone=positive seulement si un objectif, une comparaison valide ou une tendance le démontre ; negative si un écart défavorable est démontré ; sinon neutral.
- explanation : le fait vérifié, en langage clair, distingué de la cause (hypothèse tant qu'elle n'est pas prouvée).
- solution : une action concrète. Pour chercher la cause, vérifie le volume, le positionnement, la formation, les ressources, les absences, les tâches concurrentes et la motivation. Ajoute measure si l'action doit être suivie.
- Ne déduis jamais une cause d'une seule heure ou d'une seule journée. Un bon score global ne masque pas un signal faible grave, et un avis isolé n'est pas une tendance.
- Croise Medallia et Clearview : un executiveSummary (cap du moment) et 3 à 5 priorités au maximum.

## 5. Format JSON (strictement valide)
Racine : {"schemaVersion":1, "date":"AAAA-MM-JJ", "generatedAt":"ISO-8601 avec fuseau", "status":"complete|partial|action_required", "headline":"", "mail":{}, "medallia":{}, "mchire":{}, "employeeOfMonth":{}, "restaurantDashboard":{}, "sources":[]}.

restaurantDashboard : asOf, provisional, lastCompleteDate, lastCompleteDay (facultatif), executiveSummary, medallia {status, checkedAt, lastSuccessfulCollection, periodLabel, responseCount, rawRecordCount, metrics[{label, value, unit, delta, comparison, caution, tone, explanation, solution}], distribution{top, middle, low}, weekly[{label, value, count}], strengths[], themeSignals[{label, count, tone, explanation, solution}], scopeNote, complaints[{date, level, title, detail}]}, clearview {status, checkedAt, lastSuccessfulCollection, date, provisional, sales{gross, net, product, guestCount, averageCheck, refundCount, refundAmount, voidCount, voidAmount, discountCount, discountAmount, explanation, solution}, cash{expectedDeposit, actualDeposit, variance, tone, explanation, solution}, channels[{label, amount, share}], labour{hours, salesPerLabourHour, transactionsPerLabourHour, cost, costRate, note, explanation, solution}, speed{overall, fcfp, rap, unit, hotspots[{time, sales, overall, fcfp, rap, note, tone, explanation, solution}]}, peakSales[{time, sales, share, labourHours, salesPerLabourHour}], staffingSignals[{time, title, detail, solution}], sameDayLastYear{date, sales, labour, speed}}, priorities[{level, title, evidence, action, measure}].

Tous les nombres sont des nombres JSON, null si absents.

## 6. Enregistrement
- Enregistre le JSON complet avec le plugin « St-Jovite Dashboard », outil t6881_st_jovite_enregistrer_le_briefing_quotidien (scénario Make 9845975) : date, generatedAt, status et payload (la chaîne JSON complète). Utilise l'outil réellement exposé par le plugin.
- Enregistre après les cinq tentatives, même si le statut est partial, pour livrer les sources réussies.
- Vérifie saved=true. En cas d'erreur transitoire, fais une seule nouvelle tentative avec exactement le même payload et le même generatedAt. Si elle échoue encore, signale l'échec.
- Ne remplace jamais une collecte plus récente par une plus ancienne.

## 7. Fin d'exécution
- saved=true et aucune source en reauth_required : termine par ::SKIP_COMPLETION::.
- Préviens Romuald seulement si une source PASSE à reauth_required (pas à chaque heure si elle y était déjà), si l'enregistrement échoue, ou si un risque critique nouveau exige son attention. Dans ce cas, indique uniquement quelle source reconnecter et comment, sans détail privé.
