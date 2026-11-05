"""Refresh display-only WTI spot data; never change frozen research evidence."""
import datetime as dt
import html
import json
import pathlib
import re
import urllib.request

URL = 'https://www.eia.gov/dnav/pet/hist/RWTCd.htm'
DEST = pathlib.Path(__file__).resolve().parents[1] / 'dist/wti-research/latest-wti.json'

def parse_latest(source):
    observations = []
    for row in re.findall(r'<tr\b[^>]*>(.*?)</tr>', source, re.S | re.I):
        cells = [html.unescape(re.sub('<[^>]+>', '', c)).strip() for c in re.findall(r'<td\b[^>]*>(.*?)</td>', row, re.S | re.I)]
        if len(cells) != 6:
            continue
        match = re.match(r'(\d{4})\s+([A-Za-z]{3})-\s*(\d+)\s+to', cells[0])
        if not match:
            continue
        start = dt.datetime.strptime(' '.join(match.groups()), '%Y %b %d').date()
        for offset, cell in enumerate(cells[1:]):
            if re.fullmatch(r'-?\d+(?:\.\d+)?', cell):
                date = start + dt.timedelta(days=offset)
                if date <= dt.datetime.now(dt.timezone.utc).date():
                    observations.append((date.isoformat(), float(cell)))
    if not observations:
        raise ValueError('EIA table has no dated observations')
    date, price = max(observations)
    if not -1000 < price < 10000:
        raise ValueError('Price outside validation bounds')
    release = re.search(r'(?<!Next )Release Date:\s*([\d/]+)', source)
    return dict(observation_date=date, price=price, unit='USD/barrel', series='EIA RWTC daily spot', source_url=URL, release_date=release.group(1) if release else None)

if __name__ == '__main__':
    source = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent':'OilResearchPortfolio/1.0'}), timeout=45).read().decode()
    result = parse_latest(source)
    if DEST.exists() and result['observation_date'] < json.loads(DEST.read_text())['observation_date']:
        raise ValueError('Refusing to replace newer data with older source data')
    result['checked_at'] = dt.datetime.now(dt.timezone.utc).isoformat()
    DEST.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(f"Latest published EIA WTI: {result['observation_date']} ${result['price']:.2f}")
