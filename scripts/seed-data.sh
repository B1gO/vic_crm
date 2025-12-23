#!/bin/bash
# VicCRM E2E Data Seeding Script
# Run this after backend starts to populate sample data

BASE_URL="${1:-http://localhost:8080}"

echo "🌱 Seeding VicCRM database..."
echo "API: $BASE_URL"
echo ""

# ============== USERS ==============
echo "👤 Creating Users..."

curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"sravani","email":"s@vic.com","role":"RECRUITER"}' > /dev/null

curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"joey","email":"joey@vic.com","role":"TRAINER"}' > /dev/null

curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"crisp","email":"crisp@vic.com","role":"SUPPORTER"}' > /dev/null

curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"izzy","email":"izzy@vic.com","role":"RECRUITER"}' > /dev/null

echo "   ✅ Created 4 users (sravani, joey, crisp, izzy)"

# ============== BATCHES ==============
echo "📚 Creating Batches..."

curl -s -X POST "$BASE_URL/api/batches" \
  -H "Content-Type: application/json" \
  -d '{"name":"Java 202601","startDate":"2026-01-12","endDate":"2026-03-12"}' > /dev/null

curl -s -X POST "$BASE_URL/api/batches" \
  -H "Content-Type: application/json" \
  -d '{"name":"React 202601","startDate":"2026-01-11","endDate":"2026-03-11"}' > /dev/null

echo "   ✅ Created 2 batches (Java 202601, React 202601)"

# ============== CLIENTS ==============
echo "🏢 Creating Clients..."

curl -s -X POST "$BASE_URL/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"eBay","industry":"Technology"}' > /dev/null

curl -s -X POST "$BASE_URL/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Walmart","industry":"Technology"}' > /dev/null

curl -s -X POST "$BASE_URL/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Apple","industry":"Technology"}' > /dev/null

curl -s -X POST "$BASE_URL/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Paypal","industry":"Technology"}' > /dev/null

curl -s -X POST "$BASE_URL/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Intuit","industry":"Technology"}' > /dev/null

echo "   ✅ Created 5 clients (eBay, Walmart, Apple, Paypal, Intuit)"

# ============== VENDORS ==============
echo "🤝 Creating Vendors..."

# Vendor 1: Infobahn with 2 contacts, linked to eBay, Walmart, Paypal, Intuit
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName":"Infobahn",
    "contactName":"ilex",
    "email":"ilex@gmail.com",
    "phone":"1234567890",
    "clients":[{"id":1},{"id":2},{"id":4},{"id":5}],
    "contacts":[
      {"name":"kachana","email":"k@gmail.com","phone":"742973230","linkedinUrl":"https://linkedin.com/in/kachana"},
      {"name":"monika","email":"monika@gmail.com","phone":"093807968","linkedinUrl":"https://linkedin.com/in/monika"}
    ]
  }' > /dev/null

# Vendor 2: bayone with 1 contact, linked to eBay, Walmart, Paypal
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName":"bayone",
    "contactName":"richa",
    "email":"richa@gmail.com",
    "phone":"238208209810",
    "clients":[{"id":1},{"id":2},{"id":4}],
    "contacts":[
      {"name":"richa","email":"richa@gmail.com","phone":"1213242"}
    ]
  }' > /dev/null

# Vendor 3: inspyr with 1 contact, linked to Apple
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName":"inspyr",
    "contactName":"cole",
    "email":"cole@gmail.com",
    "phone":"323242374329",
    "clients":[{"id":3}],
    "contacts":[
      {"name":"Cole","email":"Cole@gmail.com","phone":"3129782974923","linkedinUrl":"https://linkedin.com/in/cole"}
    ]
  }' > /dev/null

echo "   ✅ Created 3 vendors (Infobahn, bayone, inspyr)"

# ============== CANDIDATES ==============
echo "🧑‍💻 Creating Candidates..."

# Candidate 1: Sara - Java batch, recruiter sravani
curl -s -X POST "$BASE_URL/api/candidates" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Sara",
    "email":"Sara@gmail.com",
    "wechatId":"1244343",
    "discordName":"12123#65605",
    "linkedinUrl":"https://linkedin.com/in/sara",
    "marketingLinkedinUrl":"https://linkedin.com/in/sara-dev",
    "workAuth":"OPT",
    "city":"Kansas",
    "education":"UCB",
    "lifecycleStage":"RECRUITMENT",
    "batch":{"id":1},
    "recruiter":{"id":1}
  }' > /dev/null

# Candidate 2: Zack - Java batch, recruiter sravani
curl -s -X POST "$BASE_URL/api/candidates" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Zack",
    "email":"Zack@gmail.com",
    "wechatId":"547954",
    "discordName":"2328#3434",
    "linkedinUrl":"https://linkedin.com/in/zack",
    "marketingLinkedinUrl":"https://linkedin.com/in/zack-dev",
    "workAuth":"CPT",
    "city":"TX",
    "education":"CSU",
    "lifecycleStage":"RECRUITMENT",
    "batch":{"id":1},
    "recruiter":{"id":1}
  }' > /dev/null

# Candidate 3: vincent - React batch, recruiter sravani
curl -s -X POST "$BASE_URL/api/candidates" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"vincent",
    "email":"vincent@gmail.com",
    "wechatId":"2382094",
    "discordName":"vincent#23",
    "linkedinUrl":"https://linkedin.com/in/vincent",
    "marketingLinkedinUrl":"https://linkedin.com/in/vincent-dev",
    "workAuth":"OPT",
    "city":"Atlanta, GA",
    "education":"UCLA",
    "lifecycleStage":"RECRUITMENT",
    "batch":{"id":2},
    "recruiter":{"id":1}
  }' > /dev/null

# Candidate 4: mingkai - React batch, recruiter izzy
curl -s -X POST "$BASE_URL/api/candidates" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"mingkai",
    "email":"mingkai@gmail.com",
    "wechatId":"121348912",
    "discordName":"sdfjsl#131",
    "linkedinUrl":"https://linkedin.com/in/mingkai",
    "marketingLinkedinUrl":"https://linkedin.com/in/mingkai-dev",
    "workAuth":"OPT",
    "city":"Atlanta, GA",
    "education":"UIUC",
    "lifecycleStage":"RECRUITMENT",
    "batch":{"id":2},
    "recruiter":{"id":4}
  }' > /dev/null

echo "   ✅ Created 4 candidates (Sara, Zack, vincent, mingkai)"

echo ""
echo "🎉 Database seeding complete!"
echo ""
echo "Summary:"
echo "  - 4 Users (2 Recruiters, 1 Trainer, 1 Supporter)"
echo "  - 2 Batches (Java 202601, React 202601)"
echo "  - 5 Clients (eBay, Walmart, Apple, Paypal, Intuit)"
echo "  - 3 Vendors (Infobahn, bayone, inspyr)"
echo "  - 4 Candidates (Sara, Zack, vincent, mingkai)"
