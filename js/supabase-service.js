/* =========================================================================
   ELOS IMOBILIÁRIA — Módulo Supabase CRM Service
   Integração direta com o Supabase CRM (Organização: Elos Imobiliária)
   ========================================================================= */

const SUPABASE_CONFIG = {
  url: 'https://exxankcivexqbqonizmu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eGFua2NpdmV4cWJxb25pem11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjIxNDAsImV4cCI6MjA4NDc5ODE0MH0.rMXTFACbWl7qxVZSs-6cklof6z0KBKq_6oU6O-LC-1w',
  orgId: '6c32f14b-3c60-41c1-8a31-ea943a715ba8'
};

/**
 * Formata um valor numérico para Moeda Real (R$)
 */
function formatCurrency(val) {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return 'Sob consulta';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Mapeia o status do imóvel para a aba correspondente no site
 * @param {string} status Status no banco ou tipo do imóvel
 * @returns {string} 'construcao' | 'lancamento' | 'prontos'
 */
function mapStatusToTab(status, name = '') {
  if (!status) status = '';
  const s = status.toLowerCase();
  const n = name.toLowerCase();

  if (s.includes('pronto') || s.includes('ready') || n.includes('pronto')) return 'prontos';
  if (s.includes('lança') || s.includes('lanca') || s.includes('launch') || n.includes('lança')) return 'lancamento';
  // Padrão para os em construção
  return 'construcao';
}

/**
 * Retorna o selo/tag de exibição visual com base no status do imóvel
 */
function getStatusTag(statusTab) {
  switch (statusTab) {
    case 'lancamento':
      return { class: 'tag-launch', text: 'Lançamento' };
    case 'prontos':
      return { class: 'tag-ready', text: 'Pronto para morar' };
    case 'construcao':
    default:
      return { class: 'tag-construction', text: 'Em construção' };
  }
}

/**
 * Busca todos os empreendimentos da Elos Imobiliária diretamente no Supabase CRM
 */
async function fetchSupabaseEnterprises() {
  const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/enterprises?organization_id=eq.${SUPABASE_CONFIG.orgId}&order=created_at.desc`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro Supabase (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normaliza os dados para consumo fácil no site
    return data.map(item => {
      let photos = [];
      if (Array.isArray(item.photos)) {
        photos = item.photos.filter(p => typeof p === 'string' && p.trim().length > 0);
      } else if (typeof item.photos === 'string') {
        try {
          photos = JSON.parse(item.photos);
        } catch (e) {
          photos = [item.photos];
        }
      }

      // Imagem padrão caso não haja fotos no CRM
      if (!photos || photos.length === 0) {
        photos = ['assets/img/logo-elos-header.png'];
      }

      const statusTab = mapStatusToTab(item.status, item.name);
      const statusTag = getStatusTag(statusTab);

      return {
        id: item.id,
        name: item.name || 'Empreendimento Elos',
        propertyType: item.property_type || 'Apartamento',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        priceFormatted: formatCurrency(item.price),
        areaUseful: item.area_useful ? parseFloat(item.area_useful) : null,
        bedrooms: parseInt(item.bedrooms, 10) || 0,
        bathrooms: parseInt(item.bathrooms, 10) || 0,
        parkingSpots: parseInt(item.parking_spots, 10) || 0,
        region: item.region || 'Belo Horizonte e Região - MG',
        photos: photos,
        mainPhoto: photos[0],
        pdfUrl: item.pdf_url || null,
        acceptsExchange: !!item.accepts_exchange,
        exchangeDetails: item.exchange_details || '',
        statusTab: statusTab,
        statusTag: statusTag,
        raw: item
      };
    });
  } catch (error) {
    console.error('Falha ao conectar com o Supabase CRM:', error);
    return null; // Retorna null para fallback se necessário
  }
}

// Expõe no escopo global para consumo no main.js
window.SupabaseService = {
  fetchSupabaseEnterprises,
  formatCurrency,
  getStatusTag
};
