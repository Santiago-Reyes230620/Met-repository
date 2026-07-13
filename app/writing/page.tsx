'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/use-subscription';
import { useLocalDateKey } from '@/hooks/use-local-date-key';
import { dailyShuffle } from '@/lib/daily-rotation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PaywallAlert } from '@/components/shared/PaywallAlert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, XCircle, RotateCcw, BookOpen, TrendingUp } from 'lucide-react';
import { expandExercisePool } from '@/lib/exercise-pool';
import { extractMeaningfulTerms, isLikelyEnglishText, normalizeText, tokenizeText } from '@/lib/text-analysis';

interface WritingExercise {
  id: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  prompt: string;
  requirements: string[];
  minWords: number;
  sampleAnswer: string;
  tips: string;
}

interface GrammarIssue {
  type: string;
  description: string;
  severity: 'warning' | 'error';
}

interface EvaluationResult {
  wordCount: number;
  meetsMinWords: boolean;
  keyPointsCovered: string[];
  keyPointsMissing: string[];
  grammarIssues: GrammarIssue[];
  contentScore: number;
  grammarScore: number;
  overallScore: number;
  feedbackReasons: string[];
}

const writingVariantNotes = [
  'Use a clear structure from start to finish.',
  'Include one concrete example to support your answer.',
  'Keep the tone appropriate for the audience.',
  'End with a strong closing sentence.',
];

const BASE_WRITING_EXERCISES: WritingExercise[] = [
  // Emails (5)
  {
    id: 1,
    category: 'Emails',
    difficulty: 'beginner',
    title: 'Professional Email - Inquiry',
    prompt: 'Write a professional email to inquire about a job position you saw online.',
    requirements: [
      'Greeting and closing',
      'Mention specific position',
      'Brief background introduction',
      'Professional tone',
      'Call to action'
    ],
    minWords: 80,
    sampleAnswer: 'Dear Hiring Manager,\n\nI am writing to inquire about the Marketing Manager position posted on your website. With three years of experience in digital marketing and a passion for brand development, I believe I would be a strong candidate for your team.\n\nI would greatly appreciate the opportunity to discuss how my skills align with your company\'s goals. Please let me know if you would like to schedule a meeting at your convenience.\n\nThank you for considering my application.\n\nBest regards,\nJohn Smith',
    tips: 'Start with a proper greeting, introduce yourself briefly, and end with a clear call to action.'
  },
  {
    id: 2,
    category: 'Emails',
    difficulty: 'beginner',
    title: 'Casual Email - Meeting Request',
    prompt: 'Write a casual email to a friend asking to meet for coffee this weekend.',
    requirements: [
      'Friendly greeting',
      'Purpose of meeting',
      'Suggested time/place',
      'Closing question',
      'Casual tone'
    ],
    minWords: 60,
    sampleAnswer: 'Hi Sarah,\n\nHow have you been? I\'ve been meaning to catch up with you! Would you be free for coffee this weekend? Maybe we could meet at that new café downtown on Saturday afternoon?\n\nLet me know what works for you!\n\nCheers,\nMike',
    tips: 'Keep it friendly and relaxed. Be clear about your suggested time and place.'
  },
  {
    id: 3,
    category: 'Emails',
    difficulty: 'intermediate',
    title: 'Complaint Email - Customer Service',
    prompt: 'Write a professional complaint email about a faulty product you purchased.',
    requirements: [
      'Order/product details',
      'Description of the problem',
      'How it has affected you',
      'Specific request for resolution',
      'Professional but assertive tone'
    ],
    minWords: 120,
    sampleAnswer: 'Dear Customer Service Team,\n\nI am writing to lodge a complaint regarding my recent purchase (Order #12345) of your Premium Wireless Headphones. Unfortunately, the left speaker stopped working after just two weeks of normal use.\n\nThis has been frustrating as I purchased these headphones specifically for my work-from-home setup and travel. The sudden malfunction has prevented me from using them for my daily conference calls.\n\nI would appreciate a full replacement or refund within the next 5 business days. I am happy to return the defective unit at my convenience.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\nJane Doe',
    tips: 'Be specific about the problem, explain the impact, and state exactly what resolution you want.'
  },
  {
    id: 4,
    category: 'Emails',
    difficulty: 'intermediate',
    title: 'Thank You Email - Networking',
    prompt: 'Write a thank you email after a successful networking event or job interview.',
    requirements: [
      'Specific reference to the event',
      'Express genuine gratitude',
      'Mention something specific you discussed',
      'Next steps or follow-up suggestion',
      'Professional closing'
    ],
    minWords: 100,
    sampleAnswer: 'Dear Mr. Johnson,\n\nThank you so much for taking the time to speak with me at the Business Summit yesterday. I truly enjoyed our conversation about innovative solutions in the tech industry.\n\nYour insights about machine learning applications were particularly valuable and have inspired some new ideas I\'d like to explore further. I would welcome the opportunity to discuss potential collaboration possibilities.\n\nI will send you the article I mentioned within the next week. Please feel free to reach out if you need any additional information from my end.\n\nBest regards,\nAlex Chen',
    tips: 'Reference specific details from your conversation and indicate genuine interest in further contact.'
  },
  {
    id: 5,
    category: 'Emails',
    difficulty: 'advanced',
    title: 'Formal Proposal Email - Business Development',
    prompt: 'Write a formal proposal email to a potential business partner outlining a collaboration opportunity.',
    requirements: [
      'Clear subject line content',
      'Compelling opening',
      'Detailed value proposition',
      'Specific deliverables',
      'Timeline and next steps',
      'Professional conclusion'
    ],
    minWords: 150,
    sampleAnswer: 'Dear Ms. Rivera,\n\nThank you for our productive meeting last month. I am writing to formally propose a strategic partnership between our organizations that I believe could drive significant mutual value.\n\nOur proposal involves a three-year collaboration focused on joint product development in the sustainable technology sector. We project a combined market reach of 50 million users within 18 months and anticipated revenue growth of 35% annually.\n\nKey deliverables include: shared R&D investment, unified marketing strategy, and integrated technical infrastructure. Timeline: Phase 1 (months 1-3) planning and architecture, Phase 2 (months 4-12) development, Phase 3 (months 13-36) market launch and optimization.\n\nI would like to schedule a comprehensive meeting with your executive team to discuss this opportunity in detail. I am flexible with timing and can accommodate your schedule.\n\nI look forward to exploring this exciting partnership.\n\nSincerely,\nDavid Martinez',
    tips: 'Structure clearly with compelling value proposition. Use specific numbers and timelines to demonstrate feasibility.'
  },

  // Essays (5)
  {
    id: 6,
    category: 'Essays',
    difficulty: 'beginner',
    title: 'My Favorite Hobby',
    prompt: 'Write an essay about your favorite hobby and why you enjoy it.',
    requirements: [
      'Introduction with thesis',
      'At least 2 body paragraphs',
      'Specific examples',
      'Conclusion that restates main idea',
      'Clear organization'
    ],
    minWords: 200,
    sampleAnswer: 'My Favorite Hobby\n\nEveryone has activities they enjoy, and for me, photography has become my favorite hobby. I love capturing moments that tell stories and preserve memories. Photography allows me to express creativity, explore new places, and connect with nature in meaningful ways.\n\nFirst, photography is a wonderful creative outlet. Through my camera lens, I can see the world differently and compose images that reflect my unique perspective. I experiment with different angles, lighting, and subjects to create visually interesting photographs. This creative process helps me manage stress and find joy in everyday moments.\n\nSecond, my hobby encourages me to travel and explore new environments. Photography has taken me to beautiful parks, historic cities, and hidden gems I would never have discovered otherwise. These adventures have expanded my knowledge and enriched my life immeasurably.\n\nIn conclusion, photography is more than just a hobby for me. It is a passion that brings joy, creativity, and adventure into my life. I recommend that everyone find a hobby they love as it truly enhances our quality of life.',
    tips: 'Start with a clear thesis, develop your ideas in organized paragraphs, and conclude by restating your main point.'
  },
  {
    id: 7,
    category: 'Essays',
    difficulty: 'intermediate',
    title: 'The Impact of Social Media',
    prompt: 'Write an essay discussing both positive and negative effects of social media on society.',
    requirements: [
      'Thesis that acknowledges both sides',
      'Paragraph on positive effects',
      'Paragraph on negative effects',
      'Specific examples',
      'Balanced conclusion'
    ],
    minWords: 300,
    sampleAnswer: 'The Impact of Social Media on Modern Society\n\nSocial media has become an integral part of modern life, connecting billions of people worldwide. While it has brought significant benefits, it has also created new challenges. Understanding both the positive and negative effects is essential to navigate this digital landscape responsibly.\n\nSocial media offers numerous advantages to society. It enables instant communication across geographic boundaries, allowing families and friends to stay connected. During emergencies, social media has proven vital for spreading critical information quickly. Additionally, it provides a platform for social movements and activism, giving voice to marginalized communities. Small businesses benefit from cost-effective marketing opportunities, and content creators can build audiences and generate income.\n\nHowever, social media also presents significant concerns. The addictive nature of these platforms has led to increased anxiety and depression, particularly among young people. The spread of misinformation occurs at alarming rates, influencing public opinion and even election outcomes. Cyberbullying and harassment have become prevalent issues, with some individuals experiencing serious psychological harm. Additionally, the constant comparison with others\' curated lives fuels low self-esteem and body image issues.\n\nIn conclusion, social media is a powerful tool that reflects both human potential and our vulnerabilities. Rather than rejecting it entirely, society must develop better regulations, digital literacy programs, and personal practices to maximize benefits while minimizing harms. The solution lies not in eliminating social media, but in using it more consciously and responsibly.',
    tips: 'Present both sides fairly with specific examples. Use transitional phrases to connect ideas smoothly.'
  },
  {
    id: 8,
    category: 'Essays',
    difficulty: 'intermediate',
    title: 'Environmental Conservation',
    prompt: 'Write an essay about why environmental conservation is important and what individuals can do.',
    requirements: [
      'Clear introduction',
      'Multiple reasons for conservation',
      'Practical actions individuals can take',
      'Inspiring conclusion',
      'Evidence or examples'
    ],
    minWords: 280,
    sampleAnswer: 'The Importance of Environmental Conservation\n\nOur planet faces unprecedented environmental challenges, from climate change to biodiversity loss. Environmental conservation is not merely an option but a necessity for human survival and the preservation of our natural world. Through collective action and individual responsibility, we can make a meaningful difference.\n\nConservation protects the ecosystems that sustain all life on Earth. Forests produce oxygen and regulate climate, while wetlands filter water and provide habitats. When we lose biodiversity, we lose potential medicines, food sources, and ecological stability. Additionally, conservation preserves natural beauty and resources for future generations, ensuring they inherit a healthy planet.\n\nIndividuals have substantial power to contribute to environmental conservation. We can reduce our carbon footprint by using public transportation, eating less meat, and consuming energy-efficiently. Supporting sustainable products and companies sends market signals favoring environmental responsibility. Participating in community conservation projects, such as tree planting or beach cleanups, creates immediate environmental impact while building community awareness.\n\nFurthermore, we must advocate for policy changes that prioritize environmental protection. Supporting legislation on renewable energy, wildlife protection, and pollution control amplifies individual efforts at the systemic level. Education is crucial; by understanding environmental issues and sharing knowledge, we inspire others to act.\n\nIn conclusion, environmental conservation is everyone\'s responsibility. While the challenges are significant, individual actions combined create powerful change. By making conscious choices and supporting broader initiatives, we can build a sustainable future where both humanity and nature thrive together.',
    tips: 'Include specific actions people can take. Support your arguments with reasons and examples.'
  },
  {
    id: 9,
    category: 'Essays',
    difficulty: 'advanced',
    title: 'Technology and Human Connection',
    prompt: 'Write an analytical essay exploring how technology has transformed human relationships and communication.',
    requirements: [
      'Sophisticated thesis',
      'Analysis of technological impact',
      'Discussion of both benefits and drawbacks',
      'Deep examples and evidence',
      'Nuanced conclusion'
    ],
    minWords: 400,
    sampleAnswer: 'Technology\'s Paradox: How Digital Innovation Reshapes Human Connection\n\nTechnology has fundamentally altered the landscape of human relationships, creating a paradox where unprecedented connectivity coexists with deepening isolation. While digital communication tools have demolished geographic barriers and enabled new forms of community, they have simultaneously fragmented traditional social bonds and mediated our interactions through screens. Understanding this complex transformation requires examining both the liberation and the loss technology has introduced into human connection.\n\nHistorically, geography determined social possibility. Pre-industrial humans were confined to local communities, their relationships bounded by physical proximity. The telephone, automobile, and later the internet progressively dissolved these constraints. Today, a person can maintain meaningful relationships across continents, collaborate with global teams, and find community around niche interests regardless of location. Social media platforms have democratized publishing and enabled marginalized voices to reach audiences previously impossible to access. Long-distance relationships that would have been untenable a generation ago now flourish through video calls and instant messaging.\n\nYet this technological mediation introduces subtle but profound costs to human interaction. Research indicates that despite increased connectivity, rates of loneliness and depression have risen significantly in the digital age. Screen-mediated communication lacks the nuanced emotional transmission of physical presence: facial micro-expressions, tone of voice, and bodily language convey information that text cannot fully capture. The performative nature of social media encourages curated self-presentation over authentic vulnerability. Furthermore, the dopamine-driven feedback loops of digital platforms create addiction-like patterns that fragment attention and diminish our capacity for deep, sustained focus on individual relationships.\n\nThe distinction lies not in technology itself but in intentionality. Video calls do not replace physical embrace; they supplement it. Messaging enables coordination but cannot substitute for conversation\'s spontaneous depth. The challenge facing contemporary society is neither rejection of technology nor uncritical embrace, but rather the cultivation of wisdom about when and how to use these tools.\n\nIn conclusion, technology has neither saved nor destroyed human connection but rather redistributed it. Our task is developing practices and policies that allow technology to serve human flourishing rather than fragment it. This requires individual mindfulness, educational initiatives, and social restructuring to ensure technology enhances rather than replaces the irreducible value of human presence.',
    tips: 'Use sophisticated vocabulary and complex sentence structures. Analyze ideas deeply rather than just describing them.'
  },
  {
    id: 10,
    category: 'Essays',
    difficulty: 'advanced',
    title: 'Educational Systems and Social Mobility',
    prompt: 'Write a persuasive essay arguing for reforms in educational systems to increase social mobility.',
    requirements: [
      'Clear argument for reform',
      'Evidence of current inequalities',
      'Proposed solutions with justification',
      'Counterargument acknowledgment',
      'Call to action'
    ],
    minWords: 400,
    sampleAnswer: 'Educational Reform as a Gateway to Equity: Transforming Social Mobility Through Systemic Change\n\nEducation is theoretically the great equalizer, yet current educational systems perpetuate rather than diminish socioeconomic inequality. Students from wealthy families enjoy numerous advantages: better-funded schools, experienced teachers, test preparation resources, and social capital that eases transitions into prestigious universities and careers. Meanwhile, students from low-income backgrounds navigate underfunded institutions, less experienced teachers, and limited access to enrichment opportunities. This disparity is not inevitable; it reflects policy choices that prioritize privilege. Comprehensive educational reforms that address funding inequities, expand early childhood programs, and democratize access to advanced courses can genuinely transform social mobility.\n\nThe evidence is stark and indefensible. Students attending schools in wealthy districts benefit from substantially higher per-pupil spending, resulting in smaller class sizes, more comprehensive curricula, and greater investment in technology and facilities. Research from Stanford demonstrates that students from low-income households complete advanced courses at half the rate of their wealthier peers, despite comparable aptitude. These disparities compound over time: lower course completion leads to reduced college admission chances, which restricts lifetime earning potential. The result is systematic reproduction of class structures despite meritocratic ideals.\n\nEffective reform must be multifaceted. First, equitable funding mechanisms should ensure schools in disadvantaged areas receive adequate resources regardless of local tax bases. Second, universal access to quality early childhood education has demonstrated remarkable long-term benefits in literacy, graduation rates, and earnings. Third, removing gatekeeping from advanced courses allows capable students from all backgrounds to challenge themselves. Fourth, mentorship and college preparation programs bridge informational gaps that privileged students naturally navigate. These reforms require investment, but the economic returns through increased productivity and reduced social costs far exceed initial expenditures.\n\nSome argue these reforms represent excessive intervention or that competition drives excellence. However, competition only functions fairly when participants have comparable starting conditions. Furthermore, other wealthy nations implementing similar reforms have achieved superior outcomes in both equity and overall performance.\n\nEducational reform is not charity; it is enlightened self-interest. Societies that unlock the talents of all their citizens benefit from greater innovation, reduced crime, and stronger economies. The time for incremental changes has passed. We must fundamentally restructure educational systems to ensure that geography and family income no longer determine destiny. Our children\'s futures—and our collective prosperity—depend on it.',
    tips: 'Use strong evidence and address counterarguments directly. End with a compelling call to action.'
  },

  // Descriptions (5)
  {
    id: 11,
    category: 'Descriptions',
    difficulty: 'beginner',
    title: 'Describe a Place You Love',
    prompt: 'Write a vivid description of a place that is special to you.',
    requirements: [
      'Sensory details (sight, sound, smell)',
      'Specific location name',
      'Emotional connection',
      'Descriptive adjectives',
      'Clear imagery'
    ],
    minWords: 150,
    sampleAnswer: 'My Special Place\n\nThe old bookstore on the corner of Fifth and Main Street is my favorite place in the world. As I step through the creaky wooden door, the familiar smell of aged paper and old leather envelops me. Soft golden light filters through the dust-covered windows, creating cozy pockets of warmth throughout the cramped aisles.\n\nThe store is packed with wooden shelves overflowing with books of every color and size. The worn floorboards creak beneath my feet, announcing my presence as I wander through the winding paths. In the back corner, a comfortable armchair sits beside a tall window, where I spend hours lost in different worlds.\n\nWhat makes this place truly special is the peaceful silence that embraces you the moment you enter. There is no rush, no noise—just the gentle whisper of turning pages and the occasional cough from other readers. The owner, Mr. Phillips, knows my name and always reserves interesting books for me.\n\nThis bookstore is my sanctuary, a place where I feel completely at home and at peace.',
    tips: 'Use vivid sensory details. Show why the place matters to you, not just what it looks like.'
  },
  {
    id: 12,
    category: 'Descriptions',
    difficulty: 'intermediate',
    title: 'Describe a Person You Admire',
    prompt: 'Write a detailed description of someone you admire, focusing on their character and appearance.',
    requirements: [
      'Physical appearance details',
      'Character traits and qualities',
      'Specific examples of their behavior',
      'Impact they have on others',
      'Emotional tone'
    ],
    minWords: 200,
    sampleAnswer: 'My Grandmother, Maria\n\nMy grandmother, Maria, is a woman of quiet strength and remarkable kindness. At seventy-eight years old, she stands slightly bent from decades of hard work, yet her dark eyes still shine with warmth and wisdom. Her silver hair, worn in a traditional braid, frames a face lined with laugh lines and stories.\n\nWhat strikes most people immediately is her infectious smile. It appears effortlessly and reaches her eyes, making everyone around her feel welcome and valued. She dresses simply in colorful cardigans and comfortable dresses, practical choices reflecting her no-nonsense approach to life.\n\nBeyond her appearance, Maria\'s character is her true beauty. She possesses an unwavering patience that seems inexhaustible. Despite her own challenges, she prioritizes everyone\'s wellbeing above her own. When my parents argued, she mediated with gentle wisdom. When my brother struggled in school, she tutored him for months without complaint.\n\nHer impact on our family is immeasurable. She created traditions that bonded us together, from Sunday dinners to holiday preparations. Her faith never wavered, and it inspired confidence during uncertain times. Even now, her grandsons and granddaughters seek her counsel because we know she listens without judgment.\n\nMaria taught me that true strength lies not in physical power but in compassion, resilience, and service to others. She remains my greatest inspiration.',
    tips: 'Balance physical description with character. Use specific examples to show qualities rather than just stating them.'
  },
  {
    id: 13,
    category: 'Descriptions',
    difficulty: 'intermediate',
    title: 'Describe a Historical Monument',
    prompt: 'Write an informative description of a famous historical monument or landmark.',
    requirements: [
      'Location and basic facts',
      'Historical significance',
      'Architectural/physical details',
      'Cultural or emotional importance',
      'Why it matters today'
    ],
    minWords: 220,
    sampleAnswer: 'The Great Wall of China: A Monument to Human Resilience\n\nThe Great Wall of China stretches over thirteen thousand miles across northern China, representing one of humanity\'s most ambitious engineering projects. Built over approximately two millennia, with most of the structure dating from the Ming Dynasty (1368-1644), the wall stands as a testament to ancient engineering prowess and determination.\n\nConstructed from brick, stone, and earth, the wall features fortified watchtowers, barracks, and beacon towers spaced at regular intervals. The most famous sections, located near Beijing, display remarkable masonry with carefully fitted stones and strategic defensive positions commanding vast landscapes. Walls range from fifteen to thirty feet high, designed to withstand cavalry attacks and prevent unauthorized border crossing.\n\nHistorically, the Great Wall served multiple purposes: military defense against invasions from northern peoples, border control and trade regulation, and psychological reinforcement of territorial boundaries. It represents centuries of strategic thinking and collective labor, with hundreds of thousands of workers dedicating their lives to its construction.\n\nBeyond its military functions, the wall embodies cultural significance. It symbolizes Chinese civilization\'s endurance, sophistication, and commitment to unified identity. For Han Chinese dynasties, it represented the boundary between civilization and perceived wilderness.\n\nToday, the Great Wall has transcended its original purpose to become a symbol of human achievement and cultural heritage. As a UNESCO World Heritage Site, it attracts millions of visitors annually who walk its ancient stones. The wall reminds us that grand human endeavors, while sometimes born from conflict, ultimately represent our capacity for remarkable creation and our connection to history. It stands not merely as a physical structure but as a living connection between past and present.',
    tips: 'Provide factual information while maintaining engaging descriptive language. Explain both historical and contemporary significance.'
  },
  {
    id: 14,
    category: 'Descriptions',
    difficulty: 'advanced',
    title: 'Describe an Abstract Concept',
    prompt: 'Write a descriptive essay about an abstract concept (e.g., courage, freedom, love) using concrete examples.',
    requirements: [
      'Clear definition or interpretation',
      'Multiple concrete examples',
      'Sensory and emotional language',
      'Philosophical reflection',
      'Connection to human experience'
    ],
    minWords: 300,
    sampleAnswer: 'Courage: The Quiet Strength Within\n\nCourage is not the absence of fear, as commonly believed, but rather the decision to act despite it. It is a force that manifests in both dramatic, headline-making moments and in the quiet, unnoticed choices we make each day. True courage requires vulnerability, clarity of purpose, and the willingness to risk comfort for something believed to be right.\n\nCourage takes many forms. There is the physical courage of firefighters rushing into burning buildings, choosing others\' safety over their own survival. There is the moral courage of whistleblowers exposing injustice at the risk of their careers and reputations. There is the emotional courage of someone admitting they need help, overcoming pride and vulnerability. There is the social courage of standing against peer pressure to advocate for unpopular truths. Each represents courage\'s essence: choosing meaningful action despite fear.\n\nI witnessed quiet courage in my neighbor, Margaret, who returned to university at seventy-two years old. After fifty years of postponed dreams, she faced her insecurity about her aging mind and entered a classroom among students seventy years her junior. Each semester required her to overcome the voice saying she was too old, too out of practice, too vulnerable. Yet she persisted with determination that inspired everyone who knew her.\n\nCourage feels like standing at the edge of an unknown chasm and choosing to bridge it. It tightens your chest, quickens your breath, and creates an electric uncertainty about outcomes. Yet simultaneously, it produces a sense of aliveness, a feeling of alignment between values and actions. This tension—between fear and resolve—is courage\'s signature.\n\nModern society often equates courage with dominance or aggression, but this misses courage\'s true character. The most courageous among us often appear quiet, even ordinary. They speak gently but truthfully. They persist without fanfare. They live according to convictions in the face of indifference.\n\nIn conclusion, courage is humanity\'s most essential virtue. It transforms fear from a paralyzing force into fuel for meaningful action. Without courage, we remain imprisoned by circumstances and self-imposed limitations. With it, we become authors of our own lives and contributors to a better world.',
    tips: 'Use specific examples to illustrate abstract ideas. Reflect on deeper meanings and implications.'
  },
  {
    id: 15,
    category: 'Descriptions',
    difficulty: 'advanced',
    title: 'Describe an Experience Using Literary Techniques',
    prompt: 'Write a descriptive piece about a memorable experience, using literary techniques like metaphor, simile, and imagery.',
    requirements: [
      'Literary devices (metaphor, simile, personification)',
      'Rich sensory imagery',
      'Emotional depth',
      'Narrative arc',
      'Reflection on meaning'
    ],
    minWords: 280,
    sampleAnswer: 'The Morning I Found Myself\n\nThe dawn broke like an egg, golden yolk bleeding across the horizon as I stood alone on the mountain peak. Years of climbing—metaphorically and literally—had led to this moment, where the world stretched endlessly below and possibility hung in the thin mountain air.\n\nBefore me, the valley breathed. Mist rose like the exhalations of something ancient awakening, weaving between pine trees that stood as sentinels keeping eternal watch. Below, the world remained veiled in soft blue silence, untouched by the day\'s chaos that would soon unfold in distant cities. Here, time moved differently.\n\nI thought of the year behind me: the failures that felt like avalanches, the relationships that crumbled like old stone, the dreams deferred. Yet standing there, I understood that mountains are not climbed in one bold leap but in countless small steps, each one carrying you higher despite doubt. The pain was not a wall preventing progress but the muscle-ache of growth.\n\nThe wind whispered secrets only mountains know, and I felt impossibly small yet infinitely connected to something vast. My breath misted in the cold air—evidence of my presence, my aliveness. I had reached this peak not through exceptional ability but through persistent, unglamorous perseverance.\n\nIn that crystalline moment, I realized that the mountain had not changed me. Rather, it had simply revealed who I had been becoming all along. The view from above was beautiful, but the true treasure was the knowledge that I possessed the strength to keep climbing.\n\nAs the sun continued its ascent and light flooded the world below, I descended not as the same person who had begun the climb. I was reborn in the altitude, remade by the journey, ready to face whatever valleys awaited.',
    tips: 'Weave literary devices naturally throughout. Show emotion through sensory details rather than direct statements. Reflect on deeper meaning.'
  },

  // Stories (5)
  {
    id: 16,
    category: 'Stories',
    difficulty: 'beginner',
    title: 'Write a Simple Short Story',
    prompt: 'Write a short story with a clear beginning, middle, and end.',
    requirements: [
      'Introduction of characters',
      'Clear problem or conflict',
      'Resolution',
      'Dialogue',
      'Descriptive scenes'
    ],
    minWords: 200,
    sampleAnswer: 'The Lost Key\n\nJames frantically searched his apartment, checking the kitchen counter for the third time. His old house key—the one his grandmother gave him decades ago—was missing.\n\n"Have you seen it?" he asked his roommate, Derek, who was making coffee.\n\n"Not since you mentioned it yesterday," Derek replied, glancing at the counter.\n\nJames traced his steps from the previous evening. He had come home from work, dropped his bag by the door, changed clothes, and made dinner. The key must be somewhere, he thought desperately. His grandmother was coming to visit next week, and he had promised to show her that he still kept it safe.\n\nHe checked the bathroom, his bedroom, and even the trash. Nothing. As he sat on the couch, defeated, Derek laughed.\n\n"Check your coat pocket," Derek suggested casually.\n\nJames rushed to the hallway closet and reached into his winter coat. There it was—the small brass key. He grasped it firmly, relieved and grateful.\n\n"How did you know?" James asked.\n\n"Because you wore that coat yesterday, remember?" Derek smiled knowingly.\n\nJames laughed at himself, realizing that the solution had been simple all along. Sometimes, he thought, the answers we seek are closer than we realize.',
    tips: 'Establish your characters quickly and get to the conflict fast. Use dialogue to move the story forward.'
  },
  {
    id: 17,
    category: 'Stories',
    difficulty: 'intermediate',
    title: 'Write a Story with a Twist Ending',
    prompt: 'Write a story that surprises the reader with an unexpected twist at the end.',
    requirements: [
      'Engaging introduction',
      'Red herring or misdirection',
      'Rising action',
      'Surprising revelation',
      'Logical twist that makes sense on reflection'
    ],
    minWords: 280,
    sampleAnswer: 'The Last Patient\n\nDr. Sullivan looked at the clock: 6:47 PM. Just thirteen minutes remained of his thirty-year career before retirement. This final patient was a young woman named Emma, sitting nervously in the examination room.\n\n"Tell me what brings you in today," he said kindly, pulling up a chair.\n\n"I\'ve been having headaches," Emma explained. "Terrible ones, for about a month. I couldn\'t see other doctors because of my insurance, so I waited until I could afford to come today."\n\nDr. Sullivan examined her carefully, concerned by her symptoms. He had seen many cases—some serious, some minor. But something about this one troubled him. He ordered blood tests and a CT scan.\n\nTwo hours later, as the sun set beyond the clinic windows, the results came back. His hands trembled as he read them. Emma had a brain tumor. A significant one. She would need immediate surgery.\n\nDr. Sullivan sat across from Emma, preparing to deliver the worst news a doctor could give. He thought about all the patients he had helped over three decades, all the lives he had saved. Yet he would retire knowing this young woman\'s life hung in the balance because she couldn\'t afford proper healthcare sooner.\n\n"Emma," he began softly, "I need to tell you something important."\n\nJust then, Emma smiled gently.\n\n"I need to tell you something too, Doctor," she said. "I\'m not really your patient. I\'m an actress your family hired. You\'re not actually retiring. This is a test."\n\nDr. Sullivan\'s face went white.\n\n"For years, you\'ve made excuses for why you can\'t advocate for healthcare reform. So we created this scenario to show you the human cost of your inaction." Emma continued, her expression serious now. "Tomorrow morning, you\'ll receive a position leading a national healthcare initiative. It\'s what you\'ve always been meant to do."\n\nAs tears filled his eyes, Dr. Sullivan realized that sometimes retirement isn\'t an ending. Sometimes, it\'s finally the beginning.',
    tips: 'Plant subtle clues throughout the story. The twist should be surprising but logical in retrospect.'
  },
  {
    id: 18,
    category: 'Stories',
    difficulty: 'intermediate',
    title: 'Write a Story from an Unusual Perspective',
    prompt: 'Write a story told from an unusual point of view (e.g., from an animal, inanimate object, or minor character).',
    requirements: [
      'Consistent perspective',
      'Unique voice for the narrator',
      'Full narrative arc',
      'Insight from the unusual viewpoint',
      'Emotional engagement'
    ],
    minWords: 250,
    sampleAnswer: 'The Life of a Forgotten Jacket\n\nI don\'t remember when I was sewn together, but I do remember the boy who first wore me. His name was Michael, and he was seven years old. His mother had just bought me from a department store, and I was so proud to protect his small shoulders.\n\nFor three years, I was his favorite. Michael wore me to school, to the park, to his grandmother\'s house. I remember the ice cream stain he got on my sleeve—he cried, thinking his mother would be angry, but she just smiled and cleaned me gently.\n\nBut children grow. By the time Michael was ten, I no longer fit him properly. His mother folded me carefully and placed me in a cardboard box in the attic. I waited there for years, among other forgotten things: old toys, photograph albums, winter decorations.\n\nThen came the day his mother donated me to a charity shop. I was hopeful again. A new child might wear me, create new memories with me. But I sat on that dusty shelf for six months, passed by countless shoppers.\n\nOne rainy afternoon, an elderly woman noticed me. She tried me on, and though I was much too small, she seemed to see something in me. She brought me to the register.\n\nMichael\'s mother was that woman. She had recognized me. As she put me on again, now vastly oversized, tears ran down her face. She held me close, remembering her son\'s childhood, the precious years that had slipped away.\n\nThat night, she hung me on her bedroom wall as a cherished memory. I finally understood my true purpose: not merely to keep someone warm, but to hold their history, their love, their precious moments.\n\nI was never forgotten. I was just waiting to be remembered.',
    tips: 'Develop a distinct voice for your narrator. Let their perspective illuminate the story in unique ways.'
  },
  {
    id: 19,
    category: 'Stories',
    difficulty: 'advanced',
    title: 'Write a Flash Fiction Piece',
    prompt: 'Write a complete story in approximately 400 words—a powerful narrative with depth despite brevity.',
    requirements: [
      'Compelling opening hook',
      'Character development despite word limit',
      'Meaningful conflict',
      'Powerful resolution',
      'Universal themes'
    ],
    minWords: 350,
    sampleAnswer: 'The Bridge\n\nEvery morning for forty-three years, Thomas walked across the bridge. He knew every crack in the concrete, every rusted bolt, every chip in the green paint. The bridge connected his small town to the highway, and his life moved with the rhythm of this crossing.\n\nHe walked it to school, to his job at the factory, to his wedding, to the hospital where his daughter was born. He walked it during joy and despair, in sunshine and in rain. The bridge had become the geography of his existence.\n\nWhen he turned sixty-five, the city announced plans to demolish the bridge and build a new one two miles upstream. Thomas attended the community meeting, sitting in the back, silent while others debated improvements and efficiency.\n\nOn the last day before demolition, Thomas woke before dawn. He packed a thermos of coffee and walked to the bridge as he had thousands of times before. But this time, he brought his daughter, who had moved away and lived in the city now.\n\n"I wanted you to see it one last time," he said simply.\n\nThey stood in the center, watching the sun rise, painting the water below in shades of gold and pink. Thomas told her stories: how he proposed to her mother beneath this bridge during a snowstorm; how he carried her across when she was born and he brought her home; how this bridge had witnessed his entire life.\n\n"Everything changes, Dad," his daughter said gently, understanding his sadness.\n\n"Yes," Thomas replied. "But some things should be remembered."\n\nThey walked across together, slowly, deliberately, imprinting the moment in their memories.\n\nThe new bridge was built strong and efficient. It served its purpose well. But sometimes, when Thomas drove across it, he would glance upstream and remember. He had realized something crucial: bridges don\'t truly disappear. They transform into memory, into the stories we carry forward, into the connections that define us.\n\nHis daughter, now a mother herself, brought her own son to cross the new bridge. She told him about his great-grandfather, about the old bridge, about how love persists across time and distance.\n\nThomas had finally understood his bridge\'s greatest purpose: it had never been about the structure of concrete and steel. It had always been about connection—to place, to people, to time itself. That bridge, in essence, still stands.',
    tips: 'Every word must matter in flash fiction. Create emotional impact through precise language and meaningful details.'
  },
  {
    id: 20,
    category: 'Stories',
    difficulty: 'advanced',
    title: 'Write a Magical Realism Story',
    prompt: 'Write a story that blends magical elements with realistic settings, making the impossible feel natural.',
    requirements: [
      'Realistic setting and characters',
      'Magical element presented matter-of-factly',
      'Exploration of how magic affects relationships',
      'Deeper meaning or symbolism',
      'Seamless blend of real and magical'
    ],
    minWords: 350,
    sampleAnswer: 'The Coffee Maker\'s Memory\n\nGramps\' coffee maker had seen everything. Sarah didn\'t know when she first noticed it could show the past—perhaps it had always had this ability—but one morning, as she poured water into the old machine, she glimpsed her grandfather at twenty-five, holding it for the first time in a department store, wondering if he could afford it.\n\nShe didn\'t tell anyone. She just began to arrive early at his house each Sunday, brewing coffee and watching the memories.\n\nShe saw her grandmother sneaking downstairs at midnight to add honey to his coffee, knowing it was his secret preference. She saw her father as a boy, standing on tiptoes to fill the machine while her grandfather taught him patience. She saw the morning Gramps received the call that his brother had died—how he sat holding an empty cup, unable to take the first sip.\n\nWith each cup, Sarah understood her family\'s quiet history—the grief they carried, the love they expressed through small gestures, the ordinary moments that constituted their entire legacy.\n\nWhen Gramps was hospitalized, Sarah brought the coffee maker to his room. The nurses said nothing about the ancient machine, though they must have found it odd. She made him coffee every morning, and his eyes would light up with recognition, though he couldn\'t always remember her name anymore.\n\nOn his final day, the coffee maker would not work. No amount of coaxing, repairs, or electricity could restart it. But that morning, Gramps smiled peacefully, and he squeezed Sarah\'s hand.\n\n"Thank you for remembering with me," he whispered.\n\nAfter the funeral, Sarah kept the broken coffee maker on her shelf. Sometimes, when she felt lost, she would touch it and feel the warmth of those mornings—the strength of the past, the continuation of love across generations.\n\nShe began to wonder: perhaps the magic wasn\'t in the machine at all. Perhaps it had been in her willingness to witness, to honor, to remember. Perhaps that was the greatest magic—paying attention to the ordinary moments that constitute a life.',
    tips: 'Introduce magical elements without explanation. Focus on how magic affects emotional truths and relationships.'
  },

  // Letters (3)
  {
    id: 21,
    category: 'Letters',
    difficulty: 'beginner',
    title: 'Write a Formal Letter',
    prompt: 'Write a formal letter requesting information or lodging a complaint to an organization.',
    requirements: [
      'Proper letter format',
      'Clear subject/purpose',
      'Respectful tone',
      'Specific details',
      'Professional closing'
    ],
    minWords: 120,
    sampleAnswer: '[Your Address]\n[Date]\n\n[Recipient Address]\n\nDear Sir/Madam,\n\nI am writing to request information regarding your training programs. I am particularly interested in your professional development courses offered this coming semester.\n\nCould you please provide details about course schedules, fees, and enrollment procedures? Additionally, I would appreciate information about any available scholarships or payment plans.\n\nI am committed to advancing my professional skills and believe your organization offers excellent opportunities.\n\nThank you for your assistance. I look forward to hearing from you soon.\n\nYours sincerely,\nJohn Davis',
    tips: 'Use proper letter format with date and addresses. Be clear and concise about your purpose and requests.'
  },
  {
    id: 22,
    category: 'Letters',
    difficulty: 'intermediate',
    title: 'Write a Personal Letter to a Friend',
    prompt: 'Write a heartfelt personal letter to an old friend, updating them on your life and expressing your feelings about your friendship.',
    requirements: [
      'Warm, personal tone',
      'Life updates and stories',
      'Reflection on your friendship',
      'Expression of genuine emotion',
      'Invitation for continued connection'
    ],
    minWords: 200,
    sampleAnswer: 'Dear Rebecca,\n\nIt has been far too long since we last spoke, and I have thought of you often. I hope this letter finds you well and happy. I wanted to reach out and share what has been happening in my life while also reflecting on how much your friendship has meant to me.\n\nThe past year has been transformative. I finally took that leap and changed careers, something I could never have done without believing in myself—a belief you always helped instill in me. My new job is challenging but fulfilling in ways I didn\'t expect.\n\nMy family is doing well. My daughter started kindergarten, and she is the most curious, spirited child. She reminds me so much of us at that age—always asking questions and seeking adventures. I wish you could meet her.\n\nThough we live in different cities and our lives have taken different paths, my connection to you remains strong. Our friendship during college shaped who I became. You celebrated my victories, supported me through heartbreak, and made me laugh during my darkest moments. Those memories are treasures I return to often.\n\nI would love to hear what you have been doing. Tell me about your work, your travels, your dreams—everything. I miss our late-night conversations and want to know what has changed and what remains the same about you.\n\nPlease write back when you can. Better yet, let\'s plan a visit soon. Distance cannot diminish true friendship.\n\nWith love and anticipation,\nSarah',
    tips: 'Let emotions guide your writing. Balance updates about your life with genuine reflection on the friendship.'
  },
  {
    id: 23,
    category: 'Letters',
    difficulty: 'advanced',
    title: 'Write a Resignation Letter',
    prompt: 'Write a professional resignation letter expressing gratitude while clearly stating your intention to leave.',
    requirements: [
      'Clear statement of resignation',
      'Last day of employment',
      'Expression of gratitude',
      'Brief explanation if appropriate',
      'Offer of assistance during transition',
      'Professional tone'
    ],
    minWords: 150,
    sampleAnswer: '[Your Address]\n[Date]\n\n[Manager\'s Name]\n[Company]\n[Company Address]\n\nDear [Manager\'s Name],\n\nI am writing to formally notify you of my resignation from my position as [Job Title] at [Company Name]. My last day of employment will be [Date—typically two weeks from submission date].\n\nThis decision has not been made lightly. After careful consideration, I have determined that it is time for me to pursue a new direction in my career that aligns with my long-term professional goals.\n\nI am deeply grateful for the opportunities I have had at this organization. Working with you and the team has been instrumental in my professional development. The skills I have acquired and the relationships I have built will remain invaluable throughout my career.\n\nDuring my remaining time, I am committed to ensuring a smooth transition. I will complete outstanding projects and am happy to train my replacement or provide detailed documentation of my responsibilities.\n\nThank you again for the opportunity to be part of this organization. I wish you and the company continued success.\n\nSincerely,\n[Your Name]',
    tips: 'Be professional and positive, even if you\'re leaving due to dissatisfaction. Maintain goodwill for future references.'
  },

  // Reports (3)
  {
    id: 24,
    category: 'Reports',
    difficulty: 'intermediate',
    title: 'Write a Progress Report',
    prompt: 'Write a progress report for a project, summarizing work completed, current status, and next steps.',
    requirements: [
      'Project name and date',
      'Summary of completed tasks',
      'Current status assessment',
      'Challenges or issues',
      'Next steps and timeline',
      'Clear organization with sections'
    ],
    minWords: 200,
    sampleAnswer: 'PROJECT PROGRESS REPORT\nProject: Website Redesign Initiative\nReporting Period: June 1-15, 2026\n\nEXECUTIVE SUMMARY\nThe website redesign project is progressing on schedule. The design phase is 85% complete, and development preparations are underway.\n\nCOMPLETED WORK\n- Completed user research interviews with 25 stakeholders\n- Finalized website architecture and information hierarchy\n- Created wireframes for all major pages\n- Established design system with color palette and typography guidelines\n- Obtained approval from marketing team on brand alignment\n\nCURRENT STATUS\nThe project is tracking well against our timeline. Design mockups are in the review phase, with stakeholder feedback being incorporated. We expect final design approval by June 25.\n\nCHALLENGES\nOne minor delay occurred due to extended review cycles with the executive team. This has been addressed by implementing a streamlined approval process.\n\nNEXT STEPS\n- Complete final design revisions (June 18-22)\n- Begin development phase (June 23)\n- Set up development environment and database infrastructure\n- Expected project completion: August 15, 2026\n\nCONCLUSION\nThe project remains on track. We anticipate no major obstacles to completing the website redesign by the target date.',
    tips: 'Use clear sections and headings. Be specific about accomplishments and honest about challenges.'
  },
  {
    id: 25,
    category: 'Reports',
    difficulty: 'advanced',
    title: 'Write an Analytical Report',
    prompt: 'Write an analytical report examining data, trends, or findings and providing recommendations.',
    requirements: [
      'Clear title and executive summary',
      'Data analysis with specific findings',
      'Identified trends or patterns',
      'Supported recommendations',
      'Professional formatting and language',
      'Conclusion'
    ],
    minWords: 300,
    sampleAnswer: 'MARKET ANALYSIS REPORT: CONSUMER ELECTRONICS SECTOR\nPrepared by: Strategic Planning Department\nDate: June 2026\n\nEXECUTIVE SUMMARY\nThis report analyzes current market trends in consumer electronics and provides strategic recommendations for our organization\'s product development priorities. Key findings indicate a 15% year-over-year growth in smart home devices, with sustainability becoming a decisive purchasing factor for 63% of consumers.\n\nMARKET FINDINGS\nGlobal consumer electronics market is projected to reach $1.2 trillion by 2027, driven primarily by emerging markets in Asia and Africa. Within this landscape, three segments show exceptional growth:\n\n1. Smart Home Devices: Growing at 18% annually, representing $45 billion in market value. Consumer demand is driven by convenience and energy efficiency.\n\n2. Wearable Technology: Expanding at 12% annually as health-conscious consumers adopt fitness trackers and smartwatches. This segment is particularly strong among younger demographics (18-35 years).\n\n3. Sustainable Electronics: A rapidly emerging segment where 63% of consumers prefer environmentally conscious products, even at premium prices.\n\nTREND ANALYSIS\nData reveals significant consumer preference shifts toward sustainability. Products manufactured with recycled materials and featuring energy-efficient designs command price premiums of 20-30% without reducing consumer demand. Additionally, the integration of artificial intelligence in consumer devices is becoming standard rather than premium, with 78% of new products featuring AI functionality.\n\nRECOMMENDATIONS\n1. Invest in sustainable manufacturing processes to capture growing environmentally conscious market segment\n2. Prioritize smart home product development, particularly voice-activated devices with expanded AI capabilities\n3. Expand wearable technology offerings targeting health and fitness applications\n4. Develop recycling programs and take-back initiatives to build brand loyalty\n5. Implement transparent sustainability reporting in all marketing communications\n\nCONCLUSION\nThe consumer electronics market presents significant opportunities for organizations that align product development with consumer values, particularly sustainability and technological integration. Implementation of these recommendations positions our organization competitively within this rapidly evolving market.',
    tips: 'Support all claims with specific data. Present findings logically and recommendations based on evidence.'
  },

  // Summaries (2)
  {
    id: 26,
    category: 'Summaries',
    difficulty: 'intermediate',
    title: 'Write a Book Summary',
    prompt: 'Write a comprehensive summary of a book you have read, capturing main themes and key plot points.',
    requirements: [
      'Book title and author',
      'Main plot summary',
      'Key character descriptions',
      'Major themes identified',
      'Your assessment of the book',
      'Concise yet complete'
    ],
    minWords: 200,
    sampleAnswer: 'Summary: "To Kill a Mockingbird" by Harper Lee\n\n"To Kill a Mockingbird" is a classic novel set in the fictional town of Maycomb, Alabama, during the 1930s Great Depression. The story follows Scout Finch, a young girl growing up in the South alongside her brother Jem and their father, lawyer Atticus Finch.\n\nThe central plot revolves around Atticus defending Tom Robinson, a Black man falsely accused of assaulting a white woman, Mayella Ewell. Throughout the trial, Scout and Jem witness their father\'s unwavering commitment to justice and moral principles, even as the prejudiced community opposes him. Despite strong evidence of Tom\'s innocence, the jury convicts him, reflecting the pervasive racism of the era.\n\nKey characters include Atticus, embodying moral integrity and justice; Tom Robinson, a dignified man victimized by systemic racism; and Boo Radley, a reclusive neighbor who represents kindness and protection. Scout\'s narration provides a child\'s perspective on complex moral issues.\n\nThe novel explores major themes including racism\'s destructive nature, the importance of moral courage, loss of innocence, and the gap between appearance and reality. Lee demonstrates how individual integrity can challenge unjust systems, even when change seems impossible.\n\nThis novel remains profoundly relevant, offering timeless lessons about courage, empathy, and standing against injustice. Harper Lee\'s beautiful prose and complex characters make this essential reading that continues to inspire generations toward greater moral awareness.',
    tips: 'Include title, author, and setting. Cover main plot and themes without excessive detail.'
  },
  {
    id: 27,
    category: 'Summaries',
    difficulty: 'advanced',
    title: 'Write an Executive Summary of an Article',
    prompt: 'Write a concise executive summary of a research article or substantial news article, highlighting key findings.',
    requirements: [
      'Article title and source',
      'Context and purpose clearly stated',
      'Key findings highlighted',
      'Significance and implications',
      'Concise and professional',
      'Suitable for busy professionals'
    ],
    minWords: 180,
    sampleAnswer: 'EXECUTIVE SUMMARY\n\nTitle: "The Impact of Remote Work on Employee Productivity and Well-being"\nSource: Journal of Business Research, June 2026\n\nCONTEXT\nThis research examined 500 employees across diverse industries who transitioned to remote work during 2024-2026, measuring productivity metrics and psychological well-being indicators.\n\nKEY FINDINGS\n1. Productivity increased 12% on average, with 78% of remote workers reporting they accomplished more work in fewer hours.\n2. Employee well-being showed mixed results: 72% reported improved work-life balance and reduced stress, while 28% experienced isolation-related challenges.\n3. Engagement levels were highest when organizations provided clear communication protocols and maintained regular team connections.\n4. Gender disparities emerged: women managing childcare responsibilities reported 18% lower productivity despite increased flexibility.\n\nIMPLICATIONS\nOrganizations implementing remote work should invest in communication infrastructure and provide mental health support, particularly for employees managing caregiving responsibilities. The data suggests hybrid models may optimize both productivity and well-being.\n\nRECOMMENDATION\nThe research supports strategic adoption of flexible work arrangements while emphasizing the critical importance of intentional community-building and equitable support structures.',
    tips: 'Be concise while capturing the essence of the material. Focus on significance and practical implications.'
  }
];

const WRITING_EXERCISES = expandExercisePool(BASE_WRITING_EXERCISES, 4, (exercise, variantIndex) => {
  if (variantIndex === 0) {
    return exercise;
  }

  const note = writingVariantNotes[variantIndex % writingVariantNotes.length];

  return {
    ...exercise,
    id: exercise.id + variantIndex * 1000,
    title: `${exercise.title} (${variantIndex + 1})`,
    prompt: `${exercise.prompt} ${note}`,
  };
});

const GRAMMAR_PATTERNS = [
  {
    pattern: /^[a-z]/m,
    type: 'Missing capitalization',
    description: 'Sentence should start with a capital letter',
    severity: 'warning' as const
  },
  {
    pattern: /[^.!?]\s*$/m,
    type: 'Missing punctuation',
    description: 'Sentence should end with proper punctuation (. ! ?)',
    severity: 'error' as const
  },
  {
    pattern: /\b(their|there|theyre)\b/gi,
    type: 'Possible confusion',
    description: 'Check usage of their/there/they\'re',
    severity: 'warning' as const
  },
  {
    pattern: /\b(your|youre)\b/gi,
    type: 'Possible confusion',
    description: 'Check usage of your/you\'re',
    severity: 'warning' as const
  },
  {
    pattern: /\b(its|it\'s)\b/gi,
    type: 'Possible confusion',
    description: 'Check usage of its/it\'s',
    severity: 'warning' as const
  },
  {
    pattern: /\b(affect|effect)\b/gi,
    type: 'Possible confusion',
    description: 'Check usage of affect/effect',
    severity: 'warning' as const
  },
  {
    pattern: /  +/g,
    type: 'Double spaces',
    description: 'Remove extra spaces between words',
    severity: 'error' as const
  }
];

export default function WritingPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isFree, loading: subLoading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const rotationDay = useLocalDateKey();

  const [exercises, setExercises] = useState<WritingExercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<WritingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<WritingExercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate effect for authentication
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading && !subLoading && user && !isFree() && !hasAccess('writing')) {
      setShowPaywall(true);
    }
  }, [authLoading, subLoading, user, isFree, hasAccess]);

  // Separate effect for data filtering (no hasAccess or isFree in dependencies)
  useEffect(() => {
    const shuffled = dailyShuffle(WRITING_EXERCISES, `writing-practice-${rotationDay}`);
    setExercises(isFree() ? shuffled.slice(0, 10) : shuffled);
  }, [rotationDay, isFree]);

  // Separate effect for filtering exercises (no hasAccess or isFree in dependencies)
  useEffect(() => {
    let filtered = exercises;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }

    if (difficultyFilter !== 'All') {
      filtered = filtered.filter((e) => e.difficulty === difficultyFilter);
    }

    setFilteredExercises(dailyShuffle(filtered, `writing-practice-${categoryFilter}-${difficultyFilter}-${rotationDay}`));
  }, [exercises, categoryFilter, difficultyFilter, rotationDay]);

  // If filters leave the list empty, automatically reset to show all exercises.
  useEffect(() => {
    if (exercises.length === 0) return;

    const hasActiveFilter = categoryFilter !== 'All' || difficultyFilter !== 'All';
    if (filteredExercises.length === 0 && hasActiveFilter) {
      setCategoryFilter('All');
      setDifficultyFilter('All');
    }
  }, [exercises.length, filteredExercises.length, categoryFilter, difficultyFilter]);

  const evaluateAnswer = (answer: string, exercise: WritingExercise): EvaluationResult => {
    const wordCount = tokenizeText(answer).length;
    const meetsMinWords = wordCount >= exercise.minWords;
    const normalizedAnswer = normalizeText(answer);
    const languageLooksEnglish = isLikelyEnglishText(answer);

    // Check which key points are covered
    const keyPointsCovered: string[] = [];
    const keyPointsMissing: string[] = [];

    exercise.requirements.forEach((requirement) => {
      const requirementTerms = extractMeaningfulTerms(requirement, 4);
      const matchedTerms = requirementTerms.filter((term) => normalizedAnswer.includes(term));
      const minimumMatches = requirementTerms.length <= 2 ? 1 : 2;

      if (matchedTerms.length >= minimumMatches || normalizedAnswer.includes(normalizeText(requirement))) {
        keyPointsCovered.push(requirement);
      } else {
        keyPointsMissing.push(requirement);
      }
    });

    const referenceTerms = extractMeaningfulTerms(`${exercise.prompt} ${exercise.sampleAnswer}`).slice(0, 20);
    const referenceMatches = referenceTerms.filter((term) => normalizedAnswer.includes(term));
    const requirementCoverage = keyPointsCovered.length / exercise.requirements.length;
    const referenceCoverage = referenceMatches.length / Math.max(1, referenceTerms.length);
    const meetsCoreCriteria =
      languageLooksEnglish &&
      meetsMinWords &&
      keyPointsCovered.length >= Math.ceil(exercise.requirements.length * 0.6) &&
      referenceMatches.length >= Math.max(3, Math.ceil(referenceTerms.length * 0.25));

    // Grammar checking
    const grammarIssues: GrammarIssue[] = [];
    const sentences = answer.match(/[^.!?]+[.!?]+/g) || [];

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();

      // Check capitalization
      if (/^[a-z]/.test(trimmed)) {
        grammarIssues.push({
          type: 'Capitalization',
          description: `"${trimmed.substring(0, 30)}..." should start with capital letter`,
          severity: 'warning'
        });
      }

      // Check ending punctuation
      if (!/[.!?]$/.test(trimmed)) {
        grammarIssues.push({
          type: 'Punctuation',
          description: `"${trimmed.substring(0, 30)}..." should end with punctuation`,
          severity: 'error'
        });
      }
    });

    // Check for double spaces
    if (answer.includes('  ')) {
      grammarIssues.push({
        type: 'Spacing',
        description: 'Remove double spaces between words',
        severity: 'error'
      });
    }

    const feedbackReasons: string[] = [];

    if (!languageLooksEnglish) {
      feedbackReasons.push('La respuesta parece no estar en inglés.');
    }
    if (!meetsMinWords) {
      feedbackReasons.push(`La respuesta es demasiado corta: necesita al menos ${exercise.minWords} palabras.`);
    }
    if (keyPointsMissing.length > 0) {
      feedbackReasons.push(`Faltan estos puntos: ${keyPointsMissing.slice(0, 3).join(', ')}${keyPointsMissing.length > 3 ? '...' : ''}.`);
    }
    if (grammarIssues.length > 0) {
      feedbackReasons.push(`Hay ${grammarIssues.length} observación(es) de gramática o formato.`);
    }
    if (referenceMatches.length < Math.max(3, Math.ceil(referenceTerms.length * 0.25))) {
      feedbackReasons.push('La respuesta no se parece lo suficiente a una respuesta válida del ejercicio.');
    }

    // Score calculation
    const contentScore = meetsCoreCriteria
      ? Math.min(100, Math.round((requirementCoverage * 75 + referenceCoverage * 25) * 100))
      : 0;

    const grammarScore = Math.max(
      0,
      100 - grammarIssues.length * (grammarIssues.some(i => i.severity === 'error') ? 15 : 5)
    );

    const overallScore = meetsCoreCriteria
      ? Math.round((contentScore * 0.6 + grammarScore * 0.4) / 10) * 10
      : Math.max(0, Math.round((contentScore * 0.7 + grammarScore * 0.3) / 10) * 10);

    return {
      wordCount,
      meetsMinWords,
      keyPointsCovered,
      keyPointsMissing,
      grammarIssues,
      contentScore: Math.round(contentScore),
      grammarScore: Math.round(grammarScore),
      overallScore: Math.max(0, Math.min(100, overallScore)),
      feedbackReasons
    };
  };

  const handleSubmit = () => {
    if (selectedExercise && userAnswer.trim()) {
      const result = evaluateAnswer(userAnswer, selectedExercise);
      setEvaluation(result);

      // Add to completed exercises
      if (!completedExercises.includes(selectedExercise.id)) {
        setCompletedExercises([...completedExercises, selectedExercise.id]);
      }
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setEvaluation(null);
    setShowSampleAnswer(false);
  };

  const getCategories = () => {
    const categories = new Set(exercises.map((e) => e.category));
    return ['All', ...Array.from(categories)];
  };

  const getDifficulties = () => {
    return ['All', 'beginner', 'intermediate', 'advanced'];
  };

  if (authLoading || subLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading writing exercises...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Please sign in to access the Writing Practice section.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (showPaywall) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <PaywallAlert
            isOpen={showPaywall}
            feature="Writing"
            plan="pro"
            onClose={() => setShowPaywall(false)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Progress */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-background/80 backdrop-blur border border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Completed Exercises</p>
                  <p className="text-2xl font-bold text-indigo-600">{completedExercises.length}</p>
                  <p className="text-xs text-gray-500">of {exercises.length} total</p>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(completedExercises.length / exercises.length) * 100}%`
                    }}
                  ></div>
                </div>

                <div className="pt-4 space-y-2">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  <div>
                    <label className="text-xs text-gray-600 block mb-2">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {getCategories().map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-2">Difficulty</label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {getDifficulties().map((diff) => (
                        <option key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedExercise ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-indigo-600" />
                    Writing Practice
                  </h1>
                  <p className="text-muted-foreground">
                    Improve your English writing with {filteredExercises.length} diverse exercises
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map((exercise) => (
                    <Card
                      key={exercise.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow bg-background/80 backdrop-blur border border-border/50"
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setUserAnswer('');
                        setEvaluation(null);
                        setShowSampleAnswer(false);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                            <CardDescription className="mt-1">{exercise.category}</CardDescription>
                          </div>
                          {completedExercises.includes(exercise.id) && (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`${
                              exercise.difficulty === 'beginner'
                                ? 'bg-green-100 text-green-800'
                                : exercise.difficulty === 'intermediate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {exercise.minWords} words
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{exercise.prompt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredExercises.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">No exercises match your filters.</p>
                      <div className="mt-4 flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCategoryFilter('All');
                            setDifficultyFilter('All');
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExercise(null);
                    handleReset();
                  }}
                  className="mb-4"
                >
                  ← Back to Exercises
                </Button>

                {/* Exercise Card */}
                <Card className="bg-background/90 backdrop-blur border border-border/50">
                  <CardHeader className="bg-primary/10 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{selectedExercise.title}</CardTitle>
                        <CardDescription className="text-base">{selectedExercise.category}</CardDescription>
                      </div>
                      <Badge
                        className={`${
                          selectedExercise.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : selectedExercise.difficulty === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedExercise.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-6">
                    {/* Prompt */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Task</h3>
                      <p className="text-foreground text-lg leading-relaxed">{selectedExercise.prompt}</p>
                    </div>

                    {/* Tips */}
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Tip:</strong> {selectedExercise.tips}
                      </AlertDescription>
                    </Alert>

                    {/* Requirements */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
                      <div className="space-y-2">
                        {selectedExercise.requirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {evaluation && evaluation.keyPointsCovered.includes(req) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                            )}
                            <span
                              className={
                                evaluation && evaluation.keyPointsCovered.includes(req)
                                  ? 'text-green-700'
                                  : 'text-foreground'
                              }
                            >
                              {req}
                            </span>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground mt-3">
                          Minimum: {selectedExercise.minWords} words
                        </p>
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Your Answer</h3>
                      <Textarea
                        placeholder="Type your response here..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={!!evaluation}
                        className="min-h-48 p-4 resize-vertical"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-muted-foreground">
                          <span
                            className={
                              userAnswer.trim().split(/\s+/).length >= selectedExercise.minWords
                                ? 'text-green-600 font-semibold'
                                : 'text-red-600'
                            }
                          >
                            {userAnswer.trim().split(/\s+/).filter(w => w).length}
                          </span>
                          {' '}/ {selectedExercise.minWords} words
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      {!evaluation ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!userAnswer.trim()}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                          Submit for Evaluation
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleReset}
                            variant="outline"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Try Again
                          </Button>
                          <Button
                            onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                            variant="outline"
                          >
                            {showSampleAnswer ? 'Hide' : 'Show'} Sample Answer
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluation Results */}
                {evaluation && (
                  <Card className="border-t-4 border-t-indigo-500 bg-background/90 backdrop-blur border border-border/50">
                    <CardHeader className="bg-primary/10">
                      <CardTitle>Evaluation Results</CardTitle>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Content Score</p>
                          <p className="text-2xl font-bold text-blue-600">{evaluation.contentScore}</p>
                          <p className="text-xs text-gray-600 mt-1">/100</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Grammar Score</p>
                          <p className="text-2xl font-bold text-green-600">{evaluation.grammarScore}</p>
                          <p className="text-xs text-gray-600 mt-1">/100</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Overall Score</p>
                          <p className="text-2xl font-bold text-indigo-600">{evaluation.overallScore}</p>
                          <p className="text-xs text-gray-600 mt-1">/100</p>
                        </div>
                      </div>

                      {/* Word Count */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Word Count</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  evaluation.meetsMinWords
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, (evaluation.wordCount / selectedExercise.minWords) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                            {evaluation.wordCount} / {selectedExercise.minWords}
                          </span>
                        </div>
                        {!evaluation.meetsMinWords && (
                          <p className="text-sm text-red-600 mt-2">
                            Add {selectedExercise.minWords - evaluation.wordCount} more words to meet the minimum requirement.
                          </p>
                        )}
                      </div>

                      {/* Key Points */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Key Points Covered</h3>
                        <div className="space-y-2">
                          {evaluation.keyPointsCovered.length > 0 ? (
                            evaluation.keyPointsCovered.map((point, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-green-700">{point}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">No key points identified yet.</p>
                          )}
                        </div>

                        {evaluation.keyPointsMissing.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Missing Points</h4>
                            <div className="space-y-2">
                              {evaluation.keyPointsMissing.map((point, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <XCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-orange-700">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grammar Issues */}
                      {evaluation.grammarIssues.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Grammar Suggestions</h3>
                          <div className="space-y-2">
                            {evaluation.grammarIssues.map((issue, i) => (
                              <Alert
                                key={i}
                                className={
                                  issue.severity === 'error'
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-yellow-50 border-yellow-200'
                                }
                              >
                                <AlertCircle
                                  className={`h-4 w-4 ${
                                    issue.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                                  }`}
                                />
                                <AlertDescription
                                  className={
                                    issue.severity === 'error' ? 'text-red-800' : 'text-yellow-800'
                                  }
                                >
                                  <strong>{issue.type}:</strong> {issue.description}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback Reasons */}
                      {evaluation.feedbackReasons.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">Why this needs improvement</h3>
                          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                            {evaluation.feedbackReasons.map((reason, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-foreground">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Sample Answer */}
                {evaluation && showSampleAnswer && (
                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Sample Answer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedExercise.sampleAnswer}
                      </p>
                      <p className="text-sm text-gray-600 mt-4 italic">
                        Note: This is one possible answer. Your approach may be equally valid if it covers
                        the key requirements and demonstrates good writing skills.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
