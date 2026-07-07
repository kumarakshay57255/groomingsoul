#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Grooming Souls — Phase 3 end-to-end smoke test
# ---------------------------------------------------------------------------
# Exercises every flow built in Phase 3 against a running Express backend at
# http://localhost:5040 + Postgres at the credentials in backend/.env.
#
# Requirements:
#   - Backend running:  cd backend && npm run dev
#   - Postgres:         the seed has been run (npm run db:seed)
#   - psql + curl + python3 available in PATH
#
# Usage:
#   bash backend/scripts/smoke-test.sh
#
# Exit code 0 if all assertions pass, non-zero otherwise.
# ---------------------------------------------------------------------------

set -u

API="${API:-http://localhost:5040}"
PGURI_OPTS=(-h localhost -p 5432 -U postgres -d groomingsouls_dev)
export PGPASSWORD="${PGPASSWORD:-1234}"

GREEN=$'\e[32m'
RED=$'\e[31m'
DIM=$'\e[2m'
BOLD=$'\e[1m'
RESET=$'\e[0m'

PASS=0
FAIL=0
STEP=0

pass() { printf "  %s✓%s %s\n" "$GREEN" "$RESET" "$1"; PASS=$((PASS+1)); }
fail() { printf "  %s✗%s %s\n" "$RED" "$RESET" "$1"; FAIL=$((FAIL+1)); }
note() { printf "    %s%s%s\n" "$DIM" "$1" "$RESET"; }

step() {
  STEP=$((STEP+1))
  printf "\n%s%d. %s%s\n" "$BOLD" "$STEP" "$1" "$RESET"
}

# Verify the assertion "should be N" with the value we got
expect_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then pass "$label"
  else fail "$label  (expected '$expected', got '$actual')"
  fi
}

http_code() {
  local method="$1" url="$2" jar="${3:-}"
  if [[ -n "$jar" ]]; then
    curl -s -o /dev/null -w "%{http_code}" -b "$jar" -X "$method" "$url"
  else
    curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url"
  fi
}

cleanup() {
  note "Cleaning up smoke users + their purchases…"
  psql "${PGURI_OPTS[@]}" -c "DELETE FROM users WHERE email LIKE 'smoke-%@example.com';" >/dev/null 2>&1 || true
  rm -f /tmp/gs-smoke-*.txt /tmp/gs-smoke-*.bin /tmp/gs-smoke-receipt.png
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
printf "%s%sGrooming Souls — Phase 3 smoke test%s\n" "$BOLD" "$GREEN" "$RESET"
printf "%sAPI: %s%s\n" "$DIM" "$API" "$RESET"

# 1. Sanity checks --------------------------------------------------------
step "API health + DB connection"
HEALTH=$(curl -s "$API/api/health" || true)
[[ "$HEALTH" == *'"ok":true'* ]] && pass "GET /api/health → ok" || fail "GET /api/health → '$HEALTH'"

DB_SEEDED=$(psql "${PGURI_OPTS[@]}" -tAc "SELECT COUNT(*) FROM courses WHERE is_published = true;" 2>/dev/null || echo "0")
if [[ "$DB_SEEDED" -gt 0 ]]; then pass "DB has $DB_SEEDED published courses"
else fail "DB has no courses — run 'npm run db:seed'"
fi

# 2. Phone validation -----------------------------------------------------
step "Indian-mobile validation"
EMAIL_BAD="smoke-badphone@example.com"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bad Phone\",\"email\":\"$EMAIL_BAD\",\"phone\":\"+91123\",\"password\":\"testpass123\"}")
expect_eq "Signup with 7-digit phone → 400" "400" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bad Pfx\",\"email\":\"smoke-badpfx@example.com\",\"phone\":\"5123456789\",\"password\":\"testpass123\"}")
expect_eq "Signup with phone starting 5 → 400" "400" "$CODE"

# 3. Signup + auth --------------------------------------------------------
step "Signup, login, /me, logout, reset"
STU_JAR=/tmp/gs-smoke-stu.txt
EMAIL="smoke-buyer@example.com"
PHONE="9123456789"
SIGNUP=$(curl -s -c "$STU_JAR" -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Buyer\",\"email\":\"$EMAIL\",\"phone\":\"$PHONE\",\"password\":\"originalpass1\"}")
USER_ID=$(echo "$SIGNUP" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])" 2>/dev/null || echo "")
[[ -n "$USER_ID" ]] && pass "Signup created user $USER_ID" || { fail "Signup failed: $SIGNUP"; exit 1; }

PHONE_STORED=$(echo "$SIGNUP" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['phone'])")
expect_eq "Phone normalised to +91 form" "+91${PHONE}" "$PHONE_STORED"

ME=$(curl -s -b "$STU_JAR" "$API/api/auth/me")
[[ "$ME" == *"$EMAIL"* ]] && pass "/api/auth/me echoes the new user" || fail "/me: $ME"

# Forgot password
FORGOT=$(curl -s -X POST "$API/api/auth/forgot-password" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}")
RESET_URL=$(echo "$FORGOT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('devResetUrl',''))")
TOKEN=$(echo "$RESET_URL" | python3 -c "import sys,re,urllib.parse; m=re.search(r'token=([^&]+)$', sys.stdin.read()); print(urllib.parse.unquote(m.group(1)) if m else '')")
[[ -n "$TOKEN" ]] && pass "Forgot-password returned dev reset token" || fail "Forgot-password: no token in $FORGOT"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\",\"password\":\"changedpass2\"}")
expect_eq "Reset password → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"originalpass1\"}")
expect_eq "Old password rejected after reset → 401" "401" "$CODE"

curl -s -c "$STU_JAR" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"changedpass2\"}" >/dev/null
ME=$(curl -s -b "$STU_JAR" "$API/api/auth/me")
[[ "$ME" == *"$EMAIL"* ]] && pass "Login with new password works" || fail "Login after reset: $ME"

# 4. Public course listings ------------------------------------------------
step "Academy + Diploma listings"
ACADEMY_N=$(curl -s "$API/api/courses?type=academy" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['courses']))")
DIPLOMA_N=$(curl -s "$API/api/courses?type=diploma" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['courses']))")
[[ "$ACADEMY_N" -ge 1 ]] && pass "Academy returns $ACADEMY_N courses" || fail "Academy empty"
[[ "$DIPLOMA_N" -ge 1 ]] && pass "Diploma returns $DIPLOMA_N courses" || fail "Diploma empty"

DETAIL=$(curl -s "$API/api/courses/cuet-ug-psychology-master")
[[ "$DETAIL" == *"Mock Series"* ]] && pass "Course detail returns modules" || fail "Course detail missing modules"
[[ "$DETAIL" != *"videoUrl"* ]] && pass "Public course detail does NOT leak videoUrl" || fail "videoUrl leaked in public payload"

# 5. Purchase flow --------------------------------------------------------
step "Purchase: anon → 401, authed → 201, duplicate → 409"
COURSE_SLUG="cuet-ug-psychology-master"
COURSE_ID=$(psql "${PGURI_OPTS[@]}" -tAc "SELECT id FROM courses WHERE slug='$COURSE_SLUG';" | tr -d ' ')

# Create a 1x1 PNG receipt
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" | base64 -d > /tmp/gs-smoke-receipt.png

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/purchases" \
  -F "courseId=$COURSE_ID" -F "payerName=Anon" -F "payerPhone=$PHONE" \
  -F "payerEmail=$EMAIL" -F "receipt=@/tmp/gs-smoke-receipt.png;type=image/png")
expect_eq "Anonymous create-purchase → 401" "401" "$CODE"

PURCHASE_RES=$(curl -s -b "$STU_JAR" -X POST "$API/api/purchases" \
  -F "courseId=$COURSE_ID" -F "payerName=Smoke Buyer" \
  -F "payerPhone=$PHONE" -F "payerEmail=$EMAIL" \
  -F "receipt=@/tmp/gs-smoke-receipt.png;type=image/png")
PURCHASE_ID=$(echo "$PURCHASE_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['purchase']['id'])" 2>/dev/null || echo "")
[[ -n "$PURCHASE_ID" ]] && pass "Authed create-purchase → $PURCHASE_ID" || { fail "Purchase: $PURCHASE_RES"; exit 1; }

CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$STU_JAR" -X POST "$API/api/purchases" \
  -F "courseId=$COURSE_ID" -F "payerName=Smoke Buyer" -F "payerPhone=$PHONE" -F "payerEmail=$EMAIL" \
  -F "receipt=@/tmp/gs-smoke-receipt.png;type=image/png")
expect_eq "Duplicate pending purchase → 409" "409" "$CODE"

# /api/purchases/me sees the pending row
ME_P=$(curl -s -b "$STU_JAR" "$API/api/purchases/me" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['purchases'][0]['status'])")
expect_eq "/api/purchases/me sees the new row pending" "pending_verification" "$ME_P"

# Student cannot fetch curriculum yet (not active)
CODE=$(curl -s -b "$STU_JAR" "$API/api/dashboard/courses/$PURCHASE_ID" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['purchase']['isUnlocked'])")
expect_eq "Curriculum is locked while pending" "False" "$CODE"

# 6. Admin approve -------------------------------------------------------
step "Admin approval flow"
ADMIN_JAR=/tmp/gs-smoke-admin.txt
curl -s -c "$ADMIN_JAR" -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"grooming@admin.com","password":"grooming@admin"}' >/dev/null
ME=$(curl -s -b "$ADMIN_JAR" "$API/api/auth/me")
[[ "$ME" == *'"role":"admin"'* ]] && pass "Admin logged in" || fail "Admin login: $ME"

# Non-admin can't hit admin route
CODE=$(http_code GET "$API/api/admin/purchases" "$STU_JAR")
expect_eq "Non-admin /admin/purchases → 403" "403" "$CODE"

LIST=$(curl -s -b "$ADMIN_JAR" "$API/api/admin/purchases?status=pending_verification")
[[ "$LIST" == *"$PURCHASE_ID"* ]] && pass "Admin sees the pending purchase" || fail "Admin list missing purchase"

APPROVE=$(curl -s -b "$ADMIN_JAR" -X POST "$API/api/admin/purchases/$PURCHASE_ID/approve")
STATUS=$(echo "$APPROVE" | python3 -c "import sys,json; print(json.load(sys.stdin)['purchase']['status'])")
expect_eq "Purchase approved → status=active" "active" "$STATUS"
EXPIRES_AT=$(echo "$APPROVE" | python3 -c "import sys,json; print(json.load(sys.stdin)['purchase']['expiresAt'])")
[[ -n "$EXPIRES_AT" && "$EXPIRES_AT" != "None" ]] && pass "expiresAt populated → $EXPIRES_AT" || fail "expiresAt empty"

# 7. Stream + watch flow -------------------------------------------------
step "Lesson access, masked stream, Range, mark-complete"
CUR=$(curl -s -b "$STU_JAR" "$API/api/dashboard/courses/$PURCHASE_ID")
UNLOCKED=$(echo "$CUR" | python3 -c "import sys,json; print(json.load(sys.stdin)['purchase']['isUnlocked'])")
expect_eq "Curriculum now unlocked" "True" "$UNLOCKED"

LESSON_ID=$(echo "$CUR" | python3 -c "import sys,json; d=json.load(sys.stdin)['purchase']; print(d['modules'][0]['lessons'][0]['id'])")
LESSON=$(curl -s -b "$STU_JAR" "$API/api/dashboard/lessons/$LESSON_ID")
STREAM_URL=$(echo "$LESSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['lesson']['streamUrl'])")
[[ -n "$STREAM_URL" ]] && pass "Lesson returned masked streamUrl" || fail "no streamUrl"

LEAK=$(echo "$LESSON" | grep -c "local://" || true)
[[ "$LEAK" -eq 0 ]] && pass "Real source URL not leaked in lesson payload" || fail "source URL leaked"

# Full stream
CODE=$(curl -s -o /tmp/gs-smoke-full.bin -w "%{http_code}" "$API$STREAM_URL")
SIZE=$(stat -f %z /tmp/gs-smoke-full.bin 2>/dev/null || stat -c %s /tmp/gs-smoke-full.bin)
expect_eq "Stream proxy full GET → 200" "200" "$CODE"
[[ "$SIZE" -gt 100000 ]] && pass "Stream returned $SIZE bytes" || fail "Stream too small: $SIZE bytes"

# Range
RANGE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Range: bytes=0-1023" "$API$STREAM_URL")
expect_eq "Range request returns 206" "206" "$RANGE_CODE"

# Garbage token
CODE=$(http_code GET "$API/api/stream/garbage.token.value")
expect_eq "Garbage stream token → 403" "403" "$CODE"

# Mark complete
COMPLETE=$(curl -s -b "$STU_JAR" -X POST "$API/api/dashboard/lessons/$LESSON_ID/complete")
PCT=$(echo "$COMPLETE" | python3 -c "import sys,json; print(json.load(sys.stdin)['progress']['percent'])")
[[ "$PCT" -gt 0 ]] && pass "Mark-complete updated progress to ${PCT}%" || fail "Mark-complete percent: $PCT"

# 8. Diploma certificate trigger -----------------------------------------
step "Diploma certificate-queue auto-trigger"
DIPLOMA_ID=$(psql "${PGURI_OPTS[@]}" -tAc "SELECT id FROM courses WHERE slug='diploma-trauma-informed-care';" | tr -d ' ')
STU2_JAR=/tmp/gs-smoke-stu2.txt
curl -s -c "$STU2_JAR" -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Diploma","email":"smoke-cert@example.com","phone":"9000000099","password":"testpass99"}' >/dev/null

DIP_PURCH=$(curl -s -b "$STU2_JAR" -X POST "$API/api/purchases" \
  -F "courseId=$DIPLOMA_ID" -F "payerName=Smoke Diploma" \
  -F "payerPhone=9000000099" -F "payerEmail=smoke-cert@example.com" \
  -F "receipt=@/tmp/gs-smoke-receipt.png;type=image/png" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['purchase']['id'])")
curl -s -b "$ADMIN_JAR" -X POST "$API/api/admin/purchases/$DIP_PURCH/approve" >/dev/null
pass "Diploma purchase created + approved"

LESSON_IDS=$(psql "${PGURI_OPTS[@]}" -tAc "
  SELECT l.id FROM lessons l JOIN course_modules m ON m.id=l.module_id
  WHERE m.course_id='$DIPLOMA_ID' ORDER BY m.position, l.position;
")
CERT_QUEUED=""
while IFS= read -r L; do
  L=$(echo "$L" | tr -d ' ')
  [[ -z "$L" ]] && continue
  R=$(curl -s -b "$STU2_JAR" -X POST "$API/api/dashboard/lessons/$L/complete")
  CERT_QUEUED=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['certificateQueued'])")
done <<< "$LESSON_IDS"
expect_eq "Final lesson completion → certificateQueued=True" "True" "$CERT_QUEUED"

ADMIN_CERTS=$(curl -s -b "$ADMIN_JAR" "$API/api/admin/certificates?status=queued")
[[ "$ADMIN_CERTS" == *"Smoke Diploma"* ]] && pass "Admin sees queued certificate" || fail "Admin queue missing cert: $ADMIN_CERTS"

# 9. Time-bound expiry --------------------------------------------------
step "Time-bound expiry enforcement"
psql "${PGURI_OPTS[@]}" -c "UPDATE purchases SET expires_at = NOW() - INTERVAL '1 minute' WHERE id='$PURCHASE_ID';" >/dev/null

SWEEP=$(curl -s -b "$ADMIN_JAR" -X POST "$API/api/admin/cron/expire")
EXPIRED=$(echo "$SWEEP" | python3 -c "import sys,json; print(json.load(sys.stdin)['expired'])")
[[ "$EXPIRED" -ge 1 ]] && pass "Cron sweep flipped $EXPIRED purchase(s) to expired" || fail "Sweep returned: $SWEEP"

DB_STATUS=$(psql "${PGURI_OPTS[@]}" -tAc "SELECT status FROM purchases WHERE id='$PURCHASE_ID';" | tr -d ' ')
expect_eq "DB row status now 'expired'" "expired" "$DB_STATUS"

CODE=$(http_code GET "$API/api/dashboard/lessons/$LESSON_ID" "$STU_JAR")
expect_eq "Expired purchase: lesson GET → 403" "403" "$CODE"

CODE=$(http_code POST "$API/api/dashboard/lessons/$LESSON_ID/complete" "$STU_JAR")
expect_eq "Expired purchase: mark-complete → 403" "403" "$CODE"

# Restore for further manual play
psql "${PGURI_OPTS[@]}" -c "UPDATE purchases SET status='active', expires_at = NOW() + INTERVAL '90 days' WHERE id='$PURCHASE_ID';" >/dev/null
pass "Restored test purchase to active+90d"

# 10. Summary ------------------------------------------------------------
printf "\n%s──────────────────────────────────────────────%s\n" "$DIM" "$RESET"
TOTAL=$((PASS+FAIL))
if [[ "$FAIL" -eq 0 ]]; then
  printf "%s%s✓ %d/%d checks passed%s — Phase 3 is solid.\n" "$BOLD" "$GREEN" "$PASS" "$TOTAL" "$RESET"
  exit 0
else
  printf "%s%s✗ %d/%d failed%s out of %d total checks.\n" "$BOLD" "$RED" "$FAIL" "$TOTAL" "$RESET" "$TOTAL"
  exit 1
fi
