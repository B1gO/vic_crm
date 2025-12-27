#!/bin/bash
# VicCRM seed script with realistic stage pipeline data
# Creates candidates at various stages with proper workflow progression
# Also creates mock records for candidates who have mock-related substatuses

set -euo pipefail

BASE_URL="${1:-http://localhost:8080}"

post_json() {
  local path="$1"
  local payload="$2"
  curl -s -X POST "$BASE_URL$path" \
    -H "Content-Type: application/json" \
    -d "$payload"
}

post_json_silent() {
  local path="$1"
  local payload="$2"
  curl -s -X POST "$BASE_URL$path" \
    -H "Content-Type: application/json" \
    -d "$payload" > /dev/null
}

echo "🌱 Seeding VicCRM database with realistic stage pipeline data..."

# ====== USERS ======
echo "  Creating users..."
post_json_silent "/api/users" '{"name":"sravani","email":"s@vic.com","role":"RECRUITER"}'
post_json_silent "/api/users" '{"name":"joey","email":"joey@vic.com","role":"TRAINER"}'
post_json_silent "/api/users" '{"name":"crisp","email":"crisp@vic.com","role":"SUPPORTER"}'
post_json_silent "/api/users" '{"name":"izzy","email":"izzy@vic.com","role":"RECRUITER"}'

# ====== BATCHES ======
echo "  Creating batches..."
post_json_silent "/api/batches" '{"name":"Java 202601","startDate":"2026-01-12","endDate":"2026-03-12"}'
post_json_silent "/api/batches" '{"name":"React 202601","startDate":"2026-01-11","endDate":"2026-03-11"}'

# ====== CLIENTS ======
echo "  Creating clients..."
post_json_silent "/api/clients" '{"companyName":"eBay","industry":"Technology"}'
post_json_silent "/api/clients" '{"companyName":"Walmart","industry":"Technology"}'
post_json_silent "/api/clients" '{"companyName":"Apple","industry":"Technology"}'
post_json_silent "/api/clients" '{"companyName":"Paypal","industry":"Technology"}'
post_json_silent "/api/clients" '{"companyName":"Intuit","industry":"Technology"}'

# ====== VENDORS ======
echo "  Creating vendors..."
post_json_silent "/api/vendors" '{
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

post_json_silent "/api/vendors" '{
  "companyName":"bayone",
  "contactName":"richa",
  "email":"richa@gmail.com",
  "phone":"238208209810",
  "clients":[{"id":1},{"id":2},{"id":4}],
  "contacts":[
    {"name":"richa","email":"richa@gmail.com","phone":"1213242"}
  ]
}'

post_json_silent "/api/vendors" '{
  "companyName":"inspyr",
  "contactName":"cole",
  "email":"cole@gmail.com",
  "phone":"323242374329",
  "clients":[{"id":3}],
  "contacts":[
    {"name":"Cole","email":"Cole@gmail.com","phone":"3129782974923","linkedinUrl":"https://linkedin.com/in/cole"}
  ]
}'

# ====== CANDIDATES ======
echo "  Creating candidates..."

# Candidate 1: Sara - RESUME stage (normal training path, completed mocking)
# Pipeline: SOURCING -> passed screening -> TRAINING -> RESUME (Ready)
post_json_silent "/api/candidates" '{
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

# Candidate 2: Zack - SOURCING stage, CONTACTED (waiting for screening to be scheduled)
# Pipeline: SOURCING (contacted, need to schedule screening)
post_json_silent "/api/candidates" '{
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
  "subStatus":"CONTACTED",
  "recruiter":{"id":1}
}'

# Candidate 3: Vincent - SOURCING stage, just SOURCED (initial intake)
post_json_silent "/api/candidates" '{
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

# Candidate 4: Mingkai - MARKETING stage (completed full training path)
# Pipeline: SOURCING -> TRAINING -> RESUME -> MOCKING -> MARKETING
post_json_silent "/api/candidates" '{
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
  "resumeReady":true,
  "techTags":"Java,Spring,Microservices",
  "notes":"Full-stack developer. Passed real mock with Strong Hire.",
  "stage":"MARKETING",
  "subStatus":"MARKETING_ACTIVE",
  "batch":{"id":1},
  "recruiter":{"id":4}
}'

# Candidate 5: Emma - SOURCING stage, just SOURCED
post_json_silent "/api/candidates" '{
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

# Candidate 6: Tom - ELIMINATED (no response during screening)
post_json_silent "/api/candidates" '{
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

# Candidate 7: Nina - RESUME stage, PREPARING (not ready yet)
post_json_silent "/api/candidates" '{
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

# Candidate 8: Alex - MOCKING stage, needs to schedule theory mock
post_json_silent "/api/candidates" '{
  "name":"Alex",
  "email":"alex@gmail.com",
  "phone":"+1 (650) 555-0444",
  "wechatName":"Alex",
  "workAuth":"GC",
  "city":"San Jose",
  "state":"CA",
  "school":"Stanford",
  "major":"MS Computer Science",
  "relocation":false,
  "resumeReady":true,
  "notes":"Resume ready, entering mocking phase.",
  "stage":"MOCKING",
  "subStatus":"MOCK_THEORY_READY",
  "batch":{"id":1},
  "recruiter":{"id":1}
}'

# Candidate 9: Lisa - TRAINING stage (in active training)
post_json_silent "/api/candidates" '{
  "name":"Lisa",
  "email":"lisa@gmail.com",
  "phone":"+1 (408) 555-0555",
  "wechatName":"Lisa",
  "workAuth":"OPT",
  "city":"Sunnyvale",
  "state":"CA",
  "school":"CMU",
  "major":"MS Software Engineering",
  "relocation":true,
  "notes":"Currently in Java 202601 batch.",
  "stage":"TRAINING",
  "subStatus":"IN_TRAINING",
  "batch":{"id":1},
  "recruiter":{"id":1}
}'

# Candidate 10: Kevin - OFFERED stage (offer pending decision)
post_json_silent "/api/candidates" '{
  "name":"Kevin",
  "email":"kevin@gmail.com",
  "phone":"+1 (925) 555-0666",
  "wechatName":"Kevin",
  "workAuth":"H1B",
  "city":"Pleasanton",
  "state":"CA",
  "school":"MIT",
  "major":"MS Computer Science",
  "relocation":false,
  "resumeReady":true,
  "techTags":"React,TypeScript,Node.js",
  "notes":"Received offer from eBay via Infobahn.",
  "stage":"OFFERED",
  "subStatus":"OFFER_PENDING",
  "offerType":"W2",
  "batch":{"id":2},
  "recruiter":{"id":4}
}'

# ====== MOCKS ======
# Create mocks for candidates who need them for proper substatus

echo "  Creating mocks..."
# Sara (ID 1) - She should have completed screening mock since she's past SOURCING
post_json_silent "/api/mocks" '{
  "candidate":{"id":1},
  "evaluator":{"id":2},
  "stage":"Screening",
  "role":"Java",
  "scheduledAt":"2025-11-15T10:00:00",
  "completed":true,
  "decision":"Hire",
  "score":75,
  "summary":"Good communication skills. Solid fundamentals.",
  "strengths":"Strong system design knowledge",
  "weaknesses":"Could improve on concurrency",
  "actionItems":"Review Java concurrency patterns"
}'

# Mingkai (ID 4) - He should have all mocks completed since he's in MARKETING
post_json_silent "/api/mocks" '{
  "candidate":{"id":4},
  "evaluator":{"id":2},
  "stage":"Screening",
  "role":"Java",
  "scheduledAt":"2025-10-01T10:00:00",
  "completed":true,
  "decision":"Strong Hire",
  "score":90,
  "summary":"Exceptional candidate.",
  "strengths":"Deep Java knowledge",
  "weaknesses":"None significant"
}'

post_json_silent "/api/mocks" '{
  "candidate":{"id":4},
  "evaluator":{"id":2},
  "stage":"TechMock",
  "role":"Java",
  "scheduledAt":"2025-11-01T10:00:00",
  "completed":true,
  "decision":"Strong Hire",
  "score":92,
  "summary":"Passed theory mock with flying colors."
}'

post_json_silent "/api/mocks" '{
  "candidate":{"id":4},
  "evaluator":{"id":2},
  "stage":"RealMock",
  "role":"Java",
  "scheduledAt":"2025-11-20T10:00:00",
  "completed":true,
  "decision":"Strong Hire",
  "score":95,
  "summary":"Ready for client-facing interviews."
}'

# ====== SUBMISSIONS (V2 - simplified) ======
echo "  Creating submissions..."
# Kevin (ID 10) - he has an offer
post_json_silent "/api/submissions" '{
  "candidate":{"id":10},
  "vendor":{"id":1},
  "status":"OFFERED",
  "notes":"Final round completed. Offer extended."
}'

# Mingkai (ID 4) - active submissions in marketing
post_json_silent "/api/submissions" '{
  "candidate":{"id":4},
  "vendor":{"id":1},
  "status":"ACTIVE",
  "notes":"Submitted to Infobahn. Waiting for next steps."
}'

post_json_silent "/api/submissions" '{
  "candidate":{"id":4},
  "vendor":{"id":2},
  "status":"ACTIVE",
  "notes":"Just submitted to Bayone."
}'

# ====== POSITIONS (V2 - with sourceVendor and extended fields) ======
echo "  Creating positions..."

# Positions from Infobahn (Vendor ID 1) - works with clients 1,2,4,5
post_json_silent "/api/positions" '{
  "title":"sfas",
  "client":{"id":2},
  "sourceVendor":{"id":1},
  "teamName":"Cloud Platform",
  "track":"backend",
  "employmentType":"CONTRACT",
  "location":"Seattle, WA",
  "billRate":85,
  "payRate":65,
  "headcount":2,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"Java Backend Developer",
  "client":{"id":2},
  "sourceVendor":{"id":1},
  "teamName":"eCommerce",
  "track":"backend",
  "employmentType":"CONTRACT",
  "location":"Bentonville, AR",
  "billRate":80,
  "payRate":60,
  "headcount":3,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"Software Engineer II",
  "client":{"id":4},
  "sourceVendor":{"id":1},
  "teamName":"Payments",
  "track":"fullstack",
  "employmentType":"C2H",
  "location":"San Jose, CA",
  "billRate":90,
  "payRate":70,
  "headcount":1,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"QA Engineer",
  "client":{"id":5},
  "sourceVendor":{"id":1},
  "teamName":"TurboTax",
  "track":"qa",
  "employmentType":"CONTRACT",
  "location":"Mountain View, CA",
  "billRate":70,
  "payRate":55,
  "headcount":2,
  "status":"ON_HOLD"
}'

# Positions from Bayone (Vendor ID 2) - works with clients 1,2,4
post_json_silent "/api/positions" '{
  "title":"Senior Frontend Engineer",
  "client":{"id":1},
  "sourceVendor":{"id":2},
  "teamName":"Search Experience",
  "track":"frontend",
  "employmentType":"CONTRACT",
  "location":"San Jose, CA",
  "billRate":95,
  "payRate":75,
  "headcount":1,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"ebay 001",
  "client":{"id":1},
  "sourceVendor":{"id":2},
  "teamName":"Buyer Platform",
  "track":"backend",
  "employmentType":"FULLTIME",
  "location":"Remote",
  "billRate":0,
  "payRate":0,
  "headcount":2,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"wefsd",
  "client":{"id":2},
  "sourceVendor":{"id":2},
  "teamName":"Supply Chain",
  "track":"fullstack",
  "employmentType":"CONTRACT",
  "location":"Dallas, TX",
  "billRate":78,
  "payRate":58,
  "headcount":1,
  "status":"CLOSED"
}'

# Positions from Inspyr (Vendor ID 3) - works with client 3 (Apple)
post_json_silent "/api/positions" '{
  "title":"iOS Developer",
  "client":{"id":3},
  "sourceVendor":{"id":3},
  "teamName":"Apple Music",
  "track":"frontend",
  "employmentType":"CONTRACT",
  "location":"Cupertino, CA",
  "billRate":120,
  "payRate":95,
  "headcount":2,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"Backend Engineer - iCloud",
  "client":{"id":3},
  "sourceVendor":{"id":3},
  "teamName":"iCloud Services",
  "track":"backend",
  "employmentType":"CONTRACT",
  "location":"Cupertino, CA",
  "billRate":115,
  "payRate":90,
  "headcount":3,
  "status":"OPEN"
}'

post_json_silent "/api/positions" '{
  "title":"DevOps Engineer",
  "client":{"id":3},
  "sourceVendor":{"id":3},
  "teamName":"Infrastructure",
  "track":"devops",
  "employmentType":"C2H",
  "location":"Austin, TX",
  "billRate":100,
  "payRate":80,
  "headcount":1,
  "status":"ON_HOLD"
}'

# ====== TIMELINE EVENTS ======
echo "  Creating timeline events..."

# Sara's journey
post_json_silent "/api/candidates/1/timeline" '{
  "eventType":"MOCK",
  "subType":"screening_passed",
  "title":"Screening Passed",
  "description":"Passed screening mock with Hire decision.",
  "actorId":2
}'

post_json_silent "/api/candidates/1/timeline" '{
  "eventType":"BATCH",
  "subType":"batch_assigned",
  "title":"Assigned to Batch",
  "description":"Assigned to Java 202601.",
  "actorId":1
}'

post_json_silent "/api/candidates/1/timeline" '{
  "eventType":"STAGE_CHANGED",
  "subType":"entered_training",
  "title":"Entered Training",
  "description":"Moved to TRAINING stage.",
  "actorId":1
}'

post_json_silent "/api/candidates/1/timeline" '{
  "eventType":"STAGE_CHANGED",
  "subType":"entered_resume",
  "title":"Entered Resume Prep",
  "description":"Moved to RESUME stage.",
  "actorId":1
}'

# Zack - contacted
post_json_silent "/api/candidates/2/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"contacted",
  "title":"Initial Contact",
  "description":"Made initial contact via LinkedIn.",
  "actorId":1
}'

# Vincent - just sourced
post_json_silent "/api/candidates/3/timeline" '{
  "eventType":"COMMUNICATION",
  "subType":"outreach",
  "title":"Initial Outreach",
  "description":"Sent introductory email.",
  "actorId":1
}'

# Mingkai's full journey
post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"MOCK",
  "subType":"screening_passed",
  "title":"Screening Passed",
  "description":"Strong Hire on screening mock.",
  "actorId":2
}'

post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"STAGE_CHANGED",
  "subType":"entered_training",
  "title":"Entered Training",
  "description":"Started Java training.",
  "actorId":1
}'

post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"MOCK",
  "subType":"theory_passed",
  "title":"Theory Mock Passed",
  "description":"Strong Hire on theory mock.",
  "actorId":2
}'

post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"MOCK",
  "subType":"real_passed",
  "title":"Real Mock Passed",
  "description":"Strong Hire on real mock. Ready for marketing.",
  "actorId":2
}'

post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"STAGE_CHANGED",
  "subType":"entered_marketing",
  "title":"Entered Marketing",
  "description":"Moved to MARKETING stage.",
  "actorId":4
}'

post_json_silent "/api/candidates/4/timeline" '{
  "eventType":"VENDOR_SUBMIT",
  "subType":"vendor_submit",
  "title":"Submitted to Infobahn",
  "description":"Submitted for Walmart position.",
  "actorId":4
}'

# Tom - eliminated
post_json_silent "/api/candidates/6/timeline" '{
  "eventType":"ELIMINATED",
  "subType":"no_response",
  "title":"Closed",
  "description":"Candidate unresponsive after multiple follow-ups.",
  "closeReason":"NO_RESPONSE",
  "actorId":4
}'

# Kevin - offered
post_json_silent "/api/candidates/10/timeline" '{
  "eventType":"OFFERED",
  "subType":"offer_extended",
  "title":"Offer Extended",
  "description":"Received W2 offer from eBay via Infobahn.",
  "actorId":4
}'

echo "✅ Seed complete! Created:"
echo "   - 4 users"
echo "   - 2 batches"  
echo "   - 5 clients"
echo "   - 3 vendors"
echo "   - 10 candidates at various stages"
echo "   - 4 mocks (screening and theory/real for eligible candidates)"
echo "   - 3 submissions"
echo "   - 10 positions (4 Infobahn, 3 Bayone, 3 Inspyr)"
echo "   - Timeline events for journey tracking"
