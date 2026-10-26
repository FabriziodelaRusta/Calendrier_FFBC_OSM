import { FFBCRando } from '../types';
import { formatDateFrench } from './formatters';

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateTooltipContent(rando: FFBCRando): string {
  const distances = (rando.parcours || [])
    .map(p => p.distance_km ? `${p.distance_km} km` : null)
    .filter(Boolean);
  const distStr = distances.length > 0 ? distances.join(' · ') : '';

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; max-width: 260px;">
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${escapeHtml(rando.nom)}</div>
      <div style="color: #475569; font-size: 11px; margin-bottom: 4px;">📍 ${escapeHtml(rando.localite || rando.code_postal || 'Belgique')}</div>
      ${distStr ? `<div style="color: #2563eb; font-weight: 600; font-size: 11px;">🚴 ${distStr}</div>` : ''}
      <div style="color: #94a3b8; font-size: 10px; margin-top: 4px;">Cliquez pour voir tous les détails</div>
    </div>
  `;
}

export function generatePopupContent(rando: FFBCRando): string {
  const dateFormatted = formatDateFrench(rando.date);
  const itineraryUrl = rando.lien_itineraire || (rando.adresse ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rando.adresse)}` : null);

  const parcoursRows = (rando.parcours || []).map((p, idx) => {
    let typeBadgeColor = '#2563eb';
    let typeBg = '#eff6ff';
    const typeUpper = (p.type || '').toUpperCase();

    if (typeUpper.includes('VTT')) {
      typeBadgeColor = '#059669';
      typeBg = '#ecfdf5';
    } else if (typeUpper.includes('GRAVEL')) {
      typeBadgeColor = '#d97706';
      typeBg = '#fffbeb';
    }

    const dist = p.distance_km ? `<strong style="font-size: 14px; color: #0f172a;">${p.distance_km} km</strong>` : '<span style="color: #94a3b8;">-</span>';
    const deniv = p.denivele ? `<span style="color: #64748b; font-size: 11px;">📈 ${p.denivele} m D+</span>` : '';
    const horaire = p.horaires ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">⏰ ${escapeHtml(p.horaires)}</div>` : '';
    const ravito = p.ravitaillement ? `<span style="font-size: 11px; color: #059669; margin-left: 6px;">🍌 ${escapeHtml(p.ravitaillement)} ravito(s)</span>` : '';
    const tarif = p.tarif ? `<span style="font-size: 11px; color: #475569; margin-left: 6px;">💶 ${escapeHtml(p.tarif)}</span>` : '';

    return `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="background: ${typeBg}; color: ${typeBadgeColor}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid ${typeBadgeColor}33;">
            ${escapeHtml(p.type || 'PARCOURS')}
          </span>
          <div>${dist}</div>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
          ${deniv}
          ${ravito}
          ${tarif}
        </div>
        ${horaire}
      </div>
    `;
  }).join('');

  const linksHtml = (rando.liens_externes || [])
    .filter(l => l.url && l.url.length > 7)
    .map(l => {
      return `
        <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #2563eb; text-decoration: underline; font-weight: 500;">
          🔗 ${escapeHtml(l.libelle || 'Lien externe')}
        </a>
      `;
    }).join(' · ');

  return `
    <div class="ffbc-popup-content" style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 320px; min-width: 270px; padding: 4px 2px;">
      <!-- Header -->
      <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
        <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          ${escapeHtml(rando.province === 'France' || (rando.localite && rando.localite.toUpperCase().includes('FRANCE')) || (rando.adresse && rando.adresse.toUpperCase().includes('FRANCE')) || rando.id === '8980' || rando.id === '9664' || rando.id === '9649' || rando.id === '9908' ? 'France' : (rando.province || 'Belgique'))} · ID ${escapeHtml(rando.id)}
        </div>
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 4px 0 6px 0; line-height: 1.25;">
          ${escapeHtml(rando.nom)}
        </h3>
        <div style="font-size: 12px; color: #334155; font-weight: 500; display: flex; align-items: center; gap: 4px;">
          📅 <span>${dateFormatted}</span>
        </div>
      </div>

      <!-- Club info -->
      ${rando.club ? `
        <div style="font-size: 12px; color: #1e293b; margin-bottom: 8px; background: #f1f5f9; padding: 6px 8px; border-radius: 6px;">
          <span style="color: #64748b; font-size: 11px; display: block;">Club organisateur :</span>
          <strong>${escapeHtml(rando.club)}</strong>
        </div>
      ` : ''}

      <!-- Start Location & Address -->
      <div style="font-size: 12px; margin-bottom: 10px;">
        ${rando.lieu_depart ? `
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">
            🏁 Départ : ${escapeHtml(rando.lieu_depart)}
          </div>
        ` : ''}
        ${rando.adresse ? `
          <div style="color: #475569; font-size: 11px; line-height: 1.35;">
            📍 ${escapeHtml(rando.adresse)}
          </div>
        ` : (rando.localite ? `
          <div style="color: #475569; font-size: 11px;">
            📍 ${escapeHtml(rando.code_postal || '')} ${escapeHtml(rando.localite)}
          </div>
        ` : '')}
      </div>

      <!-- GPS Itinerary CTA button -->
      ${itineraryUrl ? `
        <div style="margin-bottom: 12px;">
          <a href="${escapeHtml(itineraryUrl)}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563eb; color: #ffffff; padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none; box-shadow: 0 1px 2px rgba(0,0,0,0.08);">
            🗺️ Ouvrir l'itinéraire GPS (Google Maps)
          </a>
        </div>
      ` : ''}

      <!-- Parcours Section -->
      ${(rando.parcours && rando.parcours.length > 0) ? `
        <div style="margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">
            Circuits & Distances (${rando.parcours.length})
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            ${parcoursRows}
          </div>
        </div>
      ` : ''}

      <!-- Remarks -->
      ${rando.remarque ? `
        <div style="font-size: 11px; color: #475569; background: #fffbeb; border: 1px solid #fde68a; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; line-height: 1.35; white-space: pre-line;">
          ℹ️ ${escapeHtml(rando.remarque)}
        </div>
      ` : ''}

      <!-- External Links -->
      ${linksHtml ? `
        <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
          ${linksHtml}
        </div>
      ` : ''}
    </div>
  `;
}
