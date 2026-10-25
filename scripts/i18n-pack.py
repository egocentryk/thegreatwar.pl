# Packs months into translator groups of ~65 KB. Usage: SP=<dir> [EXCLUDE="people slugs"] python3 scripts/i18n-pack.py <prefix> <npeople> YYYY-MM [YYYY-MM ...]
import re,glob,os,sys,collections
pre,NP,months=sys.argv[1],int(sys.argv[2]),sys.argv[3:]
SP=os.environ.get('SP','/tmp/i18n')
done=set(os.environ.get("EXCLUDE","").split())
for f in glob.glob('src/content/en/*/*.md'):
    done.add(re.search(r'^source: (.*)$',open(f).read(),re.M).group(1))
tl=[];bt=[]
for ym in months:
    y,m=ym.split('-')
    tl+=sorted(glob.glob(f'src/content/timeline/{y}/{m}/*.md'))
    bt+=[f for f in glob.glob('src/content/battles/*/*.md') if re.search(rf'^startDate: {y}-{m}',open(f).read(),re.M)]
items=[f for f in tl+bt if f.split('/')[-1][:-3] not in done]
c=collections.Counter()
for f in tl+bt:
    for m in set(re.findall(r'\(/postacie/([a-z0-9-]+)\)',open(f).read())): c[m]+=1
ppl=[p for p,n in c.most_common() if p not in done][:NP]
items+=[f'src/content/postacie/{p}.md' for p in ppl]
tot=sum(os.path.getsize(f) for f in items); N=max(1,round(tot/65000))
items.sort(key=lambda f:-os.path.getsize(f))
g=[[0,[]] for _ in range(N)]
for f in items:
    b=min(g,key=lambda x:x[0]); b[0]+=os.path.getsize(f); b[1].append(f)
for i,(s,fs) in enumerate(g):
    open(f'{SP}/{pre}-{i+1}.txt','w').write('\n'.join(fs)+'\n')
print(f'{len(tl)} timeline, {len(bt)} battles, {len(ppl)} people {ppl}; {len(items)} files {tot} bytes -> {N} groups')
