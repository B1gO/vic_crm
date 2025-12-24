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

# ============== MOCK CRITERIA ==============
echo "📋 Creating Mock Criteria..."

# Java - Screening
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"Screening","name":"Logistics & Fit","description":"Visa status, Notice period, Salary expectation, Location","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"Screening","name":"Communication","description":"English fluency, Clarity, Professionalism","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"Screening","name":"Resume Sanity Check","description":"Verify employment dates, Gap explanation, Role authenticity","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"Screening","name":"Java Basic Trivia","description":"Simple FizzBuzz level checks to filter complete fakes","displayOrder":4,"active":true}' > /dev/null

# Java - TechMock
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"TechMock","name":"JVM Internals","description":"Memory Model (Heap/Stack), GC algorithms, Classloading","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"TechMock","name":"Concurrency Theory","description":"JMM, Volatile, Synchronized vs Locks, Thread Pools","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"TechMock","name":"Spring Ecosystem","description":"Bean lifecycle, AOP/IOC principles, Boot starter magic","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"TechMock","name":"Database Internals","description":"Index structures (B+Tree), Transaction Isolation, MVCC","displayOrder":4,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"TechMock","name":"Distributed Systems","description":"Redis usage, Message Queue patterns (Kafka/RabbitMQ)","displayOrder":5,"active":true}' > /dev/null

# Java - RealMock
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"RealMock","name":"Live Coding (DSA)","description":"Algorithm correctness, Edge case handling, Complexity (Time/Space)","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"RealMock","name":"Engineering Quality","description":"Variable naming, Modularity, Clean Code principles","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"RealMock","name":"System Design","description":"Scalability, Trade-offs, Schema design, API definition","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"Java","stage":"RealMock","name":"Problem Solving","description":"Approach to ambiguity, Debugging thought process","displayOrder":4,"active":true}' > /dev/null

# React - Screening
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"Screening","name":"Logistics & Fit","description":"Visa status, Notice period, Salary expectation","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"Screening","name":"Communication","description":"English fluency, Clarity, Professionalism","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"Screening","name":"Stack Match","description":"Exp with Next.js, TypeScript, Tailwind (vs Resume claims)","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"Screening","name":"JS Basic Trivia","description":"ES6+ features, Closures, simple DOM manipulation check","displayOrder":4,"active":true}' > /dev/null

# React - TechMock
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"TechMock","name":"React Internals","description":"Virtual DOM, Fiber, Reconciliation, Synthetic Events","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"TechMock","name":"JS Core Theory","description":"Event Loop, Micro/Macro tasks, Prototype Chain, this binding","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"TechMock","name":"Browser Mechanism","description":"Critical Rendering Path, Repaint/Reflow, Caching, CORS","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"TechMock","name":"Performance Theory","description":"Memoization, Bundle splitting, Web Vitals, SSR/CSR","displayOrder":4,"active":true}' > /dev/null

# React - RealMock
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"RealMock","name":"Component Coding","description":"Implementing a feature (Infinite Scroll, Form), Hooks usage","displayOrder":1,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"RealMock","name":"CSS & Layout","description":"Flexbox/Grid mastery, Responsive implementation, Pixel perfection","displayOrder":2,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"RealMock","name":"State Management","description":"Designing data flow, Avoiding prop drilling, Context/Redux","displayOrder":3,"active":true}' > /dev/null
curl -s -X POST "$BASE_URL/api/mock-criteria" \
  -H "Content-Type: application/json" \
  -d '{"role":"React","stage":"RealMock","name":"Testing & Debugging","description":"Unit tests (Jest/RTL), Debugging React errors","displayOrder":4,"active":true}' > /dev/null

echo "   ✅ Created 26 mock criteria (Java + React × Screening/TechMock/RealMock)"

echo ""
echo "🎉 Database seeding complete!"
echo ""
echo "Summary:"
echo "  - 4 Users (2 Recruiters, 1 Trainer, 1 Supporter)"
echo "  - 2 Batches (Java 202601, React 202601)"
echo "  - 5 Clients (eBay, Walmart, Apple, Paypal, Intuit)"
echo "  - 3 Vendors (Infobahn, bayone, inspyr)"
echo "  - 4 Candidates (Sara, Zack, vincent, mingkai)"
echo "  - 26 Mock Criteria (Java + React)"
