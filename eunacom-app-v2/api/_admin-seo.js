import fs from 'fs';
import path from 'path';

// Fallback / cached data loader for SEO & GSC analytics
export default async function seoHandler(req, res) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const adminEmail = req.query.adminEmail;

    if (!isDev && adminEmail !== 'dr.felipeyanez@gmail.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Try reading cached GSC data from src/data/gsc-data.json
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'data', 'gsc-data.json'),
      path.join(process.cwd(), 'eunacom-app-v2', 'src', 'data', 'gsc-data.json')
    ];

    let cached = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          cached = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        } catch (e) {
          console.error('[SEO Handler] Error reading file:', p, e);
        }
      }
    }

    if (!cached) {
      // Safe mock / baseline if not yet generated
      cached = {
        dates: [],
        queries: [],
        pages: [],
        updatedAt: new Date().toISOString()
      };
    }

    // Compute overview KPIs
    const dates = cached.dates || [];
    const queries = cached.queries || [];
    const pages = cached.pages || [];

    const totalClicks = dates.reduce((acc, d) => acc + (d.clicks || 0), 0);
    const totalImpressions = dates.reduce((acc, d) => acc + (d.impressions || 0), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Calculate average position weighted by impressions
    const avgPos = totalImpressions > 0 
      ? dates.reduce((acc, d) => acc + ((d.position || 0) * (d.impressions || 0)), 0) / totalImpressions
      : 0;

    // Categorize pages
    const analyzedPages = pages.map(p => {
      const url = p.keys ? p.keys[0] : '';
      const clicks = p.clicks || 0;
      const impressions = p.impressions || 0;
      const ctr = (p.ctr || 0) * 100;
      const position = p.position || 0;

      let status = 'indexed';
      let recommendation = 'Optimizar contenido y enlaces internos';

      if (position <= 10) {
        status = 'top10';
        recommendation = 'Top 10: Optimizar título y meta descripción para maximizar CTR';
      } else if (position <= 20) {
        status = 'striking_distance';
        recommendation = 'Distancia de impacto (Pos 11-20): Agregar keywords de alta frecuencia y Schema';
      }

      return {
        url,
        path: url.replace('https://www.eunacomapp.cl', '').replace('https://eunacomapp.cl', '') || '/',
        clicks,
        impressions,
        ctr: Number(ctr.toFixed(1)),
        position: Number(position.toFixed(1)),
        status,
        recommendation
      };
    }).sort((a, b) => b.impressions - a.impressions);

    // Queries categorized
    const analyzedQueries = queries.map(q => {
      const query = q.keys ? q.keys[0] : '';
      const clicks = q.clicks || 0;
      const impressions = q.impressions || 0;
      const ctr = (q.ctr || 0) * 100;
      const position = q.position || 0;

      return {
        query,
        clicks,
        impressions,
        ctr: Number(ctr.toFixed(1)),
        position: Number(position.toFixed(1))
      };
    }).sort((a, b) => b.impressions - a.impressions);

    return res.json({
      success: true,
      updatedAt: cached.updatedAt,
      kpis: {
        totalClicks,
        totalImpressions,
        avgCtr: Number(avgCtr.toFixed(2)),
        avgPosition: Number(avgPos.toFixed(1))
      },
      timeline: dates.map(d => ({
        date: d.keys ? d.keys[0] : '',
        clicks: d.clicks || 0,
        impressions: d.impressions || 0,
        ctr: Number(((d.ctr || 0) * 100).toFixed(1)),
        position: Number((d.position || 0).toFixed(1))
      })),
      pages: analyzedPages,
      queries: analyzedQueries
    });

  } catch (err) {
    console.error('[SEO Handler Error]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
