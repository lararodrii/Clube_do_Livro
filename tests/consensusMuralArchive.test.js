import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isConsensusHighlight,
  filterConsensusHighlights,
  buildConsensusQuotes,
  syncConsensusToArchive,
  syncConsensusState
} from '../src/utils/consensusSync.js';

test('isConsensusHighlight identifica corretamente quando 2 ou mais camaradas grifam', () => {
  const individualHl = {
    id: 'hl-1',
    text: 'Destaque individual de uma só camarada',
    isConsensus: false,
    highlightedBy: [{ id: 'm1', name: 'Lara' }]
  };
  assert.equal(isConsensusHighlight(individualHl), false);

  const consensusHl1 = {
    id: 'hl-2',
    text: 'Passagem com 2 camaradas',
    isConsensus: true,
    highlightedBy: [{ id: 'm1', name: 'Lara' }, { id: 'm2', name: 'Stephany' }]
  };
  assert.equal(isConsensusHighlight(consensusHl1), true);

  const consensusHl2 = {
    id: 'hl-3',
    text: 'Passagem com 3 camaradas mas isConsensus ainda não recalculado',
    highlightedBy: [{ id: 'm1', name: 'Lara' }, { id: 'm2', name: 'Stephany' }, { id: 'm3', name: 'Alana' }]
  };
  assert.equal(isConsensusHighlight(consensusHl2), true);
});

test('filterConsensusHighlights filtra estritamente para o Mural apenas consensos', () => {
  const list = [
    { id: 'hl-ind-1', isConsensus: false, highlightedBy: [{ id: 'm1' }] },
    { id: 'hl-cons-1', isConsensus: true, highlightedBy: [{ id: 'm1' }, { id: 'm2' }] },
    { id: 'hl-ind-2', isConsensus: false, highlightedBy: [{ id: 'm3' }] },
    { id: 'hl-cons-2', isConsensus: true, highlightedBy: [{ id: 'm2' }, { id: 'm4' }] }
  ];

  const filtered = filterConsensusHighlights(list);
  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map(h => h.id), ['hl-cons-1', 'hl-cons-2']);
});

test('buildConsensusQuotes gera citações formatadas vinculadas ao livro e ciclo de debate', () => {
  const highlights = [
    {
      id: 'hl-1',
      page: 24,
      text: 'Passagem importante da tese',
      isConsensus: true,
      highlightedBy: [
        { id: 'm1', name: 'Lara', avatar: '/avatars/gato1.jpg' },
        { id: 'm2', name: 'Stephany', avatar: '/avatars/gato2.jpg' }
      ]
    },
    {
      id: 'hl-2',
      page: 68,
      text: 'Passagem individual',
      isConsensus: false,
      highlightedBy: [{ id: 'm1', name: 'Lara' }]
    }
  ];

  const currentReading = {
    id: 'current-democracias',
    title: 'Como as democracias morrem',
    monthYear: 'Novembro / 2026'
  };

  const meeting = {
    formattedDate: 'quarta-feira, 20:00'
  };

  const quotes = buildConsensusQuotes(highlights, currentReading, meeting);
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].bookTitle, 'Como as democracias morrem');
  assert.equal(quotes[0].debateCycle, 'Novembro / 2026');
  assert.equal(quotes[0].page, 'p. 24');
  assert.equal(quotes[0].isConsensus, true);
  assert.equal(quotes[0].highlightedBy.length, 2);
});

test('syncConsensusToArchive registra e vincula automaticamente no Acervo com histórico permanente', () => {
  const currentReading = {
    id: 'current-democracias',
    title: 'Como as democracias morrem',
    author: 'Steven Levitsky & Daniel Ziblatt',
    pages: 272,
    monthYear: 'Novembro / 2026'
  };

  const highlights = [
    {
      id: 'hl-1',
      page: 24,
      text: 'Passagem marcante',
      isConsensus: true,
      highlightedBy: [
        { id: 'm1', name: 'Lara' },
        { id: 'm2', name: 'Stephany' }
      ]
    }
  ];

  const { consensusQuotes, updatedArchive } = syncConsensusState({
    highlights,
    currentReading,
    meeting: { formattedDate: 'quarta-feira, 20:00' },
    archive: []
  });

  assert.equal(updatedArchive.length, 1);
  const archivedBook = updatedArchive[0];
  assert.equal(archivedBook.title, 'Como as democracias morrem');
  assert.equal(archivedBook.debateCycle, 'Novembro / 2026');
  assert.equal(archivedBook.quotes.length, 1);
  assert.equal(archivedBook.quotes[0].text, 'Passagem marcante');
  assert.equal(consensusQuotes.length, 1);

  // Se já existe no acervo, atualiza sem duplicar
  const secondRun = syncConsensusState({
    highlights: [
      ...highlights,
      {
        id: 'hl-2',
        page: 45,
        text: 'Segunda passagem de consenso',
        isConsensus: true,
        highlightedBy: [{ id: 'm1', name: 'Lara' }, { id: 'm3', name: 'Alana' }]
      }
    ],
    currentReading,
    meeting: { formattedDate: 'quarta-feira, 20:00' },
    archive: updatedArchive
  });

  assert.equal(secondRun.updatedArchive.length, 1, 'Não deve duplicar a entrada do livro no Acervo');
  assert.equal(secondRun.updatedArchive[0].quotes.length, 2, 'Deve manter o histórico consolidado de 2 consensos');
});
