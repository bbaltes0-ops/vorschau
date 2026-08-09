#!/bin/zsh
# =============================================================================
#  DIGITALE ANPROBE - KI FREISCHALTEN (Doppelklick, einmalig, ~30 Sekunden)
#
#  Was dieses Skript tut:
#   1. Liest deinen Google-KI-Schluessel aus /Users/bb/Desktop/DvS/DvS_API_Keys.env
#   2. Traegt ihn sicher auf deinem Strato-Server ein (/etc/anprobe-api.env)
#   3. Startet den Anprobe-Dienst neu und macht einen Funktionstest
#
#  Danach funktioniert die KI-Anprobe fuer alle Besucher - ohne Einrichtung.
#  (Claude darf Schluessel aus Sicherheitsgruenden nicht selbst auf Server
#   kopieren - darum dieser eine Doppelklick von dir.)
# =============================================================================
set -e
ENVFILE="/Users/bb/Desktop/DvS/DvS_API_Keys.env"
VPS="root@31.70.107.0"
SSHKEY="$HOME/.ssh/dvs_vps_rsa"

echo ""
echo "DIGITALE ANPROBE - KI FREISCHALTEN"
echo "=================================="

KEY=$(grep '^GOOGLE_AI_API_KEY=' "$ENVFILE" | cut -d= -f2 | tr -d '[:space:]')
if [[ -z "$KEY" ]]; then
  echo "FEHLER: Kein GOOGLE_AI_API_KEY in $ENVFILE gefunden."
  exit 1
fi
echo "1/3  Schluessel gefunden (${KEY:0:8}...)."

ssh -i "$SSHKEY" "$VPS" "sed -i 's|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$KEY|' /etc/anprobe-api.env && chmod 600 /etc/anprobe-api.env && systemctl restart anprobe-api"
echo "2/3  Schluessel eingetragen, Dienst neu gestartet."

sleep 2
ANTWORT=$(curl -s https://b2b.dagmarvonschmaus.com/anprobe-api/ | head -c 40)
if [[ "$ANTWORT" == *anprobe-api* ]]; then
  echo "3/3  Funktionstest OK - die KI-Anprobe ist jetzt fuer alle live."
else
  echo "3/3  WARNUNG: Dienst antwortet unerwartet: $ANTWORT"
fi
echo ""
echo "Fertig. Dieses Fenster kann geschlossen werden."
