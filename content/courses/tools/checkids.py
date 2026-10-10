import json,re,sys
lib=json.load(open(sys.argv[1]))
known={i['id']:i for v in lib.values() for i in v}
for f in sys.argv[2:]:
  s=open(f).read()
  for m in sorted(set(re.findall(r"'(cm[uv][a-z0-9]{22})'",s))):
    i=known.get(m); print(f.split('/')[-1], m, (i['title'][:60]+' | '+(i['creator'] or '')[:30]) if i else 'NOT IN library.json')
