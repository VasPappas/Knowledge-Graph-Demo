"""In-memory Chromium interaction fixture; NOT HTTP, ESM-loader or live-site verification."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json, os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('TEST_OUTPUT','/mnt/data/atlas-v03-test-output'));OUT.mkdir(parents=True,exist_ok=True)
# The environment blocks HTTP browser navigation. Test only our own files in memory,
# leaving browser policies intact. Imports/exports are removed for this fixture.
import re
seed=(ROOT/'data/knowledge.mjs').read_text().replace('export ','')
core=(ROOT/'assets/core.mjs').read_text().replace('export ','')
projection=re.sub(r'^import .*?;\n','',(ROOT/'assets/live-data-v03.mjs').read_text(),flags=re.M).replace('export ','')
app=re.sub(r'^import .*?;\n','',(ROOT/'assets/live-v03.mjs').read_text(),flags=re.M).replace('import.meta.url',"'https://fixture.invalid/assets/live-v03.mjs'")
resources={f.name:f.read_text() for f in (ROOT/'data').glob('*.json')}
fixture="const {seedNodes,seedStatements,audit}=(()=>{\n"+seed+"\nreturn {seedNodes:nodes,seedStatements:statements,audit};})();\n"+core+projection+app
html=re.sub(r'<link rel="stylesheet"[^>]*>','', (ROOT/'index.html').read_text())
html=re.sub(r'<script type="module"[^>]*></script>','',html)
html=html.replace('</head>','<style>'+(ROOT/'assets/live-v03.css').read_text()+'</style></head>')
def load(page,route='atlas'):
    page.set_content(html,wait_until='domcontentloaded')
    page.evaluate("r=>{location.hash=r}",route)
    page.evaluate("data=>{window.fetch=async url=>{const key=new URL(String(url)).pathname.split('/').pop();if(!(key in data))throw Error('Unknown fixture resource '+key);return {ok:true,status:200,json:async()=>JSON.parse(data[key])};};}",resources)
    page.add_script_tag(content='(async()=>{'+fixture+'})().catch(e=>console.error(e));')
    page.wait_for_function("document.querySelector('main h1')?.textContent !== 'Opening the atlas…'")
checks=[]
def passed(name): checks.append(name)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1100})
    errors=[]; page.on('pageerror',lambda e: errors.append(str(e)))
    requests=[]; page.on('response',lambda r: requests.append({'url':r.url,'status':r.status}))
    def go(hash='atlas'):
        page.evaluate('h=>location.hash=h',hash)
        page.wait_for_timeout(60)
        page.wait_for_selector('main h1')
        assert 'could not' not in page.locator('main h1').inner_text()
    load(page);go();assert page.locator('.realm').count()==8;assert page.locator('.journey').count()==4;assert '43 / 34' in page.locator('.coverage').inner_text();passed('home: eight regions, four journeys, correct counts')
    page.screenshot(path=str(OUT/'home-desktop.png'),full_page=True)
    page.get_by_role('link',name='Skip to content',exact=True).focus();page.keyboard.press('Enter');assert page.evaluate("document.activeElement.id")== 'main';assert page.evaluate('location.hash')=='#atlas';passed('skip link changes focus without route changes')
    page.locator('.realm[href="#topic/society"]').click();page.wait_for_selector('h1');page.locator('a[href="#topic/government"]').click();page.locator('a[href="#map/democracy"]').click();page.wait_for_selector('#graph');assert page.locator('#graph [data-node]').count()==10;assert page.locator('#graph [data-st]').count()==6;passed('Society to Government to Democracy navigation')
    page.locator('[data-st="DEM:ST:001"]').click(force=True);page.wait_for_function("location.hash.includes('DEM%3AST%3A001')");assert 'Article 21(1)' in page.locator('#inspector').inner_text();assert 'independent review pending' in page.locator('#inspector').inner_text();assert '1948-12-10' in page.locator('#inspector').inner_text();assert 'Everyone, in relation to their own country' in page.locator('#inspector').inner_text();passed('documentary inspector: source, locator, population, date, review')
    assert page.locator('#inspector a[href*="refworld.org"]').get_attribute('href').endswith('#page=4');passed('PDF source link points to page four')
    page.screenshot(path=str(OUT/'democracy-desktop.png'),full_page=True)
    for n in range(1,7):
        go(f'map/democracy?statement=DEM%3AST%3A{n:03}')
        assert 'Bounded paraphrase' in page.locator('#inspector').inner_text();assert 'How do we know?' in page.locator('#inspector').inner_text();assert page.locator('#inspector a[target="_blank"]').count()>=1
    passed('all six source-backed entries open with review label')
    assert '1919-06-04' in page.locator('#inspector').inner_text();assert 'proposed' in page.locator('#inspector').inner_text();passed('amendment proposal date remains distinct from implementation')
    go('sources');assert page.locator('main .registry-grid > section').count()==4;assert 'six attestations are not six independent sources' in page.locator('main').inner_text();passed('four sources and independence note')
    go('source/DEM%3AS%3AUDHR');assert page.locator('main .statement').count()==3;passed('UDHR source links to three distinct statements')
    go('relations');assert page.locator('.registry-card').count()==21;assert '18 candidate binary mappings and 10 held mappings' in page.locator('main').inner_text();passed('registry: 14 definitions plus 7 patterns and 18/10 audit')
    go('relations?filter=held');assert page.locator('.registry-card').count()==7;passed('unresolved pattern filter')
    go('relations/R_DOCUMENT_STATES');assert page.locator('.registry-card').count()==1;page.locator('details summary').click();assert page.locator('.statement').count()==6;passed('document_states contract exposes six example statements')
    go('map/all');assert page.locator('#graph [data-node]').count()==43;assert page.locator('#graph [data-st]').count()==34;passed('all four graph collections render')
    page.select_option('#path-from','G01');page.select_option('#path-to','L01');page.get_by_role('button',name='Find path',exact=True).click();assert '5 steps' in page.locator('#path-results').inner_text();passed('original Gravity to Love path retained')
    page.select_option('#path-mode','directed');page.get_by_role('button',name='Find path',exact=True).click();assert 'No path' in page.locator('#path-results').inner_text();passed('directed paths do not reverse edges')
    page.select_option('#path-mode','browse');page.select_option('#path-to','DEM:W:UDHR');page.get_by_role('button',name='Find path',exact=True).click();assert 'No path' in page.locator('#path-results').inner_text();passed('no invented cross-domain Democracy bridge')
    page.select_option('#path-from','DEM:W:UDHR');page.select_option('#path-to','DEM:P:PARTICIPATION');page.select_option('#path-mode','directed');page.get_by_role('button',name='Find path',exact=True).click();assert '1 step' in page.locator('#path-results').inner_text();passed('directed documentary statement path')
    page.select_option('#path-to','DEM:W:UDHR');page.get_by_role('button',name='Find path',exact=True).click();assert 'same node' in page.locator('#path-results').inner_text();passed('same-node path')
    go('map/gravitation');assert page.locator('#graph [data-node]').count()==11;page.locator('[data-st="S01"]').focus();page.keyboard.press('Enter');page.wait_for_function("location.hash.includes('S01')");assert 'Not passage-verified' in page.locator('#inspector').inner_text();assert 'No dates have been inferred' in page.locator('#inspector').inner_text();passed('legacy source boundary and keyboard edge access')
    page.screenshot(path=str(OUT/'gravity-desktop.png'),full_page=True)
    go('map/love?statement=L04S');page.get_by_text('Relation contract · held for missing roles',exact=True).click();assert 'characterization' in page.locator('#inspector').inner_text();passed('held legacy mapping not silently repaired')
    for topic in ['love','love-literature','love-practice']:
        go('map/'+topic+'?node=L01');assert page.locator('#inspector .stable-id').inner_text()=='L01';assert page.locator('#inspector .focus-route').count()==3
    passed('shared Love identity across all three lenses')
    go('map/jazz?statement=J07S');assert 'Scripted illustration' in page.locator('#inspector').inner_text();assert page.locator('.history li').count()==2;passed('scripted correction history preserved')
    go('map/all');page.fill('#statement-q','sex voting');page.get_by_role('button',name='Retrieve',exact=True).click();assert 'DEM:ST:006' in page.locator('#statement-results').inner_text();assert 'independent review pending' in page.locator('#statement-results').inner_text();passed('retrieval retains documentary attribution and review label')
    go('search?q=Constitution');assert page.locator('.topiccard').count()>=1;passed('global document search')
    go('topic/life');assert 'Not yet populated' in page.locator('main').inner_text();passed('unpopulated realms remain explicit')
    go('map/not-a-topic');assert 'not in the atlas' in page.locator('main').inner_text();passed('unknown routes fail safely')
    go('search?q=%3Cscript%3Ealert(1)%3C/script%3E');assert page.locator('script').count()==1;passed('search content escaped')
    go('about');assert 'independently verified' in page.locator('main').inner_text() or 'independent review' in page.locator('main').inner_text();passed('About records release authority and limitations')
    mobile=browser.new_page(viewport={'width':390,'height':844});mobile.on('pageerror',lambda e: errors.append(str(e)));load(mobile)
    for route in ['atlas','map/democracy?statement=DEM%3AST%3A005','relations','sources']:
        mobile.evaluate('h=>location.hash=h',route);mobile.wait_for_timeout(80);assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),route
    passed('four mobile views without horizontal overflow')
    mobile.evaluate("location.hash='map/democracy?statement=DEM%3AST%3A005'");mobile.wait_for_timeout(80);mobile.screenshot(path=str(OUT/'democracy-mobile.png'),full_page=True)
    assert not errors,errors;passed('no uncaught JavaScript runtime errors')
    fresh=browser.new_page();load(fresh,'map/democracy?statement=DEM%3AST%3A005');assert 'elector qualifications' in fresh.locator('#inspector').inner_text();passed('fresh-document deep link with in-memory fixture')
    browser.close()
result={'passed':len(checks),'failed':0,'checks':checks,'scope':'Chromium in-memory fixture: imports/exports removed and fetch stubbed with own local data. No browser policy changes. Not network, ESM-loader, live Pages or independent source verification.'}
(OUT/'browser-results.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
