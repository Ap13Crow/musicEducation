"""Renders the course slide decks and covers to PNG (1600x900 / 1200x675) and
writes manifest.json for seed.mjs. Run inside the Playwright container:
    python3 -I render_slides.py <course-module> <out-dir>
"""
import base64, html, importlib.util, json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
# Course modules may import shared helpers next to them (solfege_common.py).
sys.path.insert(0, HERE)


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def data_url(path, mime):
    with open(path, 'rb') as handle:
        return f'data:{mime};base64,{base64.b64encode(handle.read()).decode()}'


FONTS = f"""
@font-face {{ font-family: 'Playfair'; src: url({data_url(os.path.join(ASSETS, 'fonts', 'playfair.woff2'), 'font/woff2')}) format('woff2'); font-weight: 400 900; }}
@font-face {{ font-family: 'Inter'; src: url({data_url(os.path.join(ASSETS, 'fonts', 'inter.woff2'), 'font/woff2')}) format('woff2'); font-weight: 100 900; }}
"""

CSS = FONTS + """
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --ink: #1c1f2b; --muted: #5b6070; --brand: #3b5bdb; --brand-soft: #e8edff; --gold: #b7791f; --paper: #fbf9f5; }
html, body { width: 1600px; height: 900px; }
body { font-family: 'Inter', sans-serif; color: var(--ink); background: var(--paper); position: relative; overflow: hidden; }
.frame { position: absolute; inset: 0; padding: 88px 110px 110px; display: flex; flex-direction: column; }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 18px; background: linear-gradient(var(--brand), #6b8cff); }
.footer { position: absolute; left: 110px; right: 110px; bottom: 44px; display: flex; justify-content: space-between; font-size: 22px; color: #9aa0ad; letter-spacing: 0.02em; }
.footer b { color: var(--brand); font-weight: 600; }
h1 { font-family: 'Playfair', serif; font-weight: 700; font-size: 74px; line-height: 1.08; letter-spacing: -0.01em; }
h2 { font-family: 'Playfair', serif; font-weight: 700; font-size: 62px; line-height: 1.1; margin-bottom: 44px; }
.kicker { font-size: 24px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 22px; }
ul.points { list-style: none; display: flex; flex-direction: column; gap: 26px; }
ul.points li { font-size: 36px; line-height: 1.32; padding-left: 52px; position: relative; }
ul.points li::before { content: ''; position: absolute; left: 6px; top: 17px; width: 18px; height: 18px; border-radius: 50%; background: var(--brand); }
ul.points.small li { font-size: 32px; }
.split { display: flex; gap: 70px; flex: 1; min-height: 0; }
.split .text { flex: 1.15; display: flex; flex-direction: column; justify-content: center; }
.split .pic { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 0; }
.pic img { max-width: 100%; max-height: 600px; border-radius: 14px; box-shadow: 0 20px 50px rgba(28,31,43,0.22); object-fit: cover; }
.credit { margin-top: 14px; font-size: 17px; color: #9aa0ad; text-align: center; max-width: 620px; }
.title-slide .text p.sub { font-size: 36px; color: var(--muted); margin-top: 28px; line-height: 1.35; }
.lead { font-size: 34px; line-height: 1.45; color: #2c3040; }
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline .row { display: flex; gap: 40px; align-items: baseline; padding: 18px 0; border-bottom: 2px solid #ece7dc; }
.timeline .row:last-child { border-bottom: 0; }
.timeline .when { flex: 0 0 230px; font-family: 'Playfair', serif; font-weight: 700; font-size: 38px; color: var(--brand); }
.timeline .what { font-size: 31px; line-height: 1.32; }
.timeline.dense .row { padding: 12px 0; }
.timeline.dense .what { font-size: 28px; }
.timeline.dense .when { font-size: 34px; }
.quote-slide { justify-content: center; align-items: flex-start; }
.quote-slide .mark { font-family: 'Playfair', serif; font-size: 220px; line-height: 0.6; color: var(--brand); opacity: 0.25; height: 110px; }
.quote-slide blockquote { font-family: 'Playfair', serif; font-size: 58px; line-height: 1.25; font-style: italic; max-width: 1280px; }
.quote-slide .by { margin-top: 40px; font-size: 28px; color: var(--muted); }
.listen .work { display: inline-block; background: var(--brand-soft); color: var(--brand); font-weight: 600; font-size: 26px; padding: 10px 22px; border-radius: 999px; margin: -20px 0 36px; }
ol.steps { list-style: none; counter-reset: step; display: flex; flex-direction: column; gap: 24px; }
ol.steps li { counter-increment: step; font-size: 33px; line-height: 1.32; padding-left: 78px; position: relative; }
ol.steps li::before { content: counter(step); position: absolute; left: 0; top: -4px; width: 52px; height: 52px; border-radius: 50%; background: var(--brand); color: white; font-weight: 600; font-size: 26px; display: flex; align-items: center; justify-content: center; }
.summary { background: linear-gradient(135deg, #ffffff 0%, #f3f5ff 100%); }
.summary h2::after { content: ''; display: block; width: 120px; height: 6px; background: var(--gold); border-radius: 3px; margin-top: 22px; }
.cover { width: 1200px; height: 675px; }
.notation { margin: 6px auto 22px; }
.notation svg { display: block; }
.abcjs-lyric, .abcjs-annotation, .abcjs-chord { font-family: 'Inter', sans-serif !important; }
.notation-text { font-size: 30px; line-height: 1.4; color: #2c3040; text-align: center; max-width: 1300px; margin: 0 auto; }
ul.points.notation-points li { font-size: 28px; }
.keyboard { position: relative; margin: 10px auto 26px; }
.keyboard .w { position: absolute; top: 0; height: 300px; background: #fff; border: 2px solid #2c3040; border-radius: 0 0 10px 10px; box-sizing: border-box; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 14px; font-size: 26px; font-weight: 600; color: #2c3040; }
.keyboard .b { position: absolute; top: 0; height: 190px; background: #22252f; border-radius: 0 0 7px 7px; z-index: 2; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 10px; box-sizing: border-box; font-size: 17px; font-weight: 600; color: #fff; text-align: center; line-height: 1.15; }
.keyboard .w.on { background: #ffe9a8; }
.keyboard .b.on { background: #3e5bd8; }
.quiz-image { display: inline-block; padding: 24px 28px 14px; background: #fff; }
"""

_ABCJS = None


def abcjs():
    global _ABCJS
    if _ABCJS is None:
        with open(os.path.join(ASSETS, 'js', 'abcjs-basic-min.js'), encoding='utf-8') as handle:
            _ABCJS = handle.read()
    return _ABCJS


def notation_script(abc_text, width, scale, measures=4):
    # Rendered synchronously into #paper (width px wide) before the screenshot
    # is taken; the music is laid out at width / scale and scaled up to fill it.
    return (f'<script>{abcjs()}</script><script>document.getElementById("paper").parentElement.style.width = "{width}px";'
            f'ABCJS.renderAbc("paper", {json.dumps(abc_text)}, '
            f'{{responsive: "resize", staffwidth: {int(width / scale)}, add_classes: true, paddingtop: 0, paddingbottom: 0, paddingleft: 0, paddingright: 0, '
            # Long melodies wrap onto several lines (about `measures` bars each).
            f'wrap: {{minSpacing: 1.6, maxSpacing: 2.6, preferredMeasuresPerLine: {measures}}}}});</script>')


def quiz_image_html(abc_text, width):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS} html, body {{ width: auto; height: auto; background: #fff; }}</style></head>'
            f'<body><div class="quiz-image"><div class="notation"><div id="paper"></div></div></div>{notation_script(abc_text, width, 2.4, 3)}</body></html>')


# The few words the templates add themselves, per course language
# (COURSE['language'], default English).
LABELS = {
    'en': {'week': 'Week', 'listen': 'Listen', 'kicker': 'First-level course'},
    'de': {'week': 'Woche', 'listen': 'Hören', 'kicker': 'Einführungskurs'},
    'fr': {'week': 'Semaine', 'listen': 'Écouter', 'kicker': "Cours d'initiation"},
}


def labels(module):
    return LABELS[module.COURSE.get('language', 'en')]


def esc(text):
    return html.escape(str(text))


def image_tag(key):
    return f'<img src="{data_url(os.path.join(ASSETS, key + ".jpg"), "image/jpeg")}" alt="">'


def footer(module, label):
    return f'<div class="footer"><span><b>mymusic.coach</b> &middot; {esc(module.FOOTER)}</span><span>{esc(label)}</span></div>'


def slide_html(module, slide, label):
    kind = slide['kind']
    if kind == 'title':
        body = f"""<div class="frame title-slide"><div class="split">
          <div class="text"><div class="kicker">{esc(slide.get('week', ''))}</div><h1>{esc(slide['title'])}</h1><p class="sub">{esc(slide.get('subtitle', ''))}</p></div>
          <div class="pic">{image_tag(slide['image'])}<div class="credit">{esc(slide.get('credit', ''))}</div></div>
        </div></div>"""
    elif kind in ('bullets', 'summary'):
        small = ' small' if len(slide['bullets']) > 4 or any(len(b) > 80 for b in slide['bullets']) else ''
        items = ''.join(f'<li>{esc(b)}</li>' for b in slide['bullets'])
        body = f"""<div class="frame {'summary' if kind == 'summary' else ''}"><h2>{esc(slide['title'])}</h2><ul class="points{small}">{items}</ul></div>"""
    elif kind == 'timeline':
        dense = ' dense' if len(slide['rows']) > 5 else ''
        rows = ''.join(f'<div class="row"><div class="when">{esc(w)}</div><div class="what">{esc(t)}</div></div>' for w, t in slide['rows'])
        body = f"""<div class="frame"><h2>{esc(slide['title'])}</h2><div class="timeline{dense}">{rows}</div></div>"""
    elif kind == 'quote':
        body = f"""<div class="frame quote-slide"><div class="mark">&ldquo;</div><blockquote>{esc(slide['quote'])}</blockquote><div class="by">&mdash; {esc(slide['by'])}</div></div>"""
    elif kind == 'image':
        body = f"""<div class="frame"><div class="split">
          <div class="text"><h2>{esc(slide['title'])}</h2><p class="lead">{esc(slide['text'])}</p></div>
          <div class="pic">{image_tag(slide['image'])}<div class="credit">{esc(slide.get('credit', ''))}</div></div>
        </div></div>"""
    elif kind == 'notation':
        scale = slide.get('scale', 2.7)
        extra = ''
        if slide.get('text'):
            extra += f'<p class="notation-text">{esc(slide["text"])}</p>'
        if slide.get('points'):
            extra += '<ul class="points small notation-points">' + ''.join(f'<li>{esc(p)}</li>' for p in slide['points']) + '</ul>'
        body = f"""<div class="frame"><h2>{esc(slide['title'])}</h2><div class="notation"><div id="paper"></div></div>{extra}</div>"""
        body += notation_script(slide['abc'], slide.get('width', 1360), scale, slide.get('measures', 4))
    elif kind == 'keyboard':
        # A piano keyboard from MIDI note `start`, `count` semitones long;
        # labels and highlights are keyed by MIDI number.
        white_w, black_w = slide.get('keyWidth', 78), 48
        keys, x = [], 0
        for m in range(slide['start'], slide['start'] + slide['count']):
            key_label = esc(slide.get('labels', {}).get(m, '')).replace('/', '<br>')
            on = ' on' if m in slide.get('highlight', []) else ''
            if m % 12 in (1, 3, 6, 8, 10):
                keys.append(f'<div class="b{on}" style="left:{x - black_w // 2}px;width:{black_w}px">{key_label}</div>')
            else:
                keys.append(f'<div class="w{on}" style="left:{x}px;width:{white_w}px">{key_label}</div>')
                x += white_w
        extra = f'<p class="notation-text">{esc(slide["text"])}</p>' if slide.get('text') else ''
        body = f"""<div class="frame"><h2>{esc(slide['title'])}</h2><div class="keyboard" style="width:{x}px;height:300px">{''.join(keys)}</div>{extra}</div>"""
    elif kind == 'listen':
        steps = ''.join(f'<li>{esc(p)}</li>' for p in slide['points'])
        body = f"""<div class="frame listen"><div class="kicker">{esc(labels(module)['listen'])}</div><h2>{esc(slide['title'])}</h2><div><span class="work">{esc(slide['work'])}</span></div><ol class="steps">{steps}</ol></div>"""
    else:
        raise ValueError(kind)
    lang = module.COURSE.get('language', 'en')
    return f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="bar"></div>{body}{footer(module, label)}</body></html>'


def cover_html(module):
    cover = module.COURSE['cover']
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}
      html, body {{ width: 1200px; height: 675px; }}
      .c {{ position: absolute; inset: 0; display: flex; }}
      .c .left {{ flex: 1.1; padding: 70px 60px 60px 80px; display: flex; flex-direction: column; justify-content: center; background: var(--paper); }}
      .c .right {{ flex: 1; position: relative; overflow: hidden; }}
      .c .right img {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }}
      .c h1 {{ font-size: 92px; }}
      .c p {{ font-size: 32px; color: var(--muted); margin-top: 18px; line-height: 1.3; }}
      .c .tag {{ display: inline-block; margin-top: 34px; background: var(--brand); color: white; font-weight: 600; font-size: 22px; padding: 10px 20px; border-radius: 999px; align-self: flex-start; }}
      .c .brand {{ position: absolute; left: 80px; bottom: 34px; font-size: 20px; color: #9aa0ad; }}
      .c .brand b {{ color: var(--brand); }}
    </style></head><body><div class="bar"></div><div class="c">
      <div class="left"><div class="kicker">{esc(cover.get('kicker') or labels(module)['kicker'])}</div><h1>{esc(cover['title'])}</h1><p>{esc(cover['subtitle'])}</p><span class="tag">{esc(cover['tag'])}</span></div>
      <div class="right">{image_tag(cover['image'])}</div>
      <div class="brand"><b>mymusic.coach</b></div>
    </div></body></html>"""


def main():
    name, out = sys.argv[1], sys.argv[2]
    module = load(name)
    os.makedirs(out, exist_ok=True)
    manifest = {'course': {k: v for k, v in module.COURSE.items() if k != 'cover'}, 'cover': 'cover.png', 'weeks': []}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1600, 'height': 900})
        cover_page = browser.new_page(viewport={'width': 1200, 'height': 675})
        quiz_page = browser.new_page(viewport={'width': 1000, 'height': 600})
        cover_page.set_content(cover_html(module), wait_until='load')
        cover_page.wait_for_timeout(200)
        cover_page.screenshot(path=os.path.join(out, 'cover.png'))
        for w, week in enumerate(module.WEEKS, start=1):
            week_out = {'title': week['title'], 'lessons': []}
            for l, lesson in enumerate(week['lessons'], start=1):
                entry = {k: v for k, v in lesson.items() if k != 'slides'}
                entry['slides'] = []
                for s, slide in enumerate(lesson.get('slides', []), start=1):
                    label = f'{labels(module)["week"]} {w} · {lesson["title"]}'
                    page.set_content(slide_html(module, slide, label), wait_until='load')
                    page.wait_for_timeout(120)
                    file = f'w{w}-l{l}-s{s}.png'
                    page.screenshot(path=os.path.join(out, file))
                    entry['slides'].append({'file': file, 'title': slide.get('title') or slide.get('quote', '')[:60]})
                # A quiz question may show notation (4th item: {'abc': ...}):
                # rendered to its own picture, shown above the answers.
                quiz = []
                for q, item in enumerate(lesson.get('quiz', []), start=1):
                    text, options, correct = item[0], item[1], item[2]
                    image = None
                    if len(item) > 3 and item[3] and item[3].get('abc'):
                        image = f'w{w}-l{l}-q{q}.png'
                        quiz_page.set_content(quiz_image_html(item[3]['abc'], item[3].get('width', 760)), wait_until='load')
                        quiz_page.wait_for_timeout(80)
                        quiz_page.locator('.quiz-image').screenshot(path=os.path.join(out, image))
                    quiz.append([text, options, correct, image])
                if quiz:
                    entry['quiz'] = quiz
                week_out['lessons'].append(entry)
            manifest['weeks'].append(week_out)
        browser.close()
    with open(os.path.join(out, 'manifest.json'), 'w') as handle:
        json.dump(manifest, handle, ensure_ascii=False, indent=1)
    images = sum(1 for w in manifest['weeks'] for l in w['lessons'] for q in l.get('quiz', []) if q[3])
    print(name, 'rendered', sum(len(l['slides']) for w in manifest['weeks'] for l in w['lessons']), 'slides', f'+ {images} quiz images' if images else '')


if __name__ == '__main__':
    main()
