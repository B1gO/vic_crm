# Discord Integration Design (Decoupled)

## Goals
- Send a Discord message to a configured channel group when a Candidate is created.
- Keep Discord-specific details isolated behind a clean interface so future bot features can be added without touching core domain logic.
- Provide reliability (retries, dedupe, rate limiting) and clear extension points.

## Non-Goals (for now)
- Real-time gateway events or interactive slash commands.
- Complex workflow orchestration.

## High-Level Architecture
Use a layered, event-driven integration design to decouple core domain logic from Discord delivery.

```
[CandidateService] --(Domain Event: CandidateCreated)--> [Outbox]
     |                                                   |
     |                                          [Outbox Dispatcher]
     |                                                   |
     |                                        [Notification Publisher]
     |                                                   |
     |                                    [Discord Adapter (Client)]
     |                                                   |
     +-----------------------------------------------> Discord API
```

### Key Principles
- **Domain emits events, not notifications**: Domain only knows about `CandidateCreated`.
- **Outbox for reliability**: Ensure messages are not lost if the process crashes.
- **Publisher + Adapter pattern**: Swap Discord implementation without changing domain or event pipeline.
- **Channel group indirection**: Business rules map events to channel groups, not specific channel IDs.

## Modules and Responsibilities
- **Domain event**: `CandidateCreated` (contains candidate id + summary fields).
- **Outbox**: Persistent event table for reliable delivery.
- **Dispatcher**: Reads outbox rows, invokes notification publisher, updates status.
- **Notification publisher**: Event-to-notification routing and formatting.
- **Discord adapter**: Low-level REST calls to Discord API.

### Suggested Package Structure (backend)
```
backend/src/main/java/com/vic/crm/
  events/
    CandidateCreatedEvent.java
  notifications/
    NotificationPublisher.java
    NotificationRuleService.java
    NotificationTemplateService.java
  integrations/discord/
    DiscordClient.java
    DiscordMessageFormatter.java
    DiscordNotificationSender.java
  outbox/
    OutboxEvent.java
    OutboxRepository.java
    OutboxDispatcher.java
```

## Data Model (Minimal)
- `outbox_event`
  - id (uuid)
  - event_type (string)
  - payload (json)
  - status (PENDING, SENT, FAILED)
  - attempt_count (int)
  - next_attempt_at (timestamp)
  - created_at (timestamp)

- `notification_channel`
  - id (uuid)
  - channel_group (string) // e.g. "candidates"
  - provider (string) // "discord"
  - external_id (string) // Discord channel id
  - enabled (boolean)

- `notification_rule`
  - id (uuid)
  - event_type (string) // "CandidateCreated"
  - channel_group (string)
  - enabled (boolean)

This allows routing by event type to a channel group that can contain multiple Discord channel IDs.

## Message Format (Minimal)
Example for CandidateCreated:
```
New Candidate
Name: {fullName}
Role: {role}
Location: {location}
Source: {source}
Candidate ID: {candidateId}
```

Keep formatting in a dedicated formatter class so it can evolve for future features.

## Integration Steps (Detailed)

### 1) Create Discord App and Bot
1. Create an application in Discord Developer Portal.
2. Add a Bot user to the app.
3. Copy the bot token (keep it secret).
4. Invite the bot to your server with `Send Messages`, `Read Message History` permissions.
5. Enable any required intents (not required for simple REST sends).

### 2) Identify Channel IDs and Define Channel Groups
1. Enable Developer Mode in Discord.
2. Right-click a channel and copy ID.
3. Decide a channel group name, e.g. `candidates`.
4. Store the mapping in `notification_channel`.

### 3) Add Configuration
Add to `backend/src/main/resources/application.properties`:
```
# Discord
integrations.discord.enabled=true
integrations.discord.botToken=${DISCORD_BOT_TOKEN}
integrations.discord.baseUrl=https://discord.com/api
integrations.discord.rateLimitPerSecond=1
```
Set `DISCORD_BOT_TOKEN` in your environment.

### 4) Emit Domain Event on Candidate Creation
In Candidate creation service:
- After saving candidate, emit `CandidateCreatedEvent` (id + summary fields).
- Persist it into `outbox_event` in the same transaction.

### 5) Outbox Dispatcher
- Scheduled job (e.g., every 5 seconds).
- Pull PENDING events with `next_attempt_at <= now`.
- Call `NotificationPublisher`.
- Update status to SENT or FAILED (with retry backoff).

### 6) Notification Publisher
- Map event type to channel group via `notification_rule`.
- Load channel IDs via `notification_channel`.
- Format message via `NotificationTemplateService`.
- For each channel, call provider sender (Discord adapter).

### 7) Discord Adapter
- Use REST API: `POST /channels/{channelId}/messages`
- Authorization header: `Bot <token>`
- JSON body: `{ "content": "..." }`
- Handle rate limits (respect `429` response).

### 8) Observability
- Log one line per send attempt with event id, channel id, result.
- Metrics (optional): send success/failure counts.

## Minimal Candidate Flow (End-to-End)
1. Candidate created in backend.
2. `CandidateCreatedEvent` is stored in `outbox_event`.
3. Dispatcher picks event.
4. NotificationPublisher routes to channel group `candidates`.
5. Discord adapter posts to all channels in that group.

## Decoupling Rationale
- **Domain does not depend on Discord**: it only emits events.
- **Publisher isolates routing**: channel group can be retargeted without code changes.
- **Adapter isolates provider**: add Slack, email, etc. later with the same interface.
- **Outbox isolates reliability**: safe retries and consistent delivery.

## Extension Points for Future Features
- Add new event types and rules without touching core domain logic.
- Add Discord features like embeds, buttons, or threads by expanding the formatter and adapter only.
- Add multi-provider support by creating more adapters that share the same publisher interface.

## Testing Strategy
- Unit tests for `NotificationTemplateService` and Discord message formatting.
- Integration tests for Outbox Dispatcher with H2.
- Mock Discord API for adapter tests.

## Rollout Checklist
- [ ] Discord bot added to server and channel IDs recorded.
- [ ] Env var `DISCORD_BOT_TOKEN` configured.
- [ ] `notification_rule` and `notification_channel` seeded for candidates.
- [ ] Candidate creation triggers a message to the channel group.
