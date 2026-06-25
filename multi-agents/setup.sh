#!/bin/bash
# Crée les sous-agents, l'environnement, puis le coordinateur avec le bon
# roster multiagent. Les IDs sont sauvegardés dans .env.agents pour
# réutilisation par run_multiagent.py.
set -euo pipefail
cd "$(dirname "$0")"

echo "Création de l'agent Recherche..."
AGENT_RECHERCHE=$(ant beta:agents create --file recherche.agent.yaml --output-id)

echo "Création de l'agent Analyse..."
AGENT_ANALYSE=$(ant beta:agents create --file analyse.agent.yaml --output-id)

echo "Création de l'agent Synthèse..."
AGENT_SYNTHESE=$(ant beta:agents create --file synthese.agent.yaml --output-id)

echo "Création de l'environnement..."
ENVIRONMENT_ID=$(ant beta:environments create --file environment.yaml --output-id)

echo "Génération du coordinateur avec le roster multiagent..."
cat coordinator.agent.yaml > coordinator.resolved.yaml
cat >> coordinator.resolved.yaml <<EOF
multiagent:
  type: coordinator
  agents:
    - ${AGENT_RECHERCHE}
    - ${AGENT_ANALYSE}
    - ${AGENT_SYNTHESE}
EOF

echo "Création de l'agent Coordinateur..."
AGENT_COORDINATEUR=$(ant beta:agents create --file coordinator.resolved.yaml --output-id)

cat > .env.agents <<EOF
AGENT_RECHERCHE=${AGENT_RECHERCHE}
AGENT_ANALYSE=${AGENT_ANALYSE}
AGENT_SYNTHESE=${AGENT_SYNTHESE}
AGENT_COORDINATEUR=${AGENT_COORDINATEUR}
ENVIRONMENT_ID=${ENVIRONMENT_ID}
EOF

echo "Terminé. IDs enregistrés dans .env.agents"
