/* =========================================================================
   ELOS IMOBILIÁRIA — Módulo Supabase CRM Service
   Integração direta com o Supabase CRM (Organização: Elos Imobiliária)
   ========================================================================= */

const SUPABASE_CONFIG = {
  url: 'https://exxankcivexqbqonizmu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eGFua2NpdmV4cWJxb25pem11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjIxNDAsImV4cCI6MjA4NDc5ODE0MH0.rMXTFACbWl7qxVZSs-6cklof6z0KBKq_6oU6O-LC-1w',
  orgId: '6c32f14b-3c60-41c1-8a31-ea943a715ba8'
};

/* =========================================================================
   OTIMIZAÇÃO DE IMAGENS
   -------------------------------------------------------------------------
   As fotos vêm do ImgBB em tamanho original: renders em PNG de 4 a 8 MB,
   alguns em 4K. Medido em 2026-08-08 na home publicada: 61 imagens,
   **97 MB** numa única visita. É por isso que demoravam a aparecer.

   Em vez de reenviar tudo, passamos as URLs por um redimensionador
   (wsrv.nl, CDN gratuito sobre Cloudflare) que entrega WebP no tamanho
   em que a imagem realmente aparece na tela.

   Medido na mesma foto:  original 1.326 KB -> card 109 KB -> galeria 244 KB

   Para desligar (voltar a servir o original), basta `ativo: false`.
   O ideal a longo prazo é subir as fotos já otimizadas e desligar isto.
   ========================================================================= */
const IMG_CDN = {
  ativo: true,
  base: 'https://wsrv.nl/?url=',
  larguraCard: 800,    // cards da vitrine e miniaturas do hero
  larguraGaleria: 1400 // galeria da tela de detalhe
};

/**
 * Devolve a URL da imagem redimensionada. Se não for uma URL http
 * (ex.: o logo local usado como fallback), devolve inalterada.
 */
function optimizeImage(url, largura) {
  if (!IMG_CDN.ativo) return url;
  if (typeof url !== 'string' || !url.startsWith('http')) return url;
  if (url.includes('wsrv.nl')) return url;   // evita otimizar duas vezes

  const semProtocolo = url.replace(/^https?:\/\//, '');
  // `we` = without enlargement: nunca aumenta uma imagem pequena.
  return `${IMG_CDN.base}${encodeURIComponent(semProtocolo)}&w=${largura}&output=webp&q=82&we`;
}

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
 * @param {string} name Nome do imóvel
 * @param {string} constructionStatus Campo construction_status no banco (ex: 'em_construcao', 'lancamento', 'pronto')
 * @returns {string} 'construcao' | 'lancamento' | 'prontos'
 */
function mapStatusToTab(status, name = '', constructionStatus = '') {
  if (constructionStatus && typeof constructionStatus === 'string') {
    const cs = constructionStatus.toLowerCase().trim();
    if (cs.includes('pronto') || cs.includes('ready')) return 'prontos';
    if (cs.includes('lança') || cs.includes('lanca') || cs.includes('launch')) return 'lancamento';
    if (cs.includes('construc') || cs.includes('construç') || cs.includes('obra')) return 'construcao';
  }

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
  const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/enterprises?organization_id=eq.${SUPABASE_CONFIG.orgId}&or=(exibir_no_site.is.null,exibir_no_site.eq.true)&order=created_at.desc`;

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
    
    // Filtra para garantir que apenas imóveis com exibir_no_site !== false sejam exibidos
    const filteredData = data.filter(item => item.exibir_no_site !== false);
    
    // Normaliza os dados para consumo fácil no site
    return filteredData.map(item => {
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

      // Filtra fotos que sejam tabelas de preço / capturas de tela
      photos = photos.filter(p => {
        if (!p || typeof p !== 'string') return false;
        const lower = p.toLowerCase();
        if (lower.includes('captura-de-tela') || lower.includes('tabela-de-precos') || lower.includes('2026-03-25-01-41')) {
          return false;
        }
        return true;
      });

      // Imagem padrão caso não haja fotos no CRM
      if (!photos || photos.length === 0) {
        photos = ['assets/img/logo-elos-header.png'];
      }

      const statusTab = mapStatusToTab(item.status, item.name, item.construction_status);
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
        constructorName: item.constructor_name || null,
        // Redimensionadas: a galeria pede mais resolução que os cards.
        photos: photos.map(p => optimizeImage(p, IMG_CDN.larguraGaleria)),
        mainPhoto: optimizeImage(photos[0], IMG_CDN.larguraCard),
        photosOriginais: photos,   // guardadas caso precise do arquivo cheio
        pdfUrl: item.pdf_url || null,
        tableUrl: item.table_url || null,
        constructionStatus: item.construction_status || null,
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
