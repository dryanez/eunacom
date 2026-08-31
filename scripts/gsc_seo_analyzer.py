#!/usr/bin/env python3
"""
EUNACOM - Google Search Console (GSC) SEO Growth & Analytics Engine
Pulls real search queries, clicks, impressions, CTR, and positions.
Identifies striking distance opportunities (Positions 4-15) and CTR gaps.
"""

import os
import sys
import json
import argparse
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

DEFAULT_KEY_FILE = '/Users/felipeyanez/Downloads/famed-de2c0-27e8c8ad4957.json'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

def get_gsc_service(key_path):
    if not os.path.exists(key_path):
        raise FileNotFoundError(f"Service account key not found at: {key_path}")
    credentials = service_account.Credentials.from_service_account_file(
        key_path, scopes=SCOPES
    )
    return build('searchconsole', 'v1', credentials=credentials)

def list_sites(service):
    site_list = service.sites().list().execute()
    return [s.get('siteUrl') for s in site_list.get('siteEntry', [])]

def query_search_analytics(service, site_url, days=28, row_limit=500):
    end_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d') # GSC data usually has 2-3 days lag
    start_date = (datetime.now() - timedelta(days=days + 3)).strftime('%Y-%m-%d')

    request = {
        'startDate': start_date,
        'endDate': end_date,
        'dimensions': ['query', 'page'],
        'rowLimit': row_limit
    }
    
    response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
    return response.get('rows', []), start_date, end_date

def analyze_seo(rows):
    total_clicks = sum(r.get('clicks', 0) for r in rows)
    total_impressions = sum(r.get('impressions', 0) for r in rows)
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    
    # 1. Striking Distance (Rank 4 - 15) with high impressions
    striking_distance = []
    # 2. CTR Opportunities (High impression, low CTR < 3%, pos <= 10)
    ctr_opportunities = []
    # 3. Top performing queries
    top_queries = sorted(rows, key=lambda x: x.get('clicks', 0), reverse=True)[:10]

    for r in rows:
        keys = r.get('keys', ['', ''])
        query = keys[0] if len(keys) > 0 else ''
        page = keys[1] if len(keys) > 1 else ''
        clicks = r.get('clicks', 0)
        impressions = r.get('impressions', 0)
        ctr = r.get('ctr', 0) * 100
        position = r.get('position', 0)

        item = {
            'query': query,
            'page': page,
            'clicks': clicks,
            'impressions': impressions,
            'ctr': round(ctr, 2),
            'position': round(position, 1)
        }

        if 4.0 <= position <= 15.0 and impressions >= 10:
            striking_distance.append(item)

        if position <= 10.0 and impressions >= 50 and ctr < 3.0:
            ctr_opportunities.append(item)

    striking_distance = sorted(striking_distance, key=lambda x: x['impressions'], reverse=True)[:15]
    ctr_opportunities = sorted(ctr_opportunities, key=lambda x: x['impressions'], reverse=True)[:10]

    return {
        'total_clicks': total_clicks,
        'total_impressions': total_impressions,
        'avg_ctr': round(avg_ctr, 2),
        'top_queries': top_queries,
        'striking_distance': striking_distance,
        'ctr_opportunities': ctr_opportunities
    }

def print_report(analysis, start_date, end_date, site_url):
    print(f"\n=======================================================")
    print(f"📊 EUNACOM SEO & Search Console Audit ({start_date} to {end_date})")
    print(f"🌐 Site: {site_url}")
    print(f"=======================================================")
    print(f"📈 Total Clicks: {analysis['total_clicks']:,}")
    print(f"👁️ Total Impressions: {analysis['total_impressions']:,}")
    print(f"🎯 Average CTR: {analysis['avg_ctr']}%")
    print(f"-------------------------------------------------------")

    print("\n🏆 TOP 10 QUERIES BY CLICKS:")
    for i, q in enumerate(analysis['top_queries'], 1):
        keys = q.get('keys', ['', ''])
        print(f"  {i}. \"{keys[0]}\" ➔ {q.get('clicks', 0)} clicks | {q.get('impressions', 0)} imp | Pos: {q.get('position', 0):.1f} | CTR: {q.get('ctr', 0)*100:.1f}%")

    print("\n🎯 STRIKING DISTANCE OPPORTUNITIES (Rank 4-15, High Impressions):")
    print("   (Quick wins: Optimize meta titles/H1s or add targeted medical content)")
    if not analysis['striking_distance']:
        print("   No striking distance queries found yet.")
    for item in analysis['striking_distance']:
        print(f"  • \"{item['query']}\" (Pos: {item['position']} | Imp: {item['impressions']} | Clicks: {item['clicks']})")
        print(f"    Page: {item['page']}")

    print("\n⚡ CTR GAPS (Top 10 ranking, High Impressions, Low CTR < 3%):")
    print("   (Action: Improve title click-appeal and meta description)")
    if not analysis['ctr_opportunities']:
        print("   No CTR gap issues found.")
    for item in analysis['ctr_opportunities']:
        print(f"  • \"{item['query']}\" (CTR: {item['ctr']}% | Imp: {item['impressions']} | Pos: {item['position']})")
        print(f"    Page: {item['page']}")
    print(f"=======================================================\n")

def main():
    parser = argparse.ArgumentParser(description='EUNACOM Google Search Console SEO Engine')
    parser.add_argument('--key', default=DEFAULT_KEY_FILE, help='Path to service account JSON key')
    parser.add_argument('--site', default='', help='Specific site URL (or auto-detects first site)')
    parser.add_argument('--days', type=int, default=28, help='Days range to pull (default: 28)')
    parser.add_argument('--json', action='store_true', help='Output raw JSON format')
    args = parser.parse_args()

    try:
        service = get_gsc_service(args.key)
        sites = list_sites(service)
        
        if not sites:
            print("⚠️ No sites found in Google Search Console for this service account.")
            print(f"Please add: autoantigravity@famed-de2c0.iam.gserviceaccount.com")
            print("to your property in Google Search Console (Settings > Users & Permissions).")
            sys.exit(1)
        
        target_site = args.site if args.site else sites[0]
        rows, start_date, end_date = query_search_analytics(service, target_site, days=args.days)
        analysis = analyze_seo(rows)

        if args.json:
            print(json.dumps({'site': target_site, 'range': [start_date, end_date], 'analysis': analysis}, indent=2))
        else:
            print_report(analysis, start_date, end_date, target_site)

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
