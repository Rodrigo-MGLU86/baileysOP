# @neelify/baileys

Neelify-Variante von Baileys als WhatsApp-Web-Basis fuer Node.js.

> Hinweis: Dieses Projekt ist nicht offiziell mit WhatsApp, Meta oder Baileys-Upstream verbunden.

## Highlights

- Multi-Device WhatsApp Web API auf Node.js
- Event-basierter Socket-Ansatz fuer Bots und Automatisierung
- QR-Login mit Branding-Header und Branding-Footer
- Dynamische Versionsanzeige fuer Paket/Wrapper beim QR-Flow
- Update-Pruefung (npm zuerst, GitHub-Fallback) mit semver-Vergleich

## Kompatibilitaet

| Paket | Empfohlene Version |
| --- | --- |
| `@neelify/baileys` | `2.2.9` |
| `@neelify/wa-api` | `1.7.7` |
| `@neelify/libsignal` | `1.0.21` |

## Installation

```bash
npm install @neelify/baileys @neelify/libsignal
```

## Quickstart

```ts
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers
} from '@neelify/baileys'

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    auth: state,
    version,
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('Verbunden')
      return
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const isLoggedOut = statusCode === DisconnectReason.loggedOut
      if (!isLoggedOut) {
        start().catch(console.error)
      }
    }
  })
}

start().catch(console.error)
```

## Migration und Namespace

Wenn du vom Upstream kommst, nutze den Import-Scope von Neelify:

```diff
- import makeWASocket from '@whiskeysockets/baileys'
+ import makeWASocket from '@neelify/baileys'
```

## QR-Branding und Versionsanzeige

Beim QR-Scan werden automatisch Markenzeilen oberhalb und unterhalb des QR-Codes ausgegeben.
Die Anzeige liest Versionen dynamisch aus `package.json` und zeigt bei Bedarf einen kompakten Update-Hinweis an.

## Update-Check

- Pruefquelle 1: npm Registry (`registry.npmjs.org`)
- Pruefquelle 2: GitHub Releases (`neelify/baileys`) als Fallback
- Fehler/Timeouts werden abgefangen, ohne den Prozess zu stoppen
- Semver-Vergleich wird numerisch ausgewertet

## Was ausgebessert wurde

- Veraltete und inkonsistente Texte in der README wurden entfernt.
- Uneinheitliche Bezeichnungen wurden auf den Scope `@neelify/...` korrigiert.
- Defekte bzw. veraltete Install-/Import-Hinweise wurden bereinigt.

## Was veraendert wurde

- README auf eine klare, technische Struktur mit Kompatibilitaet, Installation und Quickstart umgestellt.
- Migration auf den Neelify-Namespace explizit dokumentiert.
- Hinweis zur fehlenden offiziellen WhatsApp-Zuordnung klar und sichtbar aufgenommen.

## Was neu ist

- Zentrales QR-Branding mit Header/Footer direkt im QR-Ausgabepfad.
- Dynamische Versionsanzeige fuer `@neelify/baileys` und erkannte Wrapper-Kontexte.
- Robuste Update-Pruefung mit npm-Prioritaet und GitHub-Fallback.
