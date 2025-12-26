#!/bin/bash
# VicCRM seed script with timeline events
# Assumes a clean database (auto-increment IDs start at 1)

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"

post_json() {
  local path="$1"
  local payload="$2"
  curl -s -X POST "$BASE_URL$path" \
    -H "Content-Type: application/json" \
    -d "$payload" > /dev/null
}

echo "Seeding VicCRM database with timeline events..."

# Users
post_json "/api/users" '{"name":"sravani","email":"s@vic.com","role":"RECRUITER"}'
post_json "/api/users" '{"name":"joey","email":"joey@vic.com","role":"TRAINER"}'
post_json "/api/users" '{"name":"crisp","email":"crisp@vic.com","role":"SUPPORTER"}'
post_json "/api/users" '{"name":"izzy","email":"izzy@vic.com","role":"RECRUITER"}'

# Batches
post_json "/api/batches" '{"name":"Java 202601","startDate":"2026-01-12","endDate":"2026-03-12"}'
post_json "/api/batches" '{"name":"React 202601","startDate":"2026-01-11","endDate":"2026-03-11"}'

# Clients
post_json "/api/clients" '{"companyName":"eBay","industry":"Technology"}'
post_json "/api/clients" '{"companyName":"Walmart","industry":"Technology"}'
post_json "/api/clients" '{"companyName":"Apple","industry":"Technology"}'
post_json "/api/clients" '{"companyName":"Paypal","industry":"Technology"}'
post_json "/api/clients" '{"companyName":"Intuit","industry":"Technology"}'

# Vendors
post_json "/api/vendors" '{
  "companyName":"Infobahn",
  "contactName":"ilex",
  "email":"ilex@gmail.com",
  "phone":"1234567890",
  "clients":[{"id":1},{"id":2},{"id":4},{"id":5}],
  "contacts":[
    {"name":"kachana","email":"k@gmail.com","phone":"742973230","linkedinUrl":"https://linkedin.com/in/kachana"},
    {"name":"monika","email":"monika@gmail.com","phone":"093807968","linkedinUrl":"https://linkedin.com/in/monika"}
  ]
}'

post_json "/api/vendors" '{
  "companyName":"bayone",
  "contactName":"richa",
  "email":"richa@gmail.com",
  "phone":"238208209810",
  "clients":[{"id":1},{"id":2},{"id":4}],
  "contacts":[
    {"name":"richa","email":"richa@gmail.com","phone":"1213242"}
  ]
}'

post_json "/api/vendors" '{
  "companyName":"inspyr",
  "contactName":"cole",
  "email":"cole@gmail.com",
  "phone":"323242374329",
  "clients":[{"id":3}],
  "contacts":[
    {"name":"Cole","email":"Cole@gmail.com","phone":"3129782974923","linkedinUrl":"https://linkedin.com/in/cole"}
  ]
}'

# Candidates (IDs assumed 1..6)
post_json "/api/candidates" '{
  "name":"Sara",
  "email":"Sara@gmail.com",
  "phone":"+1 (415) 555-0123",
  "wechatId":"sara_wechat",
  "wechatName":"Sara",
  "discordName":"sara#65605",
  "linkedinUrl":"https://linkedin.com/in/sara",
  "marketingLinkedinUrl":"https://linkedin.com/in/sara-dev",
  "workAuth":"OPT",
  "city":"San Francisco",
  "state":"CA",
  "school":"UC Berkeley",
  "major":"MS Computer Science",
  "relocation":true,
  "resumeReady":true,
  "notes":"Strong background in distributed systems. Previous intern at Google.",
  "stage":"RESUME",
  "subStatus":"RESUME_READY",
  "batch":{"id":1},
  "recruiter":{"id":1}
}'

post_json "/api/candidates" '{
  "name":"Zack",
  "email":"Zack@gmail.com",
  "phone":"+1 (512) 555-0456",
  "wechatId":"zack_tech",
  "wechatName":"Zack",
  "discordName":"zack#3434",
  "linkedinUrl":"https://linkedin.com/in/zack",
  "marketingLinkedinUrl":"https://linkedin.com/in/zack-dev",
  "workAuth":"CPT",
  "city":"Austin",
  "state":"TX",
  "school":"Colorado State University",
  "major":"BS Software Engineering",
  "relocation":false,
  "notes":"5 years experience in Java/Spring Boot. Looking for backend roles.",
  "stage":"SOURCING",
  "subStatus":"SCREENING_SCHEDULED",
  "batch":{"id":1},
  "recruiter":{"id":1}
}'

post_json "/api/candidates" '{
  "name":"Vincent",
  "email":"vincent@gmail.com",
  "phone":"+1 (404) 555-0789",
  "wechatId":"vincent_dev",
  "wechatName":"Vincent",
  "discordName":"vincent#23",
  "linkedinUrl":"https://linkedin.com/in/vincent",
  "marketingLinkedinUrl":"https://linkedin.com/in/vincent-dev",
  "workAuth":"OPT",
  "city":"Atlanta",
  "state":"GA",
  "school":"UCLA",
  "major":"MS Information Systems",
  "relocation":true,
  "notes":"Frontend specialist. Strong React/TypeScript skills. Previous experience at Meta.",
  "stage":"SOURCING",
  "subStatus":"SOURCED",
  "recruiter":{"id":1}
}'

post_json "/api/candidates" '{
  "name":"Mingkai",
  "email":"mingkai@gmail.com",
  "phone":"+1 (678) 555-0321",
  "wechatId":"mingkai_code",
  "wechatName":"Mingkai",
  "discordName":"mingkai#131",
  "linkedinUrl":"https://linkedin.com/in/mingkai",
  "marketingLinkedinUrl":"https://linkedin.com/in/mingkai-dev",
  "workAuth":"OPT",
  "city":"Atlanta",
  "state":"GA",
  "school":"UIUC",
  "major":"MS Computer Engineering",
  "relocation":true,
  "notes":"Full-stack developer. Focused on React and Node.js.",
  "stage":"MARKETING",
  "subStatus":"MARKETING_ACTIVE",
  "recruiter":{"id":4}
}'

post_json "/api/candidates" '{
  "name":"Emma",
  "email":"emma@gmail.com",
  "phone":"+1 (312) 555-0111",
  "wechatName":"Emma",
  "workAuth":"H1B",
  "city":"Chicago",
  "state":"IL",
  "school":"Northwestern",
  "major":"MS Data Science",
  "notes":"Just contacted via LinkedIn. Strong ML background.",
  "stage":"SOURCING",
  "subStatus":"SOURCED",
  "recruiter":{"id":1}
}'

post_json "/api/candidates" '{
  "name":"Tom",
  "email":"tom@gmail.com",
  "phone":"+1 (206) 555-0222",
  "wechatName":"Tom",
  "workAuth":"OPT",
  "city":"Seattle",
  "state":"WA",
  "notes":"Screening interview did not go well. Lacks communication skills.",
  "stage":"ELIMINATED",
  "subStatus":"CLOSED",
  "closeReason":"NO_RESPONSE",
  "recruiter":{"id":4}
}'

# Candidate 7: Nina - Resume prep, not ready (for validation failure case)
post_json "/api/candidates" '{
  "name":"Nina",
  "email":"nina@gmail.com",
  "phone":"+1 (212) 555-0333",
  "wechatName":"Nina",
  "workAuth":"OPT",
  "city":"New York",
  "state":"NY",
  "school":"NYU",
  "major":"MS Software Engineering",
  "relocation":false,
  "resumeReady":false,
  "notes":"Resume preparation in progress.",
  "stage":"RESUME",
  "subStatus":"RESUME_PREPARING",
  "batch":{"id":1},
  "recruiter":{"id":1}
}'

# Timeline events (candidate IDs assumed 1..6)
post_json "/api/candidates/1/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"screening_passed",
  "title":"Screening Passed",
  "description":"Candidate passed initial screening.",
  "actorId":1
}'

post_json "/api/candidates/1/timeline" '{
  "eventType":"BATCH",
  "subType":"batch_assigned",
  "title":"Assigned to Batch",
  "description":"Assigned to Java 202601.",
  "actorId":2
}'

post_json "/api/candidates/1/timeline" '{
  "eventType":"READINESS",
  "subType":"resume_ready",
  "title":"Resume Ready",
  "description":"Resume finalized for marketing.",
  "actorId":3
}'

post_json "/api/candidates/2/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"screening_scheduled",
  "title":"Screening Scheduled",
  "description":"Screening scheduled for next week.",
  "actorId":1
}'

post_json "/api/candidates/3/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"outreach",
  "title":"Initial Outreach",
  "description":"Sent introductory email.",
  "actorId":1
}'

post_json "/api/candidates/4/timeline" '{
  "eventType":"VENDOR_SUBMIT",
  "subType":"vendor_submit",
  "title":"Submitted to Vendor",
  "description":"Submitted to Infobahn.",
  "actorId":4
}'

post_json "/api/candidates/4/timeline" '{
  "eventType":"CLIENT_INTERVIEW",
  "subType":"client_round_1",
  "title":"Client Round 1",
  "description":"Client round 1 scheduled.",
  "actorId":4
}'

post_json "/api/candidates/5/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"contacted",
  "title":"Contacted",
  "description":"Reached out via LinkedIn.",
  "actorId":1
}'

post_json "/api/candidates/6/timeline" '{
  "eventType":"CLOSED",
  "subType":"screening_failed",
  "title":"Closed",
  "description":"Candidate unresponsive after screening.",
  "closeReason":"NO_RESPONSE",
  "actorId":4
}'

echo "Seed complete."
