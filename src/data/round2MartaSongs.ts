export interface Round2MartaSong {
  id: string;
  title: string;
  audioSrc: string;
  question: string;
}

export interface Round2MartaAlbum {
  id: string;
  text: string;
  matchesSongId: string | null;
}

export const ROUND2_MARTA_SONGS: Round2MartaSong[] = [
  {
    id: "marta-kiss-you",
    title: "Kiss You",
    audioSrc: "/audio/round2-marta/kiss-you.mp3",
    question:
      "En este tema enérgico de One Direction, el cantante promete besarte aunque te dé vergüenza y te escondas bajo las sábanas. ¿De qué álbum es?",
  },
  {
    id: "marta-one-thing",
    title: "One Thing",
    audioSrc: "/audio/round2-marta/one-thing.mp3",
    question:
      "Hit en el que repiten obsesivamente que hay una sola cosa que no pueden quitarse de la cabeza. ¿De qué álbum es?",
  },
  {
    id: "marta-perfect",
    title: "Perfect",
    audioSrc: "/audio/round2-marta/perfect.mp3",
    question:
      "Balada romántica donde le dicen a alguien que es perfecta tal como es, compuesta como regalo de cumpleaños. ¿De qué álbum es?",
  },
  {
    id: "marta-you-and-i",
    title: "You & I",
    audioSrc: "/audio/round2-marta/you-and-i.mp3",
    question:
      "Canción donde declaran que nada podrá separar a «tú y yo», con un videoclip filmado junto a acantilados y el mar. ¿De qué álbum es?",
  },
  {
    id: "marta-stockholm-syndrome",
    title: "Stockholm Syndrome",
    audioSrc: "/audio/round2-marta/stockholm-syndrome.mp3",
    question:
      "Título que nombra una condición psicológica en la que la víctima se encariña con su captor. ¿De qué álbum es?",
  },
];

export const ROUND2_MARTA_ALBUMS: Round2MartaAlbum[] = [
  {
    id: "marta-album-midnight-memories",
    text: "Midnight Memories",
    matchesSongId: "marta-you-and-i",
  },
  {
    id: "marta-album-four",
    text: "FOUR",
    matchesSongId: "marta-stockholm-syndrome",
  },
  {
    id: "marta-album-made-in-the-am",
    text: "Made in the A.M.",
    matchesSongId: "marta-perfect",
  },
  {
    id: "marta-album-up-all-night",
    text: "Up All Night",
    matchesSongId: "marta-one-thing",
  },
  {
    id: "marta-album-take-me-home",
    text: "Take Me Home",
    matchesSongId: "marta-kiss-you",
  },
  {
    id: "marta-album-flicker",
    text: "Flicker",
    matchesSongId: null,
  },
];

export const ROUND2_MARTA_CLIP_START_SECONDS = 60;
export const ROUND2_MARTA_CLIP_DURATION_SECONDS = 15;
