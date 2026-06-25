"""Lance une tâche sur le système multi-agents Coordinateur/Recherche/Analyse/Synthèse.

Prérequis : exécuter setup.sh une fois pour créer les agents et générer
.env.agents avec les IDs nécessaires.
"""
import os
import time

from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv(".env.agents")

BETA = "managed-agents-2026-04-01"
OUTPUT_DIR = "outputs"

client = Anthropic()


def run_multiagent_session(tache: str) -> str:
    session = client.beta.sessions.create(
        agent_id=os.environ["AGENT_COORDINATEUR"],
        environment_id=os.environ["ENVIRONMENT_ID"],
        betas=[BETA],
    )

    # Smoke test : confirme que le coordinateur et les sous-agents répondent
    # avant d'envoyer la vraie tâche (évite de découvrir un agent mal
    # configuré après plusieurs minutes de traitement).
    _send_and_stream(session.id, "Réponds simplement 'pret' si tu es opérationnel.")

    _send_and_stream(session.id, tache)

    rapport_path = _download_outputs(session.id)

    client.beta.sessions.archive(session_id=session.id, betas=[BETA])

    return rapport_path


def _send_and_stream(session_id: str, message: str) -> None:
    client.beta.sessions.events.send(
        session_id=session_id,
        betas=[BETA],
        event={"type": "user.message", "content": message},
    )
    for event in client.beta.sessions.events.stream(session_id=session_id, betas=[BETA]):
        _handle_event(event, client, session_id)
        if event.type in ("session.status_idle", "session.status_terminated"):
            if event.type == "session.status_idle" and getattr(event, "requires_action", False):
                continue
            break


def _handle_event(event, client: Anthropic, session_id: str) -> None:
    if event.type == "session.thread_created":
        print(f"[thread créé] {event.thread_id}")
    elif event.type in ("session.thread_status_running", "session.thread_status_idle"):
        print(f"[thread {event.thread_id}] {event.type}")
    elif event.type == "agent.message":
        print(f"[coordinateur] {event.content}")
    elif event.type == "agent.thread_message_sent":
        print(f"[délégation -> {event.thread_id}] {event.content[:200]}")
    elif event.type == "agent.thread_message_received":
        print(f"[résultat <- {event.thread_id}] {event.content[:200]}")
    elif event.type == "agent.custom_tool_use":
        result = _execute_custom_tool(event.tool_name, event.input)
        client.beta.sessions.events.send(
            session_id=session_id,
            betas=[BETA],
            event={
                "type": "user.custom_tool_result",
                "tool_use_id": event.tool_use_id,
                "content": result,
            },
        )
    elif event.type == "session.error":
        print(f"[erreur] {event.error}")


def _execute_custom_tool(name: str, input_data: dict) -> str:
    return f"Outil personnalisé '{name}' non implémenté."


def _download_outputs(session_id: str, retries: int = 3, delay: float = 2.0) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    rapport_path = ""
    for attempt in range(retries):
        files = client.beta.files.list(scope_id=session_id, betas=[BETA])
        targets = [f for f in files.data if f.filename.endswith((".md", ".txt"))]
        if targets:
            for f in targets:
                local_path = os.path.join(OUTPUT_DIR, f.filename)
                content = client.beta.files.download(f.id)
                with open(local_path, "wb") as fh:
                    fh.write(content)
                if f.filename == "rapport.md":
                    rapport_path = local_path
            break
        if attempt < retries - 1:
            time.sleep(delay)
    return rapport_path


if __name__ == "__main__":
    tache_exemple = (
        "Analyse le marché de l'IA générative en 2025 : fais une recherche web "
        "sur les principaux acteurs et tendances, analyse les chiffres clés "
        "trouvés, puis rédige un rapport de synthèse structuré dans "
        "/mnt/session/outputs/rapport.md."
    )
    chemin = run_multiagent_session(tache_exemple)
    print(f"\nRapport final disponible : {chemin}")
