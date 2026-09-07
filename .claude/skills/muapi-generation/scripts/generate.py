#!/usr/bin/env python3
"""CLI pour generer images/videos/audio via l'API MuAPI.ai.

Sous-commandes:
    search <mot-cle>          Cherche un modele dans le catalogue local (reference/models.json)
    upload <fichier-local>    Upload un fichier local et retourne son URL hebergee (requis
                               avant de passer image_url/video_url/audio_url a `run` pour un
                               fichier qui n'est pas deja accessible par URL publique)
    run                       Lance une generation (soumission + polling jusqu'au resultat)

Necessite la variable d'environnement MUAPI_API_KEY (cle obtenue sur https://muapi.ai).

Exemples:
    python3 generate.py search "flux"
    python3 generate.py run --category t2i --model nano-banana --prompt "un chat astronaute" \
        --aspect-ratio 1:1 --output chat.png
    python3 generate.py upload /chemin/vers/photo.jpg
    python3 generate.py run --category i2v --model <id> --image-url <url-hebergee> \
        --prompt "la camera recule lentement" --output clip.mp4
"""
import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

BASE_URL = "https://api.muapi.ai"
REFERENCE_PATH = Path(__file__).resolve().parent.parent / "reference" / "models.json"

CATEGORY_KEYS = {
    "t2i": "t2iModels",
    "t2v": "t2vModels",
    "i2i": "i2iModels",
    "i2v": "i2vModels",
    "v2v": "v2vModels",
    "lipsync": "lipsyncModels",
    "recast": "recastModels",
    "audio": "audioModels",
}


def get_api_key() -> str:
    key = os.environ.get("MUAPI_API_KEY")
    if not key:
        print(
            "Erreur: variable d'environnement MUAPI_API_KEY manquante. "
            "Obtiens une cle sur https://muapi.ai puis exporte-la.",
            file=sys.stderr,
        )
        sys.exit(1)
    return key


def load_catalog() -> dict:
    with open(REFERENCE_PATH, encoding="utf-8") as f:
        return json.load(f)


def http_request(url: str, method: str = "GET", headers: dict | None = None, body: bytes | None = None):
    req = urllib.request.Request(url, data=body, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def cmd_search(args):
    catalog = load_catalog()
    needle = args.keyword.lower()
    categories = [args.category] if args.category else list(CATEGORY_KEYS)
    found = 0
    for cat in categories:
        key = CATEGORY_KEYS[cat]
        for m in catalog.get(key, []):
            haystack = f"{m.get('id', '')} {m.get('name', '')} {m.get('provider', '')}".lower()
            if needle in haystack:
                print(f"[{cat}] id={m['id']!r} name={m.get('name')!r} endpoint={m.get('endpoint')!r} provider={m.get('provider')}")
                found += 1
    if not found:
        print(f"Aucun modele trouve pour {args.keyword!r}.", file=sys.stderr)
        sys.exit(1)


def cmd_upload(args):
    key = get_api_key()
    path = Path(args.file)
    if not path.exists():
        print(f"Fichier introuvable: {path}", file=sys.stderr)
        sys.exit(1)

    boundary = "----muapi-skill-boundary"
    filename = path.name
    content = path.read_bytes()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
    ).encode("utf-8") + content + f"\r\n--{boundary}--\r\n".encode("utf-8")

    headers = {
        "x-api-key": key,
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    }
    status, resp_body = http_request(f"{BASE_URL}/api/v1/upload_file", "POST", headers, body)
    if status >= 400:
        print(f"Echec de l'upload ({status}): {resp_body.decode('utf-8', 'replace')[:300]}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(resp_body)
    url = data.get("url") or data.get("file_url") or (data.get("data") or {}).get("url")
    if not url:
        print(f"Reponse d'upload inattendue: {data}", file=sys.stderr)
        sys.exit(1)
    print(url)


def resolve_endpoint(catalog: dict, category: str, model_id: str) -> tuple[str, dict]:
    key = CATEGORY_KEYS[category]
    for m in catalog.get(key, []):
        if m["id"] == model_id:
            return m.get("endpoint") or m["id"], m
    return model_id, {}


def poll_result(request_id: str, key: str, max_attempts: int, interval: float) -> dict:
    url = f"{BASE_URL}/api/v1/predictions/{request_id}/result"
    headers = {"Content-Type": "application/json", "x-api-key": key}
    for attempt in range(1, max_attempts + 1):
        time.sleep(interval)
        status, body = http_request(url, "GET", headers)
        if status >= 500:
            continue
        if status >= 400:
            raise RuntimeError(f"Poll echoue ({status}): {body.decode('utf-8', 'replace')[:300]}")
        result = json.loads(body)
        gen_status = str(result.get("status", "")).lower()
        if gen_status in {"completed", "succeeded", "success"}:
            return result
        if gen_status in {"failed", "error", "cancelled", "canceled"}:
            raise RuntimeError(f"Generation echouee: {result}")
        if attempt % 10 == 0:
            print(f"... toujours en cours ({gen_status or 'pending'}), tentative {attempt}/{max_attempts}", file=sys.stderr)
    raise RuntimeError(f"Timeout apres {max_attempts} tentatives (request_id={request_id})")


def cmd_run(args):
    key = get_api_key()
    catalog = load_catalog()
    endpoint, model_info = resolve_endpoint(catalog, args.category, args.model)

    payload = {}
    if args.prompt is not None:
        payload["prompt"] = args.prompt
    if args.aspect_ratio:
        payload["aspect_ratio"] = args.aspect_ratio
    if args.resolution:
        payload["resolution"] = args.resolution
    if args.quality:
        payload["quality"] = args.quality
    if args.duration is not None:
        payload["duration"] = args.duration
    if args.seed is not None:
        payload["seed"] = args.seed
    if args.mode:
        payload["mode"] = args.mode

    image_field = model_info.get("imageField") or "image_url"
    if args.image_url:
        if image_field == "images_list":
            payload["images_list"] = [args.image_url]
        else:
            payload[image_field] = args.image_url
        if args.category == "i2i" and args.strength is not None:
            payload["strength"] = args.strength

    last_image_field = model_info.get("lastImageField")
    if last_image_field and args.last_image_url:
        payload[last_image_field] = args.last_image_url

    video_field = model_info.get("videoField") or "video_url"
    if args.video_url:
        payload[video_field] = args.video_url

    if args.audio_url:
        payload["audio_url"] = args.audio_url

    url = f"{BASE_URL}/api/v1/{endpoint}"
    headers = {"Content-Type": "application/json", "x-api-key": key}
    body = json.dumps(payload).encode("utf-8")

    print(f"Soumission -> {url}", file=sys.stderr)
    print(f"Payload: {json.dumps(payload, ensure_ascii=False)}", file=sys.stderr)
    status, resp_body = http_request(url, "POST", headers, body)
    if status >= 400:
        print(f"Echec de la soumission ({status}): {resp_body.decode('utf-8', 'replace')[:500]}", file=sys.stderr)
        sys.exit(1)
    submit_data = json.loads(resp_body)
    request_id = submit_data.get("request_id") or submit_data.get("id")

    if not request_id:
        result = submit_data
    else:
        print(f"En attente du resultat (request_id={request_id})...", file=sys.stderr)
        max_attempts = 900 if args.category in {"t2v", "i2v", "v2v", "lipsync"} else 60
        result = poll_result(request_id, key, max_attempts, interval=2.0)

    output_url = None
    if isinstance(result.get("outputs"), list) and result["outputs"]:
        output_url = result["outputs"][0]
    output_url = output_url or result.get("url") or (result.get("output") or {}).get("url")

    if not output_url:
        print(f"Pas d'URL de resultat trouvee dans la reponse: {json.dumps(result, ensure_ascii=False)[:500]}", file=sys.stderr)
        sys.exit(1)

    print(output_url)

    if args.output:
        req = urllib.request.Request(output_url)
        with urllib.request.urlopen(req, timeout=300) as resp, open(args.output, "wb") as f:
            f.write(resp.read())
        print(f"Sauvegarde dans {args.output}", file=sys.stderr)


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_search = sub.add_parser("search", help="Chercher un modele dans le catalogue local")
    p_search.add_argument("keyword")
    p_search.add_argument("--category", choices=list(CATEGORY_KEYS))
    p_search.set_defaults(func=cmd_search)

    p_upload = sub.add_parser("upload", help="Uploader un fichier local vers MuAPI et obtenir son URL")
    p_upload.add_argument("file")
    p_upload.set_defaults(func=cmd_upload)

    p_run = sub.add_parser("run", help="Lancer une generation")
    p_run.add_argument("--category", required=True, choices=list(CATEGORY_KEYS))
    p_run.add_argument("--model", required=True, help="ID du modele (voir la sous-commande 'search')")
    p_run.add_argument("--prompt")
    p_run.add_argument("--image-url")
    p_run.add_argument("--last-image-url", help="Image de fin (modeles i2v qui supportent lastImageField)")
    p_run.add_argument("--video-url")
    p_run.add_argument("--audio-url")
    p_run.add_argument("--aspect-ratio")
    p_run.add_argument("--resolution")
    p_run.add_argument("--quality")
    p_run.add_argument("--duration", type=float)
    p_run.add_argument("--strength", type=float)
    p_run.add_argument("--seed", type=int)
    p_run.add_argument("--mode")
    p_run.add_argument("--output", help="Chemin local ou sauvegarder le resultat (image/video)")
    p_run.set_defaults(func=cmd_run)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
