#!/bin/bash
# Validate candidate lifecycle transitions and timeline events via API.

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "python3 is required to run this script."
  exit 1
fi

request() {
  local method="$1"
  local path="$2"
  local payload="${3:-}"
  local response
  if [[ -n "$payload" ]]; then
    response=$(curl -s -X "$method" "$BASE_URL$path" -H "Content-Type: application/json" -d "$payload" -w "\n%{http_code}")
  else
    response=$(curl -s -X "$method" "$BASE_URL$path" -w "\n%{http_code}")
  fi
  echo "$response"
}

expect_status() {
  local label="$1"
  local response="$2"
  local expected="$3"
  local status
  status=$(echo "$response" | tail -n1)
  if [[ "$status" == "$expected" ]]; then
    echo "PASS: $label ($status)"
  else
    echo "FAIL: $label (expected $expected, got $status)"
    echo "Response body:"
    echo "$response" | sed '$d'
  fi
}

get_candidate_id() {
  local name="$1"
  local payload
  payload=$(curl -s "$BASE_URL/api/candidates")
  if [[ -z "$payload" ]]; then
    return
  fi
  printf '%s' "$payload" | "$PYTHON_BIN" -c 'import json,sys
name=sys.argv[1]
data=json.load(sys.stdin)
for c in data:
    if c.get("name")==name:
        print(c.get("id"))
        break
' "$name"
}

get_latest_event_type() {
  local candidate_id="$1"
  local payload
  payload=$(curl -s "$BASE_URL/api/candidates/$candidate_id/timeline")
  if [[ -z "$payload" ]]; then
    return
  fi
  printf '%s' "$payload" | "$PYTHON_BIN" -c 'import json,sys
data=json.load(sys.stdin)
if data:
    print(data[0].get("eventType",""))
'
}

echo "Fetching candidate IDs..."
sara_id=$(get_candidate_id "Sara")
emma_id=$(get_candidate_id "Emma")
tom_id=$(get_candidate_id "Tom")
mingkai_id=$(get_candidate_id "Mingkai")
nina_id=$(get_candidate_id "Nina")

if [[ -z "$sara_id" || -z "$emma_id" || -z "$tom_id" || -z "$mingkai_id" || -z "$nina_id" ]]; then
  echo "Failed to resolve candidate IDs. Ensure seed data is loaded."
  exit 1
fi

echo "Scenario 1: Emma -> TRAINING without batch (should fail)"
resp=$(request POST "/api/candidates/$emma_id/transition" '{"toStage":"TRAINING","reason":"test"}')
expect_status "Emma TRAINING without batch" "$resp" "400"

echo "Scenario 2: Nina -> MARKETING without resumeReady (should fail)"
resp=$(request POST "/api/candidates/$nina_id/transition" '{"toStage":"MARKETING","reason":"test"}')
expect_status "Nina MARKETING without resumeReady" "$resp" "400"

echo "Scenario 3: Tom reactivation without reason (should fail)"
resp=$(request POST "/api/candidates/$tom_id/transition" '{"toStage":"SOURCING"}')
expect_status "Tom reactivation without reason" "$resp" "400"

echo "Scenario 4: Tom reactivation with reason (should pass)"
resp=$(request POST "/api/candidates/$tom_id/transition" '{"toStage":"SOURCING","reactivateReason":"Back in market","reason":"Reactivated"}')
expect_status "Tom reactivation with reason" "$resp" "200"
echo "Latest timeline event: $(get_latest_event_type "$tom_id")"

echo "Scenario 5: Emma -> ON_HOLD missing fields (should fail)"
resp=$(request POST "/api/candidates/$emma_id/transition" '{"toStage":"ON_HOLD"}')
expect_status "Emma ON_HOLD missing fields" "$resp" "400"

echo "Scenario 6: Emma -> ON_HOLD with fields (should pass)"
resp=$(request POST "/api/candidates/$emma_id/transition" '{"toStage":"ON_HOLD","holdReason":"Awaiting docs","nextFollowUpAt":"2026-01-15T00:00:00","reason":"Hold"}')
expect_status "Emma ON_HOLD with fields" "$resp" "200"
echo "Latest timeline event: $(get_latest_event_type "$emma_id")"

echo "Scenario 7: Mingkai MARKETING -> INTERVIEWING -> OFFERED"
resp=$(request POST "/api/candidates/$mingkai_id/transition" '{"toStage":"INTERVIEWING","reason":"Start interviews"}')
expect_status "Mingkai INTERVIEWING" "$resp" "200"
resp=$(request POST "/api/candidates/$mingkai_id/transition" '{"toStage":"OFFERED","reason":"Offer received","offerDate":"2026-02-01"}')
expect_status "Mingkai OFFERED" "$resp" "200"

echo "Scenario 8: Mingkai -> PLACED missing startDate (should fail)"
resp=$(request POST "/api/candidates/$mingkai_id/transition" '{"toStage":"PLACED","reason":"Placed"}')
expect_status "Mingkai PLACED missing startDate" "$resp" "400"

echo "Scenario 9: Mingkai -> PLACED with startDate (should pass)"
resp=$(request POST "/api/candidates/$mingkai_id/transition" '{"toStage":"PLACED","startDate":"2026-03-01","reason":"Placed"}')
expect_status "Mingkai PLACED with startDate" "$resp" "200"
echo "Latest timeline event: $(get_latest_event_type "$mingkai_id")"

echo "Validation complete."
