# BullProsperity Trade Result Integration

## Ablauf

`MetaTrader -> /api/trade-result -> Supabase RPC -> trade_results + notifications -> Discord`

Die Route akzeptiert ausschließlich `POST`. Jeder externe MetaTrader-Request benötigt das in Vercel hinterlegte `TRADE_RESULT_SECRET`.

## Vercel

Neue Environment Variable für Production und Preview anlegen:

```text
TRADE_RESULT_SECRET=<langer zufälliger Wert>
```

Erzeugen:

```bash
openssl rand -hex 32
```

Danach ein neues Vercel Deployment auslösen.

## Supabase

`supabase-trade-results.sql` einmal vollständig im Supabase SQL Editor ausführen.

Die Migration:

- ergänzt das erwartete `trade_results`-Schema,
- verhindert doppelte `source_trade_id`-Werte,
- erzeugt Hub-Notifications atomar mit dem Trade,
- erlaubt keine öffentlichen Schreibzugriffe,
- erlaubt nur das Lesen aktiver Notifications.

## Request

Endpoint:

```text
POST https://bullprosperity.online/api/trade-result
```

Header:

```text
Content-Type: application/json
X-BullProsperity-Token: <TRADE_RESULT_SECRET>
```

Body:

```json
{
  "sourceTradeId": "MT5-123456",
  "memberEmail": "member@example.com",
  "accountId": "778899",
  "symbol": "XAUUSD",
  "direction": "buy",
  "volume": 0.1,
  "entryPrice": 2350.5,
  "exitPrice": 2355.5,
  "stopLoss": 2347,
  "takeProfit": 2357,
  "profit": 50,
  "currency": "USD",
  "openedAt": "2026-06-23T08:00:00Z",
  "closedAt": "2026-06-23T08:45:00Z"
}
```

`sourceTradeId` muss pro Trade eindeutig sein. In MetaTrader sollte dafür die Ticket-ID verwendet werden.

## Erwartete Antworten

- `201`: Trade, Notification und optional Discord-Nachricht neu erzeugt.
- `200`: Diese Trade-ID wurde bereits verarbeitet; kein Duplikat erzeugt.
- `400`: Payload unvollständig oder ungültig.
- `401`: Integration-Secret fehlt oder ist falsch.
- `405`: Andere Methode als POST.
- `502`: Supabase-Migration fehlt oder Supabase ist nicht erreichbar.

## Sicherer Test

Keine echten Secrets in Terminal-History oder Screenshots veröffentlichen. Für einen manuellen Test das Secret lokal als Umgebungsvariable setzen:

```bash
curl -i -X POST "https://bullprosperity.online/api/trade-result" \
  -H "Content-Type: application/json" \
  -H "X-BullProsperity-Token: $TRADE_RESULT_SECRET" \
  --data '{"sourceTradeId":"TEST-001","memberEmail":"member@example.com","symbol":"XAUUSD","direction":"buy","profit":0,"currency":"USD"}'
```
