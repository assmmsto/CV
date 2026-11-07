#!/bin/bash
# ===== Full system test — CV Studio =====
BASE="http://localhost:3000"
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
bad(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "== 1) Server & static assets =="
for path in / /manifest.json /sw.js /icons/icon-192.png /icons/icon-512.png /icons/icon-maskable-192.png /icons/icon-maskable-512.png /pdf.worker.min.mjs; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  [ "$code" = "200" ] && ok "GET $path → 200" || bad "GET $path → $code"
done

echo "== 2) PWA manifest validity =="
python3 - "$BASE/manifest.json" <<'PY'
import json,sys,urllib.request
m=json.load(urllib.request.urlopen(sys.argv[1]))
req=["name","short_name","start_url","display","icons"]
missing=[k for k in req if k not in m]
print("  ✅ manifest OK:",m["name"],"| icons:",len(m.get("icons",[]))) if not missing else print("  ❌ manifest missing:",missing)
PY

echo "== 3) Export API — single template =="
curl -s -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" --data '{"data":'"$(cat /tmp/cv-payload.json | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)["data"]))')"',"lang":"ar","templates":["ats-classic"]}' -o /tmp/single.pdf -w "http:%{http_code}\n"
file /tmp/single.pdf | grep -q PDF && ok "single PDF generated ($(wc -c </tmp/single.pdf) bytes)" || bad "single PDF failed"

echo "== 4) Export API — ALL 10 versions ZIP =="
curl -s -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" --data @/tmp/cv-payload.json -o /tmp/all.zip -w "http:%{http_code}\n"
file /tmp/all.zip | grep -q Zip && ok "ZIP generated ($(wc -c </tmp/all.zip) bytes)" || bad "ZIP failed"

echo "== 5) ZIP contents — exactly 10 distinct PDFs =="
rm -rf /tmp/unzip-test && mkdir -p /tmp/unzip-test && cd /tmp/unzip-test && unzip -q /tmp/all.zip
n=$(find . -name "*.pdf" | wc -l)
[ "$n" = "10" ] && ok "10 PDFs in ZIP" || bad "found $n PDFs"
uniq=$(md5sum */*.pdf | awk '{print $1}' | sort -u | wc -l)
[ "$uniq" = "10" ] && ok "all 10 files are DIFFERENT (unique md5)" || bad "duplicates found: only $uniq unique"
for f in */*.pdf; do
  p=$(pdfinfo "$f" 2>/dev/null | awk '/^Pages/{print $2}')
  t=$(pdftotext "$f" - 2>/dev/null | tr -d '[:space:]' | wc -c)
  echo "    $(basename "$f") → ${p}p, ${t} chars"
done

echo "== 6) Error handling =="
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" -d '{}')
[ "$code" = "400" ] && ok "empty body → 400" || bad "empty body → $code"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" -d '{"data":{"personal":{}},"templates":["nope"]}')
[ "$code" = "400" ] && ok "invalid template → 400" || bad "invalid template → $code"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" -d 'not-json')
[ "$code" = "400" ] && ok "bad json → 400" || bad "bad json → $code"

echo "== 7) English CV export =="
python3 - <<'PY' > /tmp/cv-payload-en.json
import json
p=json.load(open('/tmp/cv-payload.json'))
p['lang']='en'
json.dump(p,open('/tmp/cv-payload-en.json','w'),ensure_ascii=False)
PY
curl -s -X POST "$BASE/api/export/pdf" -H "Content-Type: application/json" --data @/tmp/cv-payload-en.json -o /tmp/en.zip -w "http:%{http_code}\n"
cd /tmp/unzip-test && rm -rf en && mkdir en && cd en && unzip -q /tmp/en.zip && ok "EN ZIP with $(find . -name '*.pdf'|wc -l) PDFs"
en_text=$(pdftotext "$(find . -name '*.pdf'|head -1)" - 2>/dev/null | head -3 | tr '\n' ' ')
echo "    EN sample text: $en_text"

echo ""
echo "===== RESULT: PASS=$PASS FAIL=$FAIL ====="
