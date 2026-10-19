import urllib.request, json

url = 'https://igfnlqmevjanfpcxxanh.supabase.co/rest/v1/products?select=id,name,category,is_available&limit=5'
h = {'apikey': 'sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm',
      'Authorization': 'Bearer sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm'}
r = urllib.request.Request(url, headers=h)
d = json.loads(urllib.request.urlopen(r).read())
print(f"Products returned: {len(d)}")
for p in d:
    print(f"  {p['id']} | {p['name']} | {p['category']}")
