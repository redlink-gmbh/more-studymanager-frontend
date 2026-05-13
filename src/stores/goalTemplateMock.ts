export const goalTemplateMOck = [
  {
    studyId: 1,
    templateId: 201,
    title: 'Wasseraufnahme (DAILY_SERVINGS)',
    participantTitle: 'Genug Wasser trinken',
    participantInfo: 'Ich trinke 5 Gläser Wasser jeden Tag.',
    type: 'DRINK_DAILY',
    categories: {
      kind: 'behavioral',
      topics: ['nutrition'],
    },
    adherenceChecks: ['morning', 'noon', 'evening'],
    properties: {
      concept: 'DAILY_SERVINGS',
      item: 'Gläser Wasser',
      quantity: 5,
      meals: ['Daily'],
      days: 7,
    },
  },
  {
    studyId: 1,
    templateId: 202,
    title: 'Gemüsekonsum (DAILY_SERVINGS)',
    participantTitle: 'Gemüse essen',
    participantInfo: 'Ich esse 3 Portionen Gemüse pro Tag.',
    type: 'EAT_DAILY',
    categories: {
      kind: 'behavioral',
      topics: ['nutrition'],
    },
    adherenceChecks: ['noon', 'evening'],
    properties: {
      concept: 'DAILY_SERVINGS',
      item: 'Portionen Gemüse',
      quantity: 3,
      meals: ['Lunch', 'Dinner'],
      days: 7,
    },
  },
  {
    studyId: 1,
    templateId: 203,
    title: 'Rauchen minimieren (AVOIDANCE_LIMIT)',
    participantTitle: 'Weniger rauchen',
    participantInfo:
      'Ich rauche weniger als 10 Zigaretten an 5 Tagen pro Woche.',
    type: 'SMOKING_LIMIT',
    categories: {
      kind: 'behavioral',
      topics: ['smoking'],
    },
    adherenceChecks: ['night'],
    properties: {
      concept: 'AVOIDANCE_LIMIT',
      behavior: 'Rauchen',
      limit: 10,
      unit: 'Zigaretten',
      days: 5,
    },
  },
];
