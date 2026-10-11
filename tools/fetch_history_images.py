"""
fetch_history_images.py - fill assets/images/history/ with real images from Wookieepedia.

Put this file in your site folder (next to index.html) or in site/tools/, then run:

    python3 fetch_history_images.py --check      # 1. test your connection to Wookieepedia
    python3 fetch_history_images.py --dry-run    # 2. show what it WOULD download, writes nothing
    python3 fetch_history_images.py --only person-trench   # 3. download ONE image as a smoke test
    python3 fetch_history_images.py              # 4. download for real
    python3 fetch_history_images.py --prune      # 5. delete old -2/-3 and unused images (asks first)

Needs Python 3.8+ and nothing else (Pillow is used for optional downscaling if installed).

For every History record it looks up one or more Wookieepedia articles, takes the
article's lead image for the slot (<id>.jpg). One image per record, no extras. Slots that already have a file are skipped (use --force to
replace). Only the records in SLOTS get an image (the site shows no image box for the rest). Records with no Wookieepedia article are filled from a thematically
close article (these are stand-ins; swap them if you prefer).

Output:
    assets/images/history/<slot>.jpg|png|webp
    assets/images/history/_sources.csv   what came from where (keep this for credit)
    assets/images/history/_missing.txt   slots it could not fill

Images are (c) Lucasfilm/Disney, taken from Wookieepedia. Fine for a fan project,
not for commercial use.
"""
import argparse, csv, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

API = "https://starwars.fandom.com/api.php"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0.0.0 Safari/537.36")
MIN_W = 480
MAX_W = 1280
DELAY = 0.4

SLOTS = {
 'mustafar': ['Mustafar', 'Separatist Council'],
 'landfall': ['Providence-class carrier/dreadnought', 'Munificent-class star frigate'],
 'person-trench': ['Trench', 'Harch'],
 'person-vexis': ['Super tactical droid', 'K2-SO'],
}

OLD_SLOTS = ['accord', 'activation', 'callings', 'christophsis', 'concealment', 'consolidation', 'continuance', 'coruscant', 'covenant', 'doc-charter', 'doc-conceal', 'doc-covenant', 'doc-emergency', 'doc-protocol', 'doc-treaty', 'era-accord', 'era-conceal', 'era-consol', 'era-continued', 'era-landfall', 'era-reassess', 'era-silences', 'final', 'fortress', 'g-anaxes', 'g-bilbringi', 'g-coop', 'g-coruscant', 'g-crisis', 'g-daala', 'g-end', 'g-endor', 'g-hyperspace', 'g-imperial', 'g-moncala', 'g-moncala2', 'g-mustafar', 'g-rull', 'g-runnina', 'g-runnina2', 'g-sector', 'g-stalemate', 'g-thrawn', 'g-vong', 'g-vongattack', 'g-vongdefeat', 'g-vongreturn', 'g-vorrum', 'hybrid', 'jump', 'landfall', 'mustafar', 'person-accord5', 'person-chiss', 'person-exiles', 'person-hemes', 'person-tambor', 'person-trench', 'person-vayle', 'person-vexis', 'place-carrivar', 'place-christophsis', 'place-cities', 'place-landing', 'place-mustafar', 'place-orbital', 'place-osseriton', 'place-outerrim', 'place-unknown', 'place-yards', 'protocol', 'reserves', 'return', 'return2', 'sanctuary', 'scan', 'silence1', 'silence2', 'survey', 'treaty', 'veil', 'works']
OLD_SLOTS = set(OLD_SLOTS) | {x + sfx for x in OLD_SLOTS for sfx in ('-2', '-3')}

BAD_NAME = re.compile(
    r"(icon|logo|symbol|signature|flag|emblem|sigil|map|chart|diagram|stub|cleanup|"
    r"disambig|wiki|banner|era[-_ ]|canon|legends|databank|holonet|timeline|sprite|"
    r"button|badge|portrait_?small|infobox|\.svg|\.gif|\.ogg|\.mp[34]|\.webm)", re.I)
EXT_FOR = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def log(*a):
    print(*a, flush=True)


def http_get(url, binary=False, tries=4):
    last = None
    for i in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json,image/*,*/*;q=0.8",
                                                   "Accept-Language": "en-US,en;q=0.9",
                                                   "Referer": "https://starwars.fandom.com/"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
                return (data, r.headers.get("Content-Type", "")) if binary else data.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(2 * (i + 1))
                continue
            raise
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            last = e
            time.sleep(2 * (i + 1))
    raise last


class Wiki:
    def __init__(self, api):
        self.api = api
        self.cache = {}

    def call(self, **p):
        p.update(format="json", formatversion="2")
        time.sleep(DELAY)
        return json.loads(http_get(self.api + "?" + urllib.parse.urlencode(p)))

    def resolve(self, q):
        """Exact title (following redirects) else top search hit. Returns title or None."""
        d = self.call(action="query", titles=q, redirects=1)
        pages = d.get("query", {}).get("pages", [])
        if pages and not pages[0].get("missing") and not pages[0].get("invalid"):
            return pages[0]["title"]
        d = self.call(action="query", list="search", srsearch=q, srlimit=1, srnamespace=0)
        hits = d.get("query", {}).get("search", [])
        return hits[0]["title"] if hits else None

    def images(self, title):
        """Ordered list of {url,w,h,name} for an article: lead image first, then the rest by size."""
        if title in self.cache:
            return self.cache[title]
        out, seen = [], set()
        d = self.call(action="query", titles=title, prop="pageimages", piprop="original|name")
        pg = (d.get("query", {}).get("pages") or [{}])[0]
        lead = pg.get("original")
        if lead and lead.get("source") and not re.search(r"\.(svg|gif)(/|\?|$)", lead["source"], re.I):
            out.append({"url": lead["source"], "w": lead.get("width", 0), "h": lead.get("height", 0),
                        "name": pg.get("pageimage", "lead")})
            seen.add(lead["source"].split("/revision/")[0])
        d = self.call(action="query", titles=title, prop="images", imlimit="max")
        files = [i["title"] for i in (d.get("query", {}).get("pages") or [{}])[0].get("images", [])
                 if not BAD_NAME.search(i["title"])]
        rest = []
        for k in range(0, len(files), 40):
            d = self.call(action="query", titles="|".join(files[k:k + 40]), prop="imageinfo",
                          iiprop="url|size|mime")
            for p in d.get("query", {}).get("pages", []):
                for ii in p.get("imageinfo", []):
                    if ii.get("mime") in EXT_FOR and ii.get("width", 0) >= MIN_W and ii.get("url"):
                        key = ii["url"].split("/revision/")[0]
                        if key not in seen:
                            seen.add(key)
                            rest.append({"url": ii["url"], "w": ii["width"], "h": ii["height"], "name": p["title"]})
        rest.sort(key=lambda x: x["w"] * x["h"], reverse=True)
        out += rest
        self.cache[title] = out
        return out


def page_url(title):
    return "https://starwars.fandom.com/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe="/_()'")


def save_image(url, dest_base):
    data, ctype = http_get(url, binary=True)
    ctype = ctype.split(";")[0].strip().lower()
    if data[:3] == b"\xff\xd8\xff":
        ctype = "image/jpeg"
    elif data[:8] == b"\x89PNG\r\n\x1a\n":
        ctype = "image/png"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        ctype = "image/webp"
    if ctype not in EXT_FOR or len(data) < 5000:
        raise ValueError("not a usable image (%s, %d bytes)" % (ctype, len(data)))
    ext = EXT_FOR[ctype]
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(data))
        im.load()
        if im.width > MAX_W:
            im = im.resize((MAX_W, int(im.height * MAX_W / im.width)))
            fmt = {"jpg": "JPEG", "png": "PNG", "webp": "WEBP"}[ext]
            if fmt == "JPEG" and im.mode != "RGB":
                im = im.convert("RGB")
            buf = io.BytesIO()
            im.save(buf, fmt, quality=82)
            data = buf.getvalue()
        im.close()
    except Exception:
        pass
    final = "%s.%s" % (dest_base, ext)
    tmp = final + ".part"
    last = None
    for i in range(8):
        try:
            with open(tmp, "wb") as f:
                f.write(data)
            os.replace(tmp, final)
            last = None
            break
        except OSError as e:
            last = e
            time.sleep(0.5 * (i + 1))
    if last:
        try:
            os.remove(tmp)
        except OSError:
            pass
        raise last
    for e in ("jpg", "jpeg", "png", "webp"):
        old = "%s.%s" % (dest_base, e)
        if old != final and os.path.exists(old):
            try:
                os.remove(old)
            except OSError:
                pass
    return final


def have(dest, slot):
    return any(os.path.exists(os.path.join(dest, "%s.%s" % (slot, e))) for e in ("jpg", "jpeg", "png", "webp"))


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    default = next((os.path.join(b, "assets", "images", "history") for b in (here, os.path.dirname(here))
                    if os.path.isdir(os.path.join(b, "assets"))), os.path.join(here, "assets", "images", "history"))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dest", default=default, help="output folder (default: %(default)s)")
    ap.add_argument("--api", default=API, help="MediaWiki api.php URL")
    ap.add_argument("--check", action="store_true", help="only test the connection, then exit")
    ap.add_argument("--dry-run", action="store_true", help="show the plan, download nothing")
    ap.add_argument("--force", action="store_true", help="replace slots that already have a file")
    ap.add_argument("--only", nargs="+", metavar="SLOT", help="only these slots, e.g. person-trench mustafar")
    ap.add_argument("--prune", action="store_true", help="delete old images this site no longer uses (-2/-3 extras and dropped records)")
    a = ap.parse_args()

    wiki = Wiki(a.api)
    if a.check:
        step = "API lookup"
        try:
            t = wiki.resolve("Trench")
            im = wiki.images(t) if t else []
            if not im:
                log("FAIL: API answered but returned no image for 'Trench'.")
                return 1
            log("API lookup OK: found article '%s' with %d image(s)." % (t, len(im)))
            step = "image download (%s)" % im[0]["url"]
            data, ct = http_get(im[0]["url"], binary=True)
            log("Image download OK (%d bytes, %s). Everything works; now run it without --check." % (len(data), ct))
            return 0
        except Exception as e:
            log("FAIL at step: %s" % step)
            log("Error:", repr(e))
            if isinstance(e, urllib.error.HTTPError):
                try:
                    log("Server said:", e.read(300).decode("utf-8", "replace").replace("\n", " "))
                except Exception:
                    pass
            log("403 on the API step = the site is refusing scripts from your connection; see the fallback in the chat.")
            log("403 on the image step only = the image host is refusing; tell Claude which step failed.")
            return 1

    os.makedirs(a.dest, exist_ok=True)
    if a.prune:
        stale = []
        for fn in sorted(os.listdir(a.dest)):
            stem, _, ext = fn.rpartition(".")
            if ext.lower() in ("jpg", "jpeg", "png", "webp") and stem in OLD_SLOTS and stem not in SLOTS:
                stale.append(fn)
        if not stale:
            log("Nothing to prune.")
            return 0
        log("These %d files are no longer used by the site:" % len(stale))
        for fn in stale:
            log("  " + fn)
        if a.dry_run or input("Delete them? type yes: ").strip().lower() != "yes":
            log("Nothing deleted.")
            return 0
        for fn in stale:
            os.remove(os.path.join(a.dest, fn))
        log("Deleted %d files." % len(stale))
        return 0
    used, rows, missing = set(), [], []
    slots = a.only or list(SLOTS)
    unknown = [s for s in slots if s not in SLOTS]
    if unknown:
        log("Unknown slot(s):", ", ".join(unknown))
        return 2
    for n, slot in enumerate(slots, 1):
        need = [slot]
        todo = [s for s in need if a.force or not have(a.dest, s)]
        if not todo:
            log("[%d/%d] %-18s already filled, skipped" % (n, len(slots), slot))
            continue
        pool = []
        try:
            for q in SLOTS[slot]:
                t = wiki.resolve(q)
                if not t:
                    continue
                for im in wiki.images(t):
                    key = im["url"].split("/revision/")[0]
                    if key not in used:
                        pool.append((t, im, key))
                if len(pool) >= len(todo) + 4:
                    break
        except Exception as e:
            log("[%d/%d] %-18s API error: %r" % (n, len(slots), slot, e))
            missing += todo
            continue
        got = 0
        for s in todo:
            done = False
            while pool and not done:
                t, im, key = pool.pop(0)
                if a.dry_run:
                    used.add(key)
                    log("[%d/%d] %-18s -> %-22s %s (%sx%s)" % (n, len(slots), slot, s, t, im["w"], im["h"]))
                    done = True
                    break
                try:
                    f = save_image(im["url"], os.path.join(a.dest, s))
                    used.add(key)
                    rows.append([s, os.path.basename(f), t, page_url(t), im["name"], im["url"]])
                    done = True
                except Exception as e:
                    log("    skipped one image for %s (%s), trying the next" % (s, str(e)[:80]))
            if done:
                got += 1
            else:
                missing.append(s)
        log("[%d/%d] %-18s %d/%d filled" % (n, len(slots), slot, got, len(todo)))

    if not a.dry_run:
        if rows:
            p = os.path.join(a.dest, "_sources.csv")
            new = not os.path.exists(p)
            with open(p, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if new:
                    w.writerow(["slot", "file", "wookieepedia_article", "article_url", "file_name", "image_url"])
                w.writerows(rows)
        every = list(slots)
        missing = [x for x in every if not have(a.dest, x)]
        with open(os.path.join(a.dest, "_missing.txt"), "w") as f:
            f.write("\n".join(missing) + ("\n" if missing else ""))
    log("\nDone. %s %d image(s); %d slot(s) left empty%s." % (
        "Would save" if a.dry_run else "Saved", len(rows) if not a.dry_run else 0, len(missing),
        "" if a.dry_run else " (listed in _missing.txt)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
