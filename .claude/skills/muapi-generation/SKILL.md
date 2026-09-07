---
name: muapi-generation
description: Genere des images et des videos IA (texte-vers-image, image-vers-image, texte-vers-video, image-vers-video, video-vers-video, lip-sync, audio) via l'API MuAPI.ai. A utiliser quand Romuald demande de generer, creer ou faire une image/video avec l'IA, puisque Claude n'a pas de generation d'image/video native. Necessite une cle API MuAPI (MUAPI_API_KEY) - service payant a la generation.
---

# Generation IA via MuAPI

Cette skill vient de l'exploration du repo `Anil-matcha/Open-Generative-AI` (interface web qui encapsule l'API MuAPI). Plutot que de deployer leur appli, cette skill appelle directement l'API MuAPI depuis un script Python autonome — pas de dependance a leur code.

## Prerequis

- Variable d'environnement `MUAPI_API_KEY` (cle obtenue sur https://muapi.ai, compte + credits payants).
- Si la variable n'est pas definie, dis-le clairement a Romuald et arrete-toi — ne jamais inventer ou reutiliser une cle trouvee ailleurs.
- **Service payant** : chaque generation consomme des credits. Avant de lancer une generation couteuse (video, plusieurs images), confirme avec Romuald le modele et le nombre de generations si le contexte ne le rend pas evident.

## Workflow

1. **Trouver un modele** (si l'ID exact n'est pas connu) :
   ```bash
   python3 scripts/generate.py search "<mot-cle>" [--category t2i|t2v|i2i|i2v|v2v|lipsync|recast|audio]
   ```
   Catalogue local dans `reference/models.json` (535 modeles, synchronise depuis le repo source le 2026-09-07 — peut se desynchroniser avec le temps, MuAPI ajoute des modeles regulierement).

2. **Uploader un fichier local** (si l'image/video/audio de reference n'est pas deja en ligne) :
   ```bash
   python3 scripts/generate.py upload /chemin/vers/fichier.jpg
   ```
   Retourne une URL hebergee a reutiliser dans `run`.

3. **Lancer la generation** :
   ```bash
   # Texte -> image
   python3 scripts/generate.py run --category t2i --model nano-banana-pro \
       --prompt "..." --aspect-ratio 16:9 --output resultat.png

   # Texte -> video
   python3 scripts/generate.py run --category t2v --model <id> \
       --prompt "..." --duration 5 --output resultat.mp4

   # Image -> video (image de depart)
   python3 scripts/generate.py run --category i2v --model <id> \
       --image-url <url> --prompt "..." --output resultat.mp4

   # Video -> video, lip-sync, audio: memes options (--video-url, --audio-url, --image-url selon le modele)
   ```
   Le script soumet la tache, poll `/api/v1/predictions/{id}/result` jusqu'au resultat (jusqu'a ~30 min pour une video), affiche l'URL du resultat sur stdout et le telecharge si `--output` est fourni.

## Notes importantes

- Les champs acceptes varient par modele (`image_url` vs `images_list`, presence ou non de `prompt`, `resolution`, `duration`...). Le script lit `reference/models.json` pour resoudre le bon `endpoint` et le bon champ image (`imageField`), mais ne connait pas exhaustivement tous les champs optionnels de chaque modele. En cas d'erreur 400 de l'API, le message d'erreur brut de MuAPI est affiche — l'utiliser pour ajuster les parametres.
- `reference/models.json` est un instantane extrait du repo `Anil-matcha/Open-Generative-AI` (fichier `packages/studio/src/models.js`). Il peut devenir obsolete. Si un modele recent n'y figure pas, tenter directement `--model <id-connu>` avec `--category` correspondant (le script utilise l'ID comme endpoint si le modele n'est pas dans le catalogue).
- Ne jamais commiter de cle API ou de fichiers generes contenant des donnees sensibles dans ce depot.
