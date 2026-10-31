/**
 * Gerador de Relatório de Debate / PDF para a Assembleia Literária
 * 
 * Cria uma janela limpa, altamente formatada no estilo neo-brutalista revolucionário
 * e pronta para impressão ou exportação para PDF (Ctrl+P / Imprimir).
 */

export function openPrintableDossier({ bookTitle, bookAuthor, highlights = [], meetingDate }) {
  const consensusList = highlights.filter(h => h.isConsensus);
  const individualList = highlights.filter(h => !h.isConsensus);
  const formattedDate = meetingDate 
    ? new Date(meetingDate).toLocaleDateString('pt-BR', { dateStyle: 'long' })
    : new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Por favor, permita popups no seu navegador para gerar o Relatório de Impressão.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dossiê Coletivo de Debate — ${bookTitle || 'Leitura Coletiva'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Lora', Georgia, serif;
      background: #FDFBF7;
      color: #1A1A1A;
      line-height: 1.6;
      padding: 30px;
    }
    .header {
      border: 3px solid #1A1A1A;
      background: #FFFFFF;
      padding: 24px;
      margin-bottom: 30px;
      box-shadow: 4px 4px 0px #1A1A1A;
    }
    .brand {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #D62828;
      margin-bottom: 8px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 900;
      line-height: 1.2;
      color: #1A1A1A;
      margin-bottom: 6px;
    }
    .subtitle {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #4A4A4A;
      margin-bottom: 16px;
    }
    .metrics {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      border-top: 2px dashed #D4A359;
      padding-top: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
    }
    .badge {
      background: #FEF08A;
      color: #111111;
      padding: 3px 8px;
      border: 1px solid #1A1A1A;
      border-radius: 4px;
    }
    .badge-red {
      background: #D62828;
      color: #FFFFFF;
    }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 900;
      color: #1A1A1A;
      margin: 28px 0 16px 0;
      padding-bottom: 6px;
      border-bottom: 2px solid #1A1A1A;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card {
      border: 2px solid #1A1A1A;
      background: #FFFFFF;
      padding: 16px 20px;
      margin-bottom: 16px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .card-consensus {
      border-left: 8px solid #D62828;
      box-shadow: 2px 2px 0px rgba(0,0,0,0.1);
    }
    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
    }
    .quote-text {
      font-size: 14px;
      font-style: italic;
      line-height: 1.6;
      background: #FEF9C3;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 10px;
      border-left: 3px solid #CA8A04;
    }
    .comrades-list {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      color: #555555;
      margin-top: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .comrade-pill {
      background: #F3F4F6;
      border: 1px solid #D1D5DB;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .comment-box {
      margin-top: 8px;
      padding: 8px;
      background: #F9FAFB;
      border-left: 3px solid #3B82F6;
      font-size: 12px;
      font-style: normal;
    }
    .no-print {
      margin-bottom: 20px;
      text-align: right;
    }
    .btn-print {
      background: #D62828;
      color: #FFFFFF;
      border: 2px solid #1A1A1A;
      padding: 10px 20px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      border-radius: 6px;
      box-shadow: 2px 2px 0px #1A1A1A;
    }
    @media print {
      body { padding: 10px; background: #FFFFFF; }
      .no-print { display: none !important; }
      .header { box-shadow: none; border-width: 1px; }
      .card { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨️ IMPRIMIR / SALVAR EM PDF ★</button>
  </div>

  <div class="header">
    <div class="brand">★ Exército da Paty — Clube do Livro Revolucionário ★</div>
    <h1 class="title">Dossiê Coletivo de Grifos & Pauta de Debate</h1>
    <p class="subtitle">Obra: <strong>${bookTitle || 'Leitura Coletiva'}</strong> — ${bookAuthor || 'Autor(a)'} | Preparado para o Encontro de ${formattedDate}</p>
    <div class="metrics">
      <span class="badge badge-red">🔥 ${consensusList.length} Consensos Revolucionários</span>
      <span class="badge">📖 ${highlights.length} Trechos Grifados no Total</span>
      <span>Documento gerado automaticamente para guiar a assembleia</span>
    </div>
  </div>

  ${consensusList.length > 0 ? `
    <h2 class="section-title">🔥 Consensos do Comitê (Trechos Grifados por 2+ Camaradas)</h2>
    ${consensusList.map(h => `
      <div class="card card-consensus">
        <div class="card-meta">
          <span>PÁGINA ${h.page || '—'}</span>
          <span class="badge badge-red">★ CONSENSO (${h.highlightedBy.length} CAMARADAS)</span>
        </div>
        <div class="quote-text">"${h.text}"</div>
        <div class="comrades-list">
          <strong>Grifado por:</strong>
          ${h.highlightedBy.map(m => `
            <span class="comrade-pill">
              ${m.name} ${m.note ? `— <em>"${m.note}"</em>` : ''}
            </span>
          `).join('')}
        </div>
        ${h.comments && h.comments.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="font-size: 11px; font-family: 'JetBrains Mono', monospace;">💬 Notas de Debate:</strong>
            ${h.comments.map(c => `
              <div class="comment-box">
                <strong>${c.authorName}:</strong> ${c.text}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  ` : ''}

  <h2 class="section-title">📖 Todos os Destaques & Passagens Ordenadas por Página</h2>
  ${highlights.length === 0 ? '<p style="font-style: italic;">Nenhum grifo cadastrado no dossiê ainda.</p>' : ''}
  ${highlights.map(h => `
    <div class="card">
      <div class="card-meta">
        <span>PÁGINA ${h.page || '—'}</span>
        ${h.isConsensus ? '<span class="badge badge-red">CONSENSO</span>' : '<span>Destaque Individual</span>'}
      </div>
      <div class="quote-text">"${h.text}"</div>
      <div class="comrades-list">
        <strong>Camaradas:</strong>
        ${h.highlightedBy.map(m => `
          <span class="comrade-pill">
            ${m.name} ${m.note ? `— <em>"${m.note}"</em>` : ''}
          </span>
        `).join('')}
      </div>
    </div>
  `).join('')}

  <footer style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #E5E7EB; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #888;">
    ★ Exército da Paty — Não vai lutar contra o fascismo? • Dossiê emitido em ${new Date().toLocaleDateString('pt-BR')} ★
  </footer>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
