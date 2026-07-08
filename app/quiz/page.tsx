"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PaywallAlert } from "@/components/shared/PaywallAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Trophy,
  Clock,
  AlertCircle,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Seeded random function for consistent daily shuffles
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function() {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  const rng = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface QuizQuestion {
  id: number;
  category: "grammar" | "vocabulary" | "reading" | "listening";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  passage?: string;
  scenario?: string;
}

// Comprehensive question pool
const questionPool: QuizQuestion[] = [
  // GRAMMAR QUESTIONS (30+)
  {
    id: 1,
    category: "grammar",
    question: "The company has been operating ___ 1985.",
    options: ["since", "for", "during", "while"],
    correctAnswer: 0,
    explanation: "Use 'since' with a specific point in time (1985). 'For' is used with duration of time."
  },
  {
    id: 2,
    category: "grammar",
    question: "If I ___ known about the meeting, I would have attended.",
    options: ["have", "had", "would have", "will have"],
    correctAnswer: 1,
    explanation: "In third conditional sentences, use 'had' + past participle in the 'if' clause."
  },
  {
    id: 3,
    category: "grammar",
    question: "Neither of the candidates ___ experience in international relations.",
    options: ["have", "has", "are having", "were having"],
    correctAnswer: 1,
    explanation: "'Neither' takes a singular verb. 'Has' agrees with the singular subject."
  },
  {
    id: 4,
    category: "grammar",
    question: "___ she prefers coffee, she will often have tea in the afternoon.",
    options: ["Although", "Despite", "In spite of", "Even though"],
    correctAnswer: 0,
    explanation: "'Although' is a conjunction used to show contrast with a full clause."
  },
  {
    id: 5,
    category: "grammar",
    question: "By the time you arrive, I ___ dinner.",
    options: ["finish", "will finish", "will have finished", "have finished"],
    correctAnswer: 2,
    explanation: "Future perfect tense describes an action completed before another future action."
  },
  {
    id: 6,
    category: "grammar",
    question: "The teacher asked us ___ our homework on time.",
    options: ["to submit", "submit", "submitting", "to have submitted"],
    correctAnswer: 0,
    explanation: "'Ask' followed by an object takes an infinitive ('to submit')."
  },
  {
    id: 7,
    category: "grammar",
    question: "She insisted that he ___ the project immediately.",
    options: ["completes", "complete", "completed", "will complete"],
    correctAnswer: 1,
    explanation: "'Insist that' requires the subjunctive mood (base form) in formal English."
  },
  {
    id: 8,
    category: "grammar",
    question: "The news ___ better than expected.",
    options: ["were", "are", "was", "is"],
    correctAnswer: 2,
    explanation: "'News' is a singular noun despite ending in 's', so 'was' is correct."
  },
  {
    id: 9,
    category: "grammar",
    question: "I wish I ___ more time to study yesterday.",
    options: ["have", "had", "would have", "had had"],
    correctAnswer: 3,
    explanation: "Past wish about a completed action uses 'had had' (past perfect)."
  },
  {
    id: 10,
    category: "grammar",
    question: "___ the weather be bad, we will cancel the event.",
    options: ["Would", "Should", "If", "Were"],
    correctAnswer: 1,
    explanation: "'Should' at the beginning expresses a condition in formal English."
  },
  {
    id: 11,
    category: "grammar",
    question: "She's not interested ___ going to the party.",
    options: ["in", "at", "on", "for"],
    correctAnswer: 0,
    explanation: "'Interested in' is the correct preposition + gerund combination."
  },
  {
    id: 12,
    category: "grammar",
    question: "This is the house ___ I grew up.",
    options: ["that", "which", "where", "in which"],
    correctAnswer: 2,
    explanation: "'Where' is appropriate for a location. Both 'where' and 'in which' work."
  },
  {
    id: 13,
    category: "grammar",
    question: "I would appreciate it if you ___ me with this task.",
    options: ["help", "would help", "helped", "will help"],
    correctAnswer: 2,
    explanation: "After 'if' expressing a polite request, use the past tense."
  },
  {
    id: 14,
    category: "grammar",
    question: "The teacher ___ the students to be quiet during the test.",
    options: ["asked", "told", "said", "requested"],
    correctAnswer: 1,
    explanation: "'Told' with an object is correct for giving an instruction/order."
  },
  {
    id: 15,
    category: "grammar",
    question: "Each of the participants ___ required to submit a report.",
    options: ["is", "are", "were", "have been"],
    correctAnswer: 0,
    explanation: "'Each' is singular, so 'is' is correct."
  },
  {
    id: 16,
    category: "grammar",
    question: "I'm used to ___ early in the morning.",
    options: ["wake up", "waking up", "to wake up", "to be waking up"],
    correctAnswer: 1,
    explanation: "'Used to' (meaning accustomed to) is followed by a gerund."
  },
  {
    id: 17,
    category: "grammar",
    question: "___ of the students attended the seminar.",
    options: ["All", "Every", "Each", "Both"],
    correctAnswer: 0,
    explanation: "'All' is used with plural nouns; 'every' and 'each' are singular."
  },
  {
    id: 18,
    category: "grammar",
    question: "The more you practice, ___ you become.",
    options: ["the better", "better", "the best", "best"],
    correctAnswer: 0,
    explanation: "Comparative structures use 'the...the' format."
  },
  {
    id: 19,
    category: "grammar",
    question: "She's considering ___ her job to travel.",
    options: ["quit", "to quit", "quitting", "having quit"],
    correctAnswer: 2,
    explanation: "'Consider' is followed by a gerund, not an infinitive."
  },
  {
    id: 20,
    category: "grammar",
    question: "I haven't seen him ___ he moved to another city.",
    options: ["since", "for", "during", "until"],
    correctAnswer: 0,
    explanation: "'Since' connects a point in time to now with present perfect."
  },
  {
    id: 21,
    category: "grammar",
    question: "They would rather ___ home than go out tonight.",
    options: ["stay", "to stay", "staying", "to have stayed"],
    correctAnswer: 0,
    explanation: "'Would rather' is followed by the base verb."
  },
  {
    id: 22,
    category: "grammar",
    question: "The article discusses how ___ can improve language skills.",
    options: ["reading", "to read", "reads", "read"],
    correctAnswer: 0,
    explanation: "Gerunds function as noun subjects in sentences."
  },
  {
    id: 23,
    category: "grammar",
    question: "I cannot ___ the fact that she was wrong.",
    options: ["deny", "refuse", "reject", "decline"],
    correctAnswer: 0,
    explanation: "'Deny' is the correct word meaning to reject or not accept."
  },
  {
    id: 24,
    category: "grammar",
    question: "By next year, she ___ here for ten years.",
    options: ["will work", "will have worked", "has worked", "works"],
    correctAnswer: 1,
    explanation: "Future perfect tense for completion of an action before a future time."
  },
  {
    id: 25,
    category: "grammar",
    question: "No sooner had he arrived ___ the phone rang.",
    options: ["then", "than", "when", "as"],
    correctAnswer: 2,
    explanation: "'No sooner...than' structure uses 'when' in some dialects, but 'than' is traditional."
  },
  {
    id: 26,
    category: "grammar",
    question: "The committee ___ divided on the issue.",
    options: ["is", "are", "was", "were"],
    correctAnswer: 0,
    explanation: "Collective nouns take singular verbs in American English."
  },
  {
    id: 27,
    category: "grammar",
    question: "She behaved as if she ___ rich.",
    options: ["was", "were", "is", "be"],
    correctAnswer: 1,
    explanation: "After 'as if' expressing a hypothetical, use subjunctive mood ('were')."
  },
  {
    id: 28,
    category: "grammar",
    question: "I don't mind ___ late if necessary.",
    options: ["working", "to work", "work", "worked"],
    correctAnswer: 0,
    explanation: "'Don't mind' is followed by a gerund."
  },
  {
    id: 29,
    category: "grammar",
    question: "The reason ___ she left is unclear.",
    options: ["that", "why", "because", "for which"],
    correctAnswer: 1,
    explanation: "'Why' is the appropriate relative adverb after 'reason'."
  },
  {
    id: 30,
    category: "grammar",
    question: "She accused him ___ stealing her ideas.",
    options: ["of", "for", "about", "with"],
    correctAnswer: 0,
    explanation: "'Accuse of' is the correct collocation."
  },

  // VOCABULARY QUESTIONS (30+)
  {
    id: 31,
    category: "vocabulary",
    question: "The new policy was considered too ___.",
    options: ["lenient", "stringent", "obsolete", "relevant"],
    correctAnswer: 1,
    explanation: "'Stringent' means strict or severe, appropriate for a strict policy."
  },
  {
    id: 32,
    category: "vocabulary",
    question: "The ___ of the evidence was clear and undeniable.",
    options: ["ambiguity", "brevity", "veracity", "fragility"],
    correctAnswer: 2,
    explanation: "'Veracity' means truthfulness or accuracy."
  },
  {
    id: 33,
    category: "vocabulary",
    question: "The professor's explanation was so ___ that everyone understood immediately.",
    options: ["lucid", "obscure", "fragmented", "archaic"],
    correctAnswer: 0,
    explanation: "'Lucid' means clear and easy to understand."
  },
  {
    id: 34,
    category: "vocabulary",
    question: "His ___ nature made it impossible to trust him.",
    options: ["steadfast", "duplicitous", "genuine", "transparent"],
    correctAnswer: 1,
    explanation: "'Duplicitous' means deceitful or double-dealing."
  },
  {
    id: 35,
    category: "vocabulary",
    question: "The speaker's ___ remarks offended many in the audience.",
    options: ["tactful", "diplomatic", "caustic", "favorable"],
    correctAnswer: 2,
    explanation: "'Caustic' means bitter, sarcastic, or cutting."
  },
  {
    id: 36,
    category: "vocabulary",
    question: "What is a ___ for the word 'happy'?",
    options: ["antonym", "synonym", "homonym", "eponym"],
    correctAnswer: 1,
    explanation: "'Synonym' means a word with the same or similar meaning."
  },
  {
    id: 37,
    category: "vocabulary",
    question: "The market showed signs of ___ in the economy.",
    options: ["resurgence", "decline", "stagnation", "inflation"],
    correctAnswer: 0,
    explanation: "'Resurgence' means a strong comeback or revival."
  },
  {
    id: 38,
    category: "vocabulary",
    question: "Her ___ attitude was well-received by the team.",
    options: ["cynical", "pessimistic", "sanguine", "somber"],
    correctAnswer: 2,
    explanation: "'Sanguine' means optimistic or positive."
  },
  {
    id: 39,
    category: "vocabulary",
    question: "The journalist's ___ report exposed corruption.",
    options: ["superficial", "meticulous", "hasty", "careless"],
    correctAnswer: 1,
    explanation: "'Meticulous' means very careful and precise."
  },
  {
    id: 40,
    category: "vocabulary",
    question: "The company's ___ growth was impressive.",
    options: ["stagnant", "exponential", "minimal", "static"],
    correctAnswer: 1,
    explanation: "'Exponential' means growing at an accelerating rate."
  },
  {
    id: 41,
    category: "vocabulary",
    question: "His ___ comments lacked any sensitivity.",
    options: ["astute", "tactless", "prudent", "diplomatic"],
    correctAnswer: 1,
    explanation: "'Tactless' means lacking tact or consideration."
  },
  {
    id: 42,
    category: "vocabulary",
    question: "The storm left a ___ of destruction in its wake.",
    options: ["trail", "path", "wake", "trace"],
    correctAnswer: 2,
    explanation: "'Wake' means the track or path left behind, especially after destruction."
  },
  {
    id: 43,
    category: "vocabulary",
    question: "What does 'ubiquitous' mean?",
    options: ["rare", "present everywhere", "hidden", "mysterious"],
    correctAnswer: 1,
    explanation: "'Ubiquitous' means present or found everywhere."
  },
  {
    id: 44,
    category: "vocabulary",
    question: "The speaker's ___ voice kept the audience engaged.",
    options: ["monotonous", "melodious", "harsh", "grating"],
    correctAnswer: 1,
    explanation: "'Melodious' means sweet-sounding or musical."
  },
  {
    id: 45,
    category: "vocabulary",
    question: "What is an ___ of 'ancient'?",
    options: ["old", "modern", "historic", "primitive"],
    correctAnswer: 1,
    explanation: "'Modern' is an antonym (opposite) of 'ancient'."
  },
  {
    id: 46,
    category: "vocabulary",
    question: "The plan was too ___ to be implemented quickly.",
    options: ["simple", "elaborate", "basic", "straightforward"],
    correctAnswer: 1,
    explanation: "'Elaborate' means detailed and complex."
  },
  {
    id: 47,
    category: "vocabulary",
    question: "Her ___ fashion sense impressed everyone.",
    options: ["conventional", "eccentric", "ordinary", "standard"],
    correctAnswer: 1,
    explanation: "'Eccentric' means unconventional or unusual."
  },
  {
    id: 48,
    category: "vocabulary",
    question: "The book provided ___ insights into human behavior.",
    options: ["trivial", "superficial", "profound", "basic"],
    correctAnswer: 2,
    explanation: "'Profound' means deep, meaningful, or having great knowledge."
  },
  {
    id: 49,
    category: "vocabulary",
    question: "What does 'obfuscate' mean?",
    options: ["to clarify", "to make unclear", "to simplify", "to explain"],
    correctAnswer: 1,
    explanation: "'Obfuscate' means to deliberately make something unclear or obscure."
  },
  {
    id: 50,
    category: "vocabulary",
    question: "The team showed remarkable ___ in completing the project.",
    options: ["laziness", "diligence", "negligence", "indifference"],
    correctAnswer: 1,
    explanation: "'Diligence' means careful and persistent effort."
  },
  {
    id: 51,
    category: "vocabulary",
    question: "His ___ personality made him a great leader.",
    options: ["introverted", "charismatic", "withdrawn", "shy"],
    correctAnswer: 1,
    explanation: "'Charismatic' means compelling and attracting others."
  },
  {
    id: 52,
    category: "vocabulary",
    question: "The budget cuts were a ___ decision.",
    options: ["popular", "contentious", "unanimous", "favorable"],
    correctAnswer: 1,
    explanation: "'Contentious' means causing or likely to cause controversy."
  },
  {
    id: 53,
    category: "vocabulary",
    question: "What is a ___ story - one told by word of mouth?",
    options: ["written", "oral", "silent", "published"],
    correctAnswer: 1,
    explanation: "'Oral' refers to stories told by speaking, word of mouth."
  },
  {
    id: 54,
    category: "vocabulary",
    question: "The company's ___ practices earned them numerous awards.",
    options: ["unethical", "corrupt", "ethical", "dishonest"],
    correctAnswer: 2,
    explanation: "'Ethical' means morally correct or principled."
  },
  {
    id: 55,
    category: "vocabulary",
    question: "What does 'mitigate' mean?",
    options: ["to increase", "to lessen", "to eliminate", "to ignore"],
    correctAnswer: 1,
    explanation: "'Mitigate' means to make less severe or serious."
  },
  {
    id: 56,
    category: "vocabulary",
    question: "The ___ landscape had few trees or vegetation.",
    options: ["lush", "verdant", "barren", "fertile"],
    correctAnswer: 2,
    explanation: "'Barren' means bare or lacking vegetation."
  },
  {
    id: 57,
    category: "vocabulary",
    question: "She gave a ___ speech that moved the entire audience.",
    options: ["boring", "tedious", "eloquent", "dull"],
    correctAnswer: 2,
    explanation: "'Eloquent' means fluent and persuasive in speaking."
  },
  {
    id: 58,
    category: "vocabulary",
    question: "The agreement was ___ due to unforeseen circumstances.",
    options: ["endorsed", "validated", "nullified", "confirmed"],
    correctAnswer: 2,
    explanation: "'Nullified' means made invalid or void."
  },
  {
    id: 59,
    category: "vocabulary",
    question: "What does 'pragmatic' mean?",
    options: ["idealistic", "practical", "theoretical", "abstract"],
    correctAnswer: 1,
    explanation: "'Pragmatic' means dealing with practical rather than theoretical matters."
  },
  {
    id: 60,
    category: "vocabulary",
    question: "The weather was so ___ that the game had to be postponed.",
    options: ["pleasant", "favorable", "inclement", "mild"],
    correctAnswer: 2,
    explanation: "'Inclement' means (of weather) severe and stormy."
  },

  // READING COMPREHENSION QUESTIONS (20+)
  {
    id: 61,
    category: "reading",
    passage: "Climate change has become one of the most pressing issues of our time. Rising temperatures are causing glaciers to melt, sea levels to rise, and extreme weather events to increase. Scientists worldwide agree that human activities, particularly the burning of fossil fuels, are the primary cause of these changes. The transition to renewable energy sources is essential for mitigating these effects.",
    question: "According to the passage, what is the primary cause of climate change?",
    options: [
      "Rising sea levels",
      "Melting glaciers",
      "Human activities, particularly burning fossil fuels",
      "Extreme weather events"
    ],
    correctAnswer: 2,
    explanation: "The passage explicitly states that 'human activities, particularly the burning of fossil fuels, are the primary cause of these changes.'"
  },
  {
    id: 62,
    category: "reading",
    passage: "The Great Wall of China is one of the most impressive structures ever built. Constructed over many centuries, it spans thousands of kilometers across northern China. Originally built to protect against invasions, the wall served both defensive and trade regulation purposes. Today, it stands as a symbol of Chinese civilization and attracts millions of tourists annually.",
    question: "What were the original purposes of building the Great Wall?",
    options: [
      "Tourism and trade",
      "Defense against invasions and trade regulation",
      "Religious purposes",
      "To mark territorial boundaries"
    ],
    correctAnswer: 1,
    explanation: "The passage states the wall 'served both defensive and trade regulation purposes.'"
  },
  {
    id: 63,
    category: "reading",
    passage: "Photosynthesis is the process by which plants convert sunlight into chemical energy. This process requires three essential ingredients: carbon dioxide from the air, water from the soil, and sunlight. During photosynthesis, plants absorb CO2 and release oxygen as a byproduct. This oxygen is vital for the survival of most living organisms on Earth.",
    question: "What does photosynthesis produce that is vital for most living organisms?",
    options: [
      "Carbon dioxide",
      "Water",
      "Oxygen",
      "Sunlight"
    ],
    correctAnswer: 2,
    explanation: "The passage clearly states: 'plants absorb CO2 and release oxygen as a byproduct. This oxygen is vital for the survival of most living organisms.'"
  },
  {
    id: 64,
    category: "reading",
    passage: "Shakespeare's works have influenced literature and language more than those of any other author. His plays and sonnets introduced numerous phrases still used today. Many of his characters have become archetypes in literature, representing universal human experiences. Universities worldwide continue to study his works as central to understanding English culture and thought.",
    question: "Why are Shakespeare's works studied in universities?",
    options: [
      "To teach archaic language",
      "To entertain students",
      "Because they are central to understanding English culture and represent universal human experiences",
      "To learn about history"
    ],
    correctAnswer: 2,
    explanation: "The passage states that universities study his works 'as central to understanding English culture and thought' because his characters represent 'universal human experiences.'"
  },
  {
    id: 65,
    category: "reading",
    passage: "The development of the internet has fundamentally changed how people communicate and access information. Email replaced traditional mail for many purposes, and social media platforms created new forms of connection. Online shopping has transformed retail commerce. However, these changes have also raised concerns about privacy, security, and digital addiction.",
    question: "What concern is NOT mentioned in the passage about internet development?",
    options: [
      "Privacy concerns",
      "Security concerns",
      "Digital addiction",
      "Environmental impact"
    ],
    correctAnswer: 3,
    explanation: "The passage mentions privacy, security, and digital addiction concerns, but does not mention environmental impact."
  },
  {
    id: 66,
    category: "reading",
    passage: "Bacteria are single-celled organisms that exist everywhere on Earth. While some bacteria are harmful and cause diseases, many bacteria are beneficial. Certain bacteria in our digestive systems help us process food. Others are used in food production, such as in yogurt and cheese manufacturing.",
    question: "Which of the following is presented as a beneficial function of bacteria?",
    options: [
      "Causing diseases",
      "Producing harmful toxins",
      "Helping with food digestion and production",
      "Contaminating water supplies"
    ],
    correctAnswer: 2,
    explanation: "The passage mentions bacteria help digest food and are used in yogurt and cheese production."
  },
  {
    id: 67,
    category: "reading",
    passage: "Renewable energy sources like solar and wind power are becoming increasingly important. Unlike fossil fuels, they do not emit greenhouse gases during operation. However, the initial installation costs are significant. Once installed, they have lower operational costs than traditional power plants and can provide sustainable energy for decades.",
    question: "What is a disadvantage of renewable energy mentioned in the passage?",
    options: [
      "High operational costs",
      "Significant initial installation costs",
      "High emissions",
      "Short lifespan"
    ],
    correctAnswer: 1,
    explanation: "The passage states 'the initial installation costs are significant' as a drawback."
  },
  {
    id: 68,
    category: "reading",
    passage: "The Amazon rainforest, often called 'the lungs of the Earth,' produces approximately 20% of the world's oxygen. It is home to over 10% of all species on Earth. Deforestation threatens this ecosystem, causing species extinction and reducing the forest's ability to absorb carbon dioxide. Conservation efforts are crucial for maintaining biodiversity and fighting climate change.",
    question: "What is the main threat to the Amazon rainforest mentioned in the passage?",
    options: [
      "Animal overpopulation",
      "Deforestation",
      "Rising temperatures",
      "Ocean pollution"
    ],
    correctAnswer: 1,
    explanation: "The passage explicitly states 'Deforestation threatens this ecosystem.'"
  },
  {
    id: 69,
    category: "reading",
    passage: "Microplastics are tiny plastic particles found in oceans, soil, and even the air. They come from the breakdown of larger plastic items and from synthetic textiles. These particles have been found in human blood and organs. Scientists are concerned about potential health effects, though research is still ongoing.",
    question: "What does the passage suggest about the health effects of microplastics?",
    options: [
      "They are definitely harmful to humans",
      "They have no effect on humans",
      "They are found in humans, but effects are still being researched",
      "They only affect marine life"
    ],
    correctAnswer: 2,
    explanation: "The passage states 'Scientists are concerned about potential health effects, though research is still ongoing.'"
  },
  {
    id: 70,
    category: "reading",
    passage: "The invention of the printing press by Johannes Gutenberg in the 15th century revolutionized the spread of information. Before this invention, books were hand-copied, making them rare and expensive. The printing press allowed ideas to spread rapidly across populations. This technological advance is considered a major factor in the development of modern civilization.",
    question: "What was a consequence of the printing press invention?",
    options: [
      "It made books more expensive",
      "It slowed the spread of information",
      "It allowed ideas to spread rapidly across populations",
      "It decreased literacy rates"
    ],
    correctAnswer: 2,
    explanation: "The passage states 'The printing press allowed ideas to spread rapidly across populations.'"
  },
  {
    id: 71,
    category: "reading",
    passage: "Sleep is essential for physical and mental health. During sleep, the body repairs tissues, consolidates memories, and regulates hormones. Adults typically need 7-9 hours of quality sleep per night. Chronic sleep deprivation has been linked to obesity, diabetes, and mental health disorders. Maintaining a consistent sleep schedule is important for overall well-being.",
    question: "According to the passage, what happens to the brain during sleep?",
    options: [
      "It stops functioning",
      "It consolidates memories",
      "It produces less oxygen",
      "It only processes emotions"
    ],
    correctAnswer: 1,
    explanation: "The passage explicitly states that during sleep 'the body repairs tissues, consolidates memories, and regulates hormones.'"
  },
  {
    id: 72,
    category: "reading",
    passage: "The Rosetta Stone was discovered in Egypt in 1799 and proved instrumental in understanding ancient Egyptian hieroglyphics. It contained the same text written in three different scripts: hieroglyphic, demotic, and Greek. Scholars used the Greek portion, which they could read, to decipher the hieroglyphic text. This breakthrough opened a window to understanding an entire ancient civilization.",
    question: "Why was the Rosetta Stone important for understanding ancient Egypt?",
    options: [
      "It was made of valuable stone",
      "It told the history of Egypt",
      "It provided a key to reading hieroglyphics through comparison with readable Greek text",
      "It was very large and impressive"
    ],
    correctAnswer: 2,
    explanation: "The passage explains that scholars used the Greek portion to decipher the hieroglyphic text, which was the breakthrough."
  },
  {
    id: 73,
    category: "reading",
    passage: "Honey has been used as a sweetener and medicinal substance for thousands of years. It contains glucose and fructose, providing quick energy. Honey has antimicrobial properties and has been used traditionally to treat wounds and soothe coughs. Modern science has confirmed some traditional uses of honey, though it is still primarily used as a food ingredient.",
    question: "What traditional medicinal uses of honey are mentioned in the passage?",
    options: [
      "Treating broken bones",
      "Curing infections",
      "Treating wounds and soothing coughs",
      "Improving vision"
    ],
    correctAnswer: 2,
    explanation: "The passage specifically mentions that honey 'has been used traditionally to treat wounds and soothe coughs.'"
  },
  {
    id: 74,
    category: "reading",
    passage: "The migration of monarch butterflies is one of nature's most remarkable phenomena. Each generation that makes the journey south to Mexico is different from the previous one, yet they navigate to the exact same locations. Scientists believe this amazing feat is guided by the sun, Earth's magnetic field, and possibly inherited memory. This multi-generational migration spans thousands of kilometers.",
    question: "What is the main idea of this passage?",
    options: [
      "Monarch butterflies are colorful insects",
      "Monarch butterflies migrate long distances using multiple navigation methods across generations",
      "Mexico has many monarch butterflies",
      "Butterflies can live for many years"
    ],
    correctAnswer: 1,
    explanation: "The passage focuses on explaining the remarkable nature of monarch butterfly migration and how they navigate."
  },
  {
    id: 75,
    category: "reading",
    passage: "The Industrial Revolution transformed societies from agrarian to industrial economies. Factories replaced cottage industries, and people moved from rural areas to cities. While industrialization created wealth and modern infrastructure, it also led to poor working conditions, child labor, and environmental pollution. Reforms gradually improved working conditions, leading to modern labor laws and environmental regulations.",
    question: "What does the passage suggest about the effects of industrialization?",
    options: [
      "It had only positive effects",
      "It had only negative effects",
      "It had both positive and negative effects that were gradually addressed through reform",
      "It had no significant effects"
    ],
    correctAnswer: 2,
    explanation: "The passage presents both benefits ('created wealth and modern infrastructure') and drawbacks ('poor working conditions, child labor, pollution') that were addressed through reforms."
  },
  {
    id: 76,
    category: "reading",
    passage: "Artificial intelligence is increasingly integrated into everyday technology. AI powers recommendation algorithms on streaming platforms, enables voice assistants, and improves medical diagnostics. However, concerns exist about privacy, job displacement, and algorithmic bias. As AI continues to advance, society must address these challenges while maximizing benefits.",
    question: "What is one concern about artificial intelligence mentioned in the passage?",
    options: [
      "It is too expensive",
      "It cannot perform complex tasks",
      "Algorithmic bias and its social impacts",
      "It only works with computers"
    ],
    correctAnswer: 2,
    explanation: "The passage explicitly mentions concerns about 'privacy, job displacement, and algorithmic bias.'"
  },
  {
    id: 77,
    category: "reading",
    passage: "The concept of emotional intelligence (EQ) refers to the ability to recognize, understand, and manage emotions in oneself and others. Research shows that EQ is often more important than IQ in determining success in life and relationships. People with high emotional intelligence tend to be better communicators, leaders, and problem-solvers. Developing emotional intelligence is a lifelong process that benefits personal and professional relationships.",
    question: "According to the passage, what is one benefit of having high emotional intelligence?",
    options: [
      "Higher IQ scores",
      "Better communication skills",
      "Higher salaries",
      "Better athletic performance"
    ],
    correctAnswer: 1,
    explanation: "The passage states that people with high EQ 'tend to be better communicators, leaders, and problem-solvers.'"
  },
  {
    id: 78,
    category: "reading",
    passage: "Urban gardens have become increasingly popular in cities worldwide. They provide fresh produce in food deserts, create community spaces, and improve mental health. Additionally, they reduce urban heat, improve air quality, and create habitats for pollinators. Despite their benefits, urban gardens face challenges including limited space and access to water. Nevertheless, they represent an important movement toward sustainable city living.",
    question: "What problem do urban gardens help solve in cities?",
    options: [
      "Traffic congestion",
      "Lack of entertainment",
      "Food deserts and access to fresh produce",
      "Overpopulation"
    ],
    correctAnswer: 2,
    explanation: "The passage explicitly mentions that urban gardens 'provide fresh produce in food deserts.'"
  },

  // LISTENING COMPREHENSION QUESTIONS (20+)
  {
    id: 79,
    category: "listening",
    scenario: "A student meets with a career advisor. The advisor suggests that the student explore internship opportunities before deciding on a major. The advisor says: 'Getting real-world experience through internships will help you understand what the job is actually like, and you might discover new interests you hadn't considered in the classroom.'",
    question: "What does the advisor recommend the student do?",
    options: [
      "Quit school immediately",
      "Choose a major based on salary",
      "Explore internship opportunities",
      "Work full-time while studying"
    ],
    correctAnswer: 2,
    explanation: "The advisor clearly recommends exploring internship opportunities before deciding on a major."
  },
  {
    id: 80,
    category: "listening",
    scenario: "A doctor discusses treatment options with a patient. The doctor explains: 'While surgery is one option, let's first try the conservative approach with physical therapy and medication. Many patients find relief without needing surgery, and it's always better to start with less invasive treatments.'",
    question: "What does the doctor recommend trying first?",
    options: [
      "Immediate surgery",
      "Complete bed rest",
      "Physical therapy and medication",
      "Changing doctors"
    ],
    correctAnswer: 2,
    explanation: "The doctor specifically says 'let's first try the conservative approach with physical therapy and medication.'"
  },
  {
    id: 81,
    category: "listening",
    scenario: "A customer service representative explains to a customer: 'I understand your frustration. Unfortunately, due to warehouse issues, we cannot ship that item for two weeks. However, I can offer you a 20% discount if you're willing to wait, or I can help you find an equivalent product we have in stock.'",
    question: "What is the customer's situation?",
    options: [
      "The item is out of stock and won't be available for two weeks",
      "The item is damaged",
      "The price is too high",
      "The company is closing down"
    ],
    correctAnswer: 0,
    explanation: "The representative clearly states the item cannot be shipped for two weeks due to warehouse issues."
  },
  {
    id: 82,
    category: "listening",
    scenario: "A teacher addresses a class: 'I noticed many of you struggled with the last assignment. For the next project, I'm providing more detailed instructions and example answers. I also want you to form study groups and come to my office hours if you need help. Success on this assignment is important for understanding the next unit.'",
    question: "Why is the teacher providing extra support?",
    options: [
      "The students are lazy",
      "Many students struggled with the last assignment",
      "The teacher wants to give an easy assignment",
      "The assignment is not important"
    ],
    correctAnswer: 1,
    explanation: "The teacher explicitly says 'I noticed many of you struggled with the last assignment.'"
  },
  {
    id: 83,
    category: "listening",
    scenario: "An environmental scientist gives a presentation: 'Over the past decade, carbon emissions have increased by 15% despite renewable energy growth. The issue is that global energy consumption is also increasing, outpacing the growth of renewable sources. We need to both increase renewable energy AND reduce consumption.'",
    question: "What is the scientist's main point?",
    options: [
      "Renewable energy is growing fast enough",
      "We don't need to reduce consumption",
      "Both increasing renewables AND reducing consumption are necessary",
      "Renewable energy is not effective"
    ],
    correctAnswer: 2,
    explanation: "The scientist concludes: 'We need to both increase renewable energy AND reduce consumption.'"
  },
  {
    id: 84,
    category: "listening",
    scenario: "A project manager tells her team: 'We're behind schedule because of unexpected technical challenges. We need to prioritize which features are essential for launch and which can be included in a later update. Let's focus on quality for what we're delivering, even if it means fewer features initially.'",
    question: "What approach is the project manager suggesting?",
    options: [
      "Work longer hours to complete everything",
      "Cancel the project",
      "Prioritize essential features and deliver fewer features of higher quality",
      "Ignore the delays"
    ],
    correctAnswer: 2,
    explanation: "The manager advocates prioritizing essential features and maintaining quality over including everything."
  },
  {
    id: 85,
    category: "listening",
    scenario: "A nutritionist explains to a patient: 'Your blood tests show that you're deficient in several vitamins. This can cause fatigue and poor concentration. I recommend a diet rich in leafy greens, fruits, and whole grains. We can also discuss supplements if dietary changes aren't sufficient.'",
    question: "What is causing the patient's fatigue and poor concentration?",
    options: [
      "Overworking",
      "Vitamin deficiency",
      "Lack of sleep",
      "Too much sugar"
    ],
    correctAnswer: 1,
    explanation: "The nutritionist directly states 'Your blood tests show that you're deficient in several vitamins. This can cause fatigue and poor concentration.'"
  },
  {
    id: 86,
    category: "listening",
    scenario: "A manager conducts a performance review: 'Your technical skills are excellent, and you complete projects on time. However, I've noticed you struggle with communicating progress to the team. I want to help you improve in this area. Let's schedule monthly check-ins where you present your work to the department.'",
    question: "What does the manager identify as an area for improvement?",
    options: [
      "Technical skills",
      "Project completion time",
      "Communication of progress to the team",
      "Attendance"
    ],
    correctAnswer: 2,
    explanation: "The manager specifically mentions the employee 'struggle[s] with communicating progress to the team.'"
  },
  {
    id: 87,
    category: "listening",
    scenario: "A travel agent explains to a client: 'This time of year, flights to Europe are 40% cheaper due to off-season pricing. However, you'll experience shorter daylight hours and colder weather. If you prefer better weather, I'd recommend traveling in spring, though prices will be higher.'",
    question: "What trade-off is the travel agent presenting?",
    options: [
      "Better hotels vs. cheaper flights",
      "Long flights vs. short flights",
      "Cheaper prices in winter vs. better weather in spring",
      "International flights vs. domestic flights"
    ],
    correctAnswer: 2,
    explanation: "The agent presents winter as having 'cheaper flights' but 'shorter daylight hours and colder weather,' compared to spring with better weather but higher prices."
  },
  {
    id: 88,
    category: "listening",
    scenario: "A university advisor discusses a student's course schedule: 'I notice you've registered for five advanced courses next semester, plus you mentioned working part-time. That's a heavy load, and I'm concerned about your ability to succeed in all of them. Let me help you create a more balanced schedule.'",
    question: "What is the advisor concerned about?",
    options: [
      "The student doesn't have any courses",
      "The student won't have enough time to succeed with this schedule",
      "The student doesn't have a job",
      "The courses are too easy"
    ],
    correctAnswer: 1,
    explanation: "The advisor explicitly states 'I'm concerned about your ability to succeed' with the current course load."
  },
  {
    id: 89,
    category: "listening",
    scenario: "A software developer in a meeting says: 'The current system can't scale to handle the increased user load we're expecting. We have three options: rewrite it from scratch, gradually refactor the existing code, or switch to a cloud-based solution. Each has trade-offs in terms of time, cost, and risk.'",
    question: "What is the developer's main concern?",
    options: [
      "The system has too many users",
      "The system cannot scale to handle increased user load",
      "The system is too expensive",
      "The system is outdated"
    ],
    correctAnswer: 1,
    explanation: "The developer opens with 'The current system can't scale to handle the increased user load.'"
  },
  {
    id: 90,
    category: "listening",
    scenario: "A fitness trainer tells a new client: 'Your goal is great, but we need to build a foundation first. I recommend we start with three sessions per week, focusing on proper form and gradually increasing intensity. Rushing into intense workouts could result in injury. Trust the process, and you'll see results in 8-12 weeks.'",
    question: "What is the trainer's main advice?",
    options: [
      "Work out seven days a week",
      "Immediately start intense workouts",
      "Build a foundation gradually with proper form before increasing intensity",
      "Skip rest days"
    ],
    correctAnswer: 2,
    explanation: "The trainer advises building a foundation first with proper form and gradual intensity increases to avoid injury."
  },
  {
    id: 91,
    category: "listening",
    scenario: "A researcher presents findings: 'Our study found that students who take breaks every 25-30 minutes have better retention and focus than those who study continuously for hours. The breaks don't need to be long, just 5-10 minutes of physical activity or rest.'",
    question: "What does the research suggest about studying?",
    options: [
      "Study for 8 hours straight",
      "Never take breaks",
      "Regular short breaks improve retention and focus",
      "Taking breaks wastes time"
    ],
    correctAnswer: 2,
    explanation: "The researcher states 'students who take breaks every 25-30 minutes have better retention and focus.'"
  },
  {
    id: 92,
    category: "listening",
    scenario: "A climate scientist explains: 'The rate of polar ice melt has accelerated significantly in the past two decades. This melting contributes to rising sea levels, which threatens coastal communities. We're also seeing changes in ocean currents and weather patterns as a result.'",
    question: "What is a consequence of polar ice melting mentioned by the scientist?",
    options: [
      "Lower ocean temperatures",
      "Rising sea levels and threats to coastal communities",
      "More winter snow",
      "Lower humidity"
    ],
    correctAnswer: 1,
    explanation: "The scientist explicitly mentions 'This melting contributes to rising sea levels, which threatens coastal communities.'"
  },
  {
    id: 93,
    category: "listening",
    scenario: "An HR manager addresses employees: 'We're implementing a new flexible work policy. Starting next month, all employees can work from home up to three days per week. We believe this will improve work-life balance while maintaining productivity. We'll monitor the results and adjust if needed.'",
    question: "What is the new flexible work policy?",
    options: [
      "Everyone must work from home full-time",
      "Employees can work from home up to three days per week",
      "There is no remote work allowed",
      "Employees must choose to be fully remote or fully in-office"
    ],
    correctAnswer: 1,
    explanation: "The manager clearly states 'all employees can work from home up to three days per week.'"
  },
  {
    id: 94,
    category: "listening",
    scenario: "A museum curator discusses an exhibition: 'This exhibit showcases artwork from the Renaissance period. What makes it special is that we have pieces from different regions - Italian, Flemish, and Spanish - showing how art developed differently while influencing each other. Visitors will see both similarities and unique characteristics.'",
    question: "What does the exhibition focus on?",
    options: [
      "Modern art only",
      "Italian art exclusively",
      "Renaissance art from different regions and their influences on each other",
      "Ancient Greek art"
    ],
    correctAnswer: 2,
    explanation: "The curator explains the exhibit shows artwork 'from different regions - Italian, Flemish, and Spanish - showing how art developed differently while influencing each other.'"
  },
  {
    id: 95,
    category: "listening",
    scenario: "A restaurant manager trains new staff: 'Customer service is our priority. Always greet customers within 30 seconds, listen to their needs carefully, and remember that mistakes can be fixed with quick action and a genuine apology. If a customer is unhappy, find me immediately so we can resolve it right away.'",
    question: "What principle does the manager emphasize?",
    options: [
      "Speed is more important than accuracy",
      "Money is the most important thing",
      "Customer satisfaction and quick resolution of issues are priorities",
      "Always tell customers they are wrong"
    ],
    correctAnswer: 2,
    explanation: "The manager prioritizes 'customer service' and emphasizes resolving problems quickly with 'quick action and a genuine apology.'"
  },
  {
    id: 96,
    category: "listening",
    scenario: "A financial advisor tells a client: 'Your emergency fund should cover three to six months of living expenses. Right now, you don't have enough saved. I recommend we start by reducing discretionary spending and building this fund before investing in stocks. Once you have adequate emergency savings, we can discuss investment strategies.'",
    question: "What does the advisor recommend doing first?",
    options: [
      "Invest all money in stocks",
      "Buy real estate",
      "Build an emergency fund of 3-6 months of expenses",
      "Spend all current savings"
    ],
    correctAnswer: 2,
    explanation: "The advisor explicitly recommends building the emergency fund 'before investing in stocks.'"
  },
  {
    id: 97,
    category: "listening",
    scenario: "A teacher parent in a conference: 'Your child is intelligent and curious, but sometimes lacks focus in class. I've noticed he does better when he's engaged with hands-on activities. I recommend we create a plan together to help him channel his energy productively. This might include classroom accommodations and strategies at home.'",
    question: "What does the teacher suggest about the student's learning style?",
    options: [
      "The student is not intelligent",
      "The student learns better with hands-on, engaging activities",
      "The student should be disciplined more",
      "The student doesn't like school"
    ],
    correctAnswer: 1,
    explanation: "The teacher observes that the student 'does better when he's engaged with hands-on activities.'"
  },
  {
    id: 98,
    category: "listening",
    scenario: "A librarian helps a student: 'For your research paper on climate change, these peer-reviewed journal articles will be more reliable than general websites. This database searches scholarly sources specifically. I can also show you how to evaluate sources for credibility and bias. Come back if you need help finding more specific information.'",
    question: "What does the librarian recommend for the student's research?",
    options: [
      "Using only Wikipedia",
      "Using any website found on Google",
      "Using peer-reviewed journal articles and scholarly sources",
      "Not doing research at all"
    ],
    correctAnswer: 2,
    explanation: "The librarian specifically recommends 'peer-reviewed journal articles' as more reliable than general websites."
  },
  {
    id: 99,
    category: "listening",
    scenario: "A city planner presents to a community: 'We're proposing a new public transit system that will reduce traffic congestion and emissions. It will require tax increases, but analysis shows it will save commuters money on gas and parking. The system will take five years to complete, with most benefits realized after that.'",
    question: "What is a benefit of the proposed transit system?",
    options: [
      "Immediate cost reduction for everyone",
      "No tax increases",
      "Reduced traffic and emissions, with long-term cost savings",
      "Completed within six months"
    ],
    correctAnswer: 2,
    explanation: "The planner mentions the system will 'reduce traffic congestion and emissions' and save 'commuters money on gas and parking.'"
  },
  {
    id: 100,
    category: "listening",
    scenario: "A therapist tells a patient: 'Your anxiety seems to increase when you're overcommitted. We've discussed the importance of setting boundaries and saying no to some requests. This week, I want you to practice declining one thing you would normally say yes to. You can start small and build from there. This is essential for your mental health.'",
    question: "What does the therapist ask the patient to do this week?",
    options: [
      "Accept every request",
      "Quit their job",
      "Practice declining one commitment",
      "Cut off all friendships"
    ],
    correctAnswer: 2,
    explanation: "The therapist asks the patient to 'practice declining one thing you would normally say yes to.'"
  },
];

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  timeRemaining: number;
  quizStarted: boolean;
  showResults: boolean;
  dailyQuestions: QuizQuestion[];
}

export default function DailyQuizPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasAccess } = useSubscription();
  const router = useRouter();

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    timeRemaining: 10 * 60,
    quizStarted: false,
    showResults: false,
    dailyQuestions: [],
  });

  const [dailyStreak, setDailyStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animateScore, setAnimateScore] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Separate auth effect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user && !subLoading) {
      if (!hasAccess("quiz")) {
        setShowPaywall(true);
        setLoading(false);
        return;
      }
      initializeQuiz();
      setLoading(false);
    }
  }, [authLoading, user, subLoading, hasAccess]);

  const initializeQuiz = () => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = shuffleWithSeed(questionPool, today);
    const dailyQuestions = filtered.slice(0, 15);

    setQuizState((prev) => ({
      ...prev,
      dailyQuestions,
      selectedAnswers: new Array(15).fill(null),
    }));

    // Simulate streak (in real app, fetch from database)
    setDailyStreak(Math.floor(Math.random() * 30) + 1);
  };

  // Timer effect - only runs during active quiz
  useEffect(() => {
    if (!quizState.quizStarted || quizState.showResults) return;

    const interval = setInterval(() => {
      setQuizState((prev) => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          handleSubmitQuiz();
          return prev;
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.quizStarted, quizState.showResults]);

  const handleStartQuiz = () => {
    setQuizState((prev) => ({
      ...prev,
      quizStarted: true,
      timeRemaining: 10 * 60,
    }));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...quizState.selectedAnswers];
    newAnswers[quizState.currentQuestionIndex] = answerIndex;
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: newAnswers,
    }));
  };

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.dailyQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const handleSubmitQuiz = () => {
    setQuizState((prev) => ({
      ...prev,
      quizStarted: false,
      showResults: true,
    }));
    setAnimateScore(true);
  };

  const handleRetakeQuiz = () => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = shuffleWithSeed(questionPool, today);
    const dailyQuestions = filtered.slice(0, 15);

    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: new Array(15).fill(null),
      timeRemaining: 10 * 60,
      quizStarted: false,
      showResults: false,
      dailyQuestions,
    });
    setAnimateScore(false);
  };

  if (authLoading || subLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (showPaywall) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <PaywallAlert isOpen={showPaywall} feature="Practice Tests" plan="pro" onClose={() => setShowPaywall(false)} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const { currentQuestionIndex, selectedAnswers, timeRemaining, quizStarted, showResults, dailyQuestions } = quizState;

  // Quiz start screen
  if (!quizStarted && !showResults) {
    const categoryBreakdown = {
      grammar: dailyQuestions.filter((q) => q.category === "grammar").length,
      vocabulary: dailyQuestions.filter((q) => q.category === "vocabulary").length,
      reading: dailyQuestions.filter((q) => q.category === "reading").length,
      listening: dailyQuestions.filter((q) => q.category === "listening").length,
    };

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />

        <main className="flex-1 py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-primary/10">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Daily Challenge</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Today&apos;s Quiz</h1>
              <p className="text-lg text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            <Card className="premium-card mb-8 scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Your Daily Streak</CardTitle>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient">{dailyStreak}</div>
                    <p className="text-sm text-muted-foreground">days</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="premium-card mb-8">
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
                <CardDescription>Mixed category quiz with adaptive difficulty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">{dailyQuestions.length}</p>
                    <p className="text-sm text-muted-foreground">Questions</p>
                  </div>
                  <div className="p-4 bg-chart-2/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-chart-2">10</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                  <div className="p-4 bg-chart-3/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-chart-3">{dailyQuestions.length * 4}</p>
                    <p className="text-sm text-muted-foreground">Max Points</p>
                  </div>
                  <div className="p-4 bg-chart-4/5 rounded-lg text-center">
                    <p className="text-2xl font-bold text-chart-4">Daily</p>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-4">Category Breakdown</p>
                  <div className="space-y-3">
                    {(
                      [
                        { name: "Grammar", count: categoryBreakdown.grammar, color: "bg-primary" },
                        { name: "Vocabulary", count: categoryBreakdown.vocabulary, color: "bg-chart-2" },
                        { name: "Reading", count: categoryBreakdown.reading, color: "bg-chart-3" },
                        { name: "Listening", count: categoryBreakdown.listening, color: "bg-chart-4" },
                      ] as const
                    ).map((cat) => (
                      <div key={cat.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{cat.name}</span>
                          <span className="text-sm text-muted-foreground">{cat.count} questions</span>
                        </div>
                        <div className="w-full bg-secondary/20 rounded-full h-2">
                          <div
                            className={`${cat.color} h-2 rounded-full`}
                            style={{ width: `${(cat.count / dailyQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-primary/50 bg-primary/5">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-primary ml-2">
                    This is the same quiz for all users today. Your questions will change tomorrow!
                  </AlertDescription>
                </Alert>

                <Button onClick={handleStartQuiz} className="w-full h-12 text-lg bg-gradient-to-r from-primary to-chart-2">
                  Start Daily Quiz
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Quiz in progress
  if (quizStarted) {
    const currentQuestion = dailyQuestions[currentQuestionIndex];
    const answered = selectedAnswers.filter((a) => a !== null).length;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const isTimeRunningOut = timeRemaining < 120;

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />

        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Daily Quiz</h1>
                <div
                  className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                    isTimeRunningOut ? "bg-destructive/20 text-destructive animate-pulse" : "bg-primary/10 text-primary"
                  }`}
                >
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {dailyQuestions.length}
                </span>
                <span className="text-sm text-muted-foreground">{answered} answered</span>
              </div>

              <div className="w-full bg-secondary/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-chart-2 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / dailyQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card className="premium-card mb-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Badge variant="outline" className="capitalize">
                    {currentQuestion.category}
                  </Badge>
                </div>

                {currentQuestion.passage && (
                  <div className="bg-muted/50 p-4 rounded-lg mb-6 border border-muted">
                    <p className="text-sm text-muted-foreground italic">{currentQuestion.passage}</p>
                  </div>
                )}

                {currentQuestion.scenario && (
                  <div className="bg-muted/50 p-4 rounded-lg mb-6 border border-muted">
                    <p className="text-sm text-muted-foreground italic">{currentQuestion.scenario}</p>
                  </div>
                )}

                <h2 className="text-xl md:text-2xl font-bold mb-6">{currentQuestion.question}</h2>

                <RadioGroup
                  value={selectedAnswers[currentQuestionIndex]?.toString() || ""}
                  onValueChange={(val) => handleAnswerSelect(parseInt(val))}
                >
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === dailyQuestions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={answered !== dailyQuestions.length}
                  className="bg-gradient-to-r from-primary to-chart-2 gap-2"
                >
                  Submit Quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const correctAnswers = dailyQuestions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
    const scorePercentage = Math.round((correctAnswers / dailyQuestions.length) * 100);

    const categoryResults = {
      grammar: {
        total: dailyQuestions.filter((q) => q.category === "grammar").length,
        correct: dailyQuestions.filter(
          (q, idx) => q.category === "grammar" && selectedAnswers[idx] === q.correctAnswer
        ).length,
      },
      vocabulary: {
        total: dailyQuestions.filter((q) => q.category === "vocabulary").length,
        correct: dailyQuestions.filter(
          (q, idx) => q.category === "vocabulary" && selectedAnswers[idx] === q.correctAnswer
        ).length,
      },
      reading: {
        total: dailyQuestions.filter((q) => q.category === "reading").length,
        correct: dailyQuestions.filter(
          (q, idx) => q.category === "reading" && selectedAnswers[idx] === q.correctAnswer
        ).length,
      },
      listening: {
        total: dailyQuestions.filter((q) => q.category === "listening").length,
        correct: dailyQuestions.filter(
          (q, idx) => q.category === "listening" && selectedAnswers[idx] === q.correctAnswer
        ).length,
      },
    };

    const wrongAnswers = dailyQuestions.filter((q, idx) => selectedAnswers[idx] !== q.correctAnswer);

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />

        <main className="flex-1 py-12 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            {/* Score Card */}
            <Card className="premium-card mb-8 scale-in">
              <CardContent className="p-8 md:p-12 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-chart-3" />
                <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
                <p className="text-muted-foreground mb-8">Here are your results:</p>

                <div className={`mb-8 ${animateScore ? "animate-in" : ""}`}>
                  <div className="text-7xl font-bold text-gradient mb-2">{scorePercentage}%</div>
                  <p className="text-lg text-muted-foreground">
                    {correctAnswers} out of {dailyQuestions.length} correct
                  </p>
                </div>

                {scorePercentage >= 80 && (
                  <Alert className="mb-6 border-green-500/50 bg-green-500/5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700 ml-2">
                      Excellent work! You scored above 80%. Keep up the great practice!
                    </AlertDescription>
                  </Alert>
                )}
                {scorePercentage < 80 && scorePercentage >= 60 && (
                  <Alert className="mb-6 border-blue-500/50 bg-blue-500/5">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700 ml-2">
                      Good effort! Review the explanations and try again tomorrow to improve your score.
                    </AlertDescription>
                  </Alert>
                )}
                {scorePercentage < 60 && (
                  <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/5">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-700 ml-2">
                      Keep practicing! Come back tomorrow for a fresh quiz to improve your skills.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="premium-card mb-8">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  [
                    { name: "Grammar", ...categoryResults.grammar, color: "bg-primary" },
                    { name: "Vocabulary", ...categoryResults.vocabulary, color: "bg-chart-2" },
                    { name: "Reading", ...categoryResults.reading, color: "bg-chart-3" },
                    { name: "Listening", ...categoryResults.listening, color: "bg-chart-4" },
                  ] as const
                ).map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {cat.correct}/{cat.total}
                      </span>
                    </div>
                    <div className="w-full bg-secondary/20 rounded-full h-2">
                      <div
                        className={`${cat.color} h-2 rounded-full`}
                        style={{ width: `${(cat.correct / cat.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Wrong Answers Review */}
            {wrongAnswers.length > 0 && (
              <Card className="premium-card mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    Review Wrong Answers
                  </CardTitle>
                  <CardDescription>{wrongAnswers.length} question(s) to review</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {wrongAnswers.map((question) => (
                    <div key={question.id} className="border-l-4 border-destructive pl-4 py-2">
                      <p className="font-medium mb-2">{question.question}</p>
                      {question.passage && (
                        <p className="text-sm text-muted-foreground italic mb-2">Passage: {question.passage}</p>
                      )}
                      {question.scenario && (
                        <p className="text-sm text-muted-foreground italic mb-2">Scenario: {question.scenario}</p>
                      )}
                      <div className="bg-destructive/5 p-3 rounded mb-2 border border-destructive/20">
                        <p className="text-sm">
                          <span className="font-semibold">Your answer:</span> {question.options[selectedAnswers[dailyQuestions.indexOf(question)]!]}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-green-600">Correct answer:</span> {question.options[question.correctAnswer]}
                        </p>
                      </div>
                      <div className="bg-green-500/5 p-3 rounded border border-green-500/20 flex gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700">{question.explanation}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="premium-card bg-gradient-to-br from-primary/5 to-chart-2/5 mb-8">
              <CardContent className="p-8 text-center">
                <p className="text-lg font-semibold mb-4">Come back tomorrow for a new quiz!</p>
                <p className="text-muted-foreground mb-6">Each day features a fresh set of 15 questions to keep your learning journey exciting.</p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleRetakeQuiz} className="w-full h-12" variant="outline">
                <Flame className="h-4 w-4 mr-2" />
                Retake Today&apos;s Quiz
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="w-full h-12 bg-gradient-to-r from-primary to-chart-2">
                Back to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return null;
}
