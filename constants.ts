
import { Language, VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  { 
    id: 'v1', 
    name: 'Narrador Esportivo Dinâmico', 
    description: 'Voz energética e vibrante, perfeita para gols e lances cruciais.', 
    geminiVoice: 'Kore',
    styleInstruction: 'Narrate this like a passionate sports broadcaster. Use high energy, vary your pitch for excitement, and sound naturally enthusiastic about the news.'
  },
  { 
    id: 'v2', 
    name: 'Comentarista Sério', 
    description: 'Voz profunda e autoritária para análises táticas e furos de reportagem.', 
    geminiVoice: 'Fenrir',
    styleInstruction: 'Narrate this in a professional, steady, and authoritative journalistic tone. Sound like a serious news anchor providing an exclusive report.'
  },
  { 
    id: 'v3', 
    name: 'Narrador de Suspense', 
    description: 'Voz misteriosa e pausada, ideal para teorias e segredos de bastidores.', 
    geminiVoice: 'Puck',
    styleInstruction: 'Narrate this with mystery and intrigue. Use lower tones, dramatic pauses, and a slightly conspiratorial whisper to keep the audience hooked.'
  },
  { 
    id: 'v4', 
    name: 'Voz Jovem e Rápida', 
    description: 'Estilo vloger, rápido, direto e cheio de gírias do futebol moderno.', 
    geminiVoice: 'Zephyr',
    styleInstruction: 'Narrate this in a fast-paced, casual, and friendly YouTuber style. Sound like you are talking directly to your followers in a relatable and upbeat way.'
  }
];

export const LANGUAGES = [
  Language.PORTUGUESE,
  Language.ENGLISH,
  Language.SPANISH
];

export const MAX_PART_CHARACTERS = 1800;
