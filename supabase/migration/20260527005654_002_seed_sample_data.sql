/*
  # Sample Data for MET Prep Application

  1. Grammar Exercises
    - Adding sample grammar exercises covering various topics
    - Verb tenses, conditionals, articles, prepositions
    - Easy, medium, and hard difficulty levels

  2. Vocabulary Exercises
    - Adding sample vocabulary words with definitions
    - Multiple choice options for each word
    - Example sentences for context

  3. Reading Passages and Questions
    - Adding reading comprehension passages
    - Questions covering main idea, details, inference
    - Various difficulty levels
*/

-- Grammar Exercises
INSERT INTO grammar_exercises (question, options, correct_answer, explanation, difficulty, category) VALUES
-- Verb Tenses - Easy
('She ___ to the store yesterday.', '["goes", "went", "gone", "going"]', 'went', 'Simple past tense is used for completed actions in the past.', 'easy', 'verb-tenses'),
('They ___ playing football when it started to rain.', '["are", "were", "was", "is"]', 'were', 'Past continuous tense (was/were + -ing) describes ongoing actions interrupted by another event.', 'easy', 'verb-tenses'),
('I ___ my homework before dinner.', '["finish", "finished", "have finished", "had finished"]', 'finished', 'Simple past tense for completed actions in the past.', 'easy', 'verb-tenses'),

-- Verb Tenses - Medium
('By the time she arrived, we ___ waiting for two hours.', '["have been", "had been", "were", "are"]', 'had been', 'Past perfect continuous shows an action that started before another past action.', 'medium', 'verb-tenses'),
('Next year, I ___ here for ten years.', '["will work", "will have worked", "am working", "work"]', 'will have worked', 'Future perfect tense shows an action that will be completed before a specific future time.', 'medium', 'verb-tenses'),
('She ___ in London for five years before moving to Paris.', '["lives", "has lived", "had lived", "lived"]', 'had lived', 'Past perfect tense for an action completed before another past action.', 'medium', 'verb-tenses'),

-- Verb Tenses - Hard
('If I had known about the meeting, I ___ .', '["would come", "would have come", "will come", "came"]', 'would have come', 'Third conditional: would have + past participle for hypothetical past situations.', 'hard', 'verb-tenses'),
('The report must ___ before the deadline.', '["submit", "be submitted", "be submitting", "have submit"]', 'be submitted', 'Passive voice with modal verb: must + be + past participle.', 'hard', 'verb-tenses'),

-- Conditionals - Easy
('If it rains, we ___ the picnic.', '["cancel", "will cancel", "would cancel", "cancelled"]', 'will cancel', 'First conditional: if + present simple, will + infinitive for real future possibilities.', 'easy', 'conditionals'),
('If you study hard, you ___ the exam.', '["pass", "will pass", "would pass", "passed"]', 'will pass', 'First conditional for likely future results.', 'easy', 'conditionals'),

-- Conditionals - Medium
('I would buy that car if I ___ more money.', '["have", "had", "would have", "have had"]', 'had', 'Second conditional: if + past simple, would + infinitive for unreal present situations.', 'medium', 'conditionals'),
('If she ___ more carefully, she wouldn''t have made that mistake.', '["works", "worked", "had worked", "would work"]', 'had worked', 'Third conditional: if + past perfect, would have + past participle for unreal past situations.', 'medium', 'conditionals'),

-- Conditionals - Hard
('Had I known about the issue, I ___ it immediately.', '["would fix", "would have fixed", "will fix", "fixed"]', 'would have fixed', 'Inverted third conditional: Had + subject + past perfect, would have + past participle.', 'hard', 'conditionals'),
('Were she here, she ___ the answer.', '["knows", "would know", "will know", "knew"]', 'would know', 'Inverted second conditional: Were + subject, would + infinitive.', 'hard', 'conditionals'),

-- Articles - Easy
('I saw ___ cat in the garden.', '["a", "an", "the", "no article"]', 'a', 'Indefinite article "a" is used for first mention of a non-specific noun.', 'easy', 'articles'),
('She is ___ honest person.', '["a", "an", "the", "no article"]', 'an', 'Article "an" is used before words starting with a vowel sound.', 'easy', 'articles'),

-- Articles - Medium
('___ Amazon River is the largest river in South America.', '["A", "An", "The", "No article"]', 'The', 'Definite article "the" is used for unique geographical features and specific nouns.', 'medium', 'articles'),
('He went to ___ hospital to visit his friend.', '["a", "an", "the", "no article"]', 'the', 'When referring to the institution for a specific purpose, use "the".', 'medium', 'articles'),

-- Articles - Hard
('___ most people enjoy music.', '["A", "An", "The", "No article"]', 'No article', 'No article with plural/uncountable nouns in general statements.', 'hard', 'articles'),
('She plays ___ piano beautifully.', '["a", "an", "the", "no article"]', 'the', 'Definite article "the" is used with musical instruments.', 'hard', 'articles'),

-- Prepositions - Easy
('The book is ___ the table.', '["in", "on", "at", "under"]', 'on', 'Preposition "on" indicates position on a surface.', 'easy', 'prepositions'),
('I arrive ___ work at 9 AM.', '["to", "at", "in", "on"]', 'at', 'Preposition "at" is used with specific places and points.', 'easy', 'prepositions'),

-- Prepositions - Medium
('She is good ___ mathematics.', '["in", "at", "on", "for"]', 'at', 'Adjective + at + subject: good at, bad at, excellent at.', 'medium', 'prepositions'),
('I have been waiting ___ two hours.', '["since", "for", "during", "while"]', 'for', 'For + duration of time; since + point in time.', 'medium', 'prepositions'),

-- Prepositions - Hard
('He is independent ___ his parents.', '["from", "of", "with", "to"]', 'of', 'Adjective + of: independent of, afraid of, capable of.', 'hard', 'prepositions'),
('The result was contrary ___ our expectations.', '["with", "to", "of", "for"]', 'to', 'Adjective + to: contrary to, similar to, equal to.', 'hard', 'prepositions');

-- Vocabulary Exercises
INSERT INTO vocabulary_exercises (word, definition, options, correct_answer, example_sentence, difficulty, category) VALUES
-- Easy
('abundant', 'Existing in large quantities; plentiful', '["scarce", "abundant", "limited", "rare"]', 'abundant', 'The region has abundant natural resources.', 'easy', 'adjective'),
('analyze', 'To examine in detail to understand something', '["create", "destroy", "analyze", "ignore"]', 'analyze', 'Scientists analyze data to draw conclusions.', 'easy', 'verb'),
('crucial', 'Of great importance, especially in the success or failure of something', '["unimportant", "trivial", "crucial", "optional"]', 'crucial', 'Proper preparation is crucial for success.', 'easy', 'adjective'),

-- Medium
('meticulous', 'Showing great attention to detail; very careful and precise', '["careless", "meticulous", "hasty", "sloppy"]', 'meticulous', 'She is meticulous about keeping accurate records.', 'medium', 'adjective'),
('mitigate', 'To make less severe, serious, or painful', '["worsen", "mitigate", "increase", "ignore"]', 'mitigate', 'Steps were taken to mitigate the effects of the disaster.', 'medium', 'verb'),
('ubiquitous', 'Present, appearing, or found everywhere', '["rare", "ubiquitous", "scarce", "hidden"]', 'ubiquitous', 'Smartphones have become ubiquitous in modern society.', 'medium', 'adjective'),

-- Hard
('ephemeral', 'Lasting for a very short time', '["permanent", "eternal", "ephemeral", "enduring"]', 'ephemeral', 'The beauty of cherry blossoms is ephemeral, lasting only a few days.', 'hard', 'adjective'),
('obfuscate', 'To render obscure, unclear, or unintelligible', '["clarify", "explain", "obfuscate", "simplify"]', 'obfuscate', 'The politician tried to obfuscate the issue with complex explanations.', 'hard', 'verb'),
('paradigm', 'A typical example or pattern of something; a model', '["exception", "paradigm", "deviation", "error"]', 'paradigm', 'The discovery challenged the existing scientific paradigm.', 'hard', 'noun');

-- Reading Passages
INSERT INTO reading_passages (title, content, difficulty, category) VALUES
(
  'The Digital Revolution in Education',
  'The digital revolution has transformed nearly every aspect of modern life, and education is no exception. From interactive whiteboards to online learning platforms, technology has fundamentally changed how students learn and teachers teach. One of the most significant developments has been the rise of massive open online courses (MOOCs), which have made high-quality education accessible to millions of people worldwide who previously had limited educational opportunities.

However, the integration of technology in education is not without its challenges. Critics argue that excessive screen time can negatively impact student attention spans and social development. Additionally, the digital divide – the gap between those who have access to technology and those who do not – has raised concerns about educational equity.

Despite these challenges, the benefits of technology in education are undeniable. Students can access vast amounts of information instantly, collaborate with peers across the globe, and receive personalized learning experiences tailored to their individual needs. As technology continues to evolve, educators must find ways to maximize its benefits while minimizing its drawbacks, ensuring that all students can thrive in the digital age.',
  'medium',
  'academic'
),
(
  'The Art of Sustainable Gardening',
  'Sustainable gardening has become increasingly popular as people seek to reduce their environmental impact while creating beautiful outdoor spaces. This approach to gardening emphasizes working with nature rather than against it, using organic methods to maintain soil health and promote biodiversity.

Key principles of sustainable gardening include composting, which transforms kitchen scraps and yard waste into nutrient-rich soil amendments, and rainwater harvesting, which conserves water resources. Gardeners also choose native plants adapted to local climate conditions, reducing the need for additional watering and fertilizer.

One of the most rewarding aspects of sustainable gardening is creating habitats for local wildlife. By incorporating diverse plant species and avoiding harmful chemicals, gardeners can attract beneficial insects, birds, and other creatures that help maintain ecological balance. This creates a thriving ecosystem right in one''s backyard, demonstrating how individual actions can contribute to environmental conservation.',
  'easy',
  'narrative'
),
(
  'The Complexity of Language Acquisition',
  'Language acquisition represents one of the most remarkable cognitive achievements of the human mind. Children acquire language with seemingly effortless speed, mastering complex grammatical rules and thousands of words within just a few years. This process has fascinated linguists and psychologists for decades, leading to numerous theories about how language is learned.

The nativist perspective, championed by Noam Chomsky, suggests that humans are born with an innate language acquisition device that contains universal grammatical principles. According to this view, the human brain is pre-wired for language, and environmental input simply triggers this innate capacity. Evidence for this theory includes the fact that all children go through similar stages of language development, regardless of the specific language they are learning.

In contrast, the interactionist perspective emphasizes the role of social interaction and environmental input in language acquisition. Proponents argue that language learning is a social process that occurs through meaningful communication with caregivers and peers. They point to research showing that the quality and quantity of language input significantly affects children''s vocabulary development and grammatical complexity.

Recent neuroscientific research has provided new insights into the biological basis of language learning. Brain imaging studies have revealed that language processing involves complex networks distributed across multiple brain regions, with different areas specializing in aspects such as phonology, semantics, and syntax. The plasticity of the young brain likely contributes to children''s superior language learning abilities compared to adults.',
  'hard',
  'academic'
),
(
  'A Morning Walk in the Forest',
  'Last Saturday morning, I woke up early and decided to take a walk in the nearby forest. The sun was just beginning to rise, casting golden rays through the canopy of trees. The air was crisp and smelled of pine needles and damp earth.

As I walked along the winding path, I noticed a family of deer grazing in a small clearing. They were so focused on their breakfast that they didn''t notice me at first. When a young fawn finally lifted its head and spotted me, it froze in place before darting behind its mother. I stood perfectly still, watching them until they gracefully bounded away into the deeper woods.

The forest was alive with sounds – birds singing their morning songs, squirrels chattering in the branches, and the gentle rustle of leaves in the breeze. I came across a small stream where I paused to watch the water flow over smooth rocks. The experience reminded me how important it is to slow down and appreciate the natural world around us.',
  'easy',
  'narrative'
);

-- Reading Questions
INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What is the main focus of this passage?', '["The history of education", "The impact of technology on education", "The problems with traditional schooling", "The future of universities"]', 'The impact of technology on education', 'main-idea'
FROM reading_passages WHERE title = 'The Digital Revolution in Education';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'According to the passage, what is one of the most significant developments in educational technology?', '["Interactive whiteboards", "Massive open online courses (MOOCs)", "Educational apps", "Video conferencing"]', 'Massive open online courses (MOOCs)', 'detail'
FROM reading_passages WHERE title = 'The Digital Revolution in Education';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What concern does the author mention regarding educational equity?', '["Teacher qualifications", "The digital divide", "Budget cuts", "Classroom size"]', 'The digital divide', 'detail'
FROM reading_passages WHERE title = 'The Digital Revolution in Education';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What can be inferred about the author''s attitude toward educational technology?', '["The author is strongly opposed to it", "The author sees both benefits and challenges", "The author believes it should replace traditional methods", "The author thinks it is overhyped"]', 'The author sees both benefits and challenges', 'inference'
FROM reading_passages WHERE title = 'The Digital Revolution in Education';

-- Questions for "The Art of Sustainable Gardening"
INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What is the main purpose of sustainable gardening?', '["To create expensive gardens", "To reduce environmental impact", "To grow exotic plants", "To compete with neighbors"]', 'To reduce environmental impact', 'main-idea'
FROM reading_passages WHERE title = 'The Art of Sustainable Gardening';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'Which of the following is mentioned as a principle of sustainable gardening?', '["Using chemical fertilizers", "Composting kitchen scraps", "Removing all native plants", "Watering daily"]', 'Composting kitchen scraps', 'detail'
FROM reading_passages WHERE title = 'The Art of Sustainable Gardening';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'Why do sustainable gardeners choose native plants?', '["They are always cheaper", "They are adapted to local conditions", "They are more colorful", "They require more maintenance"]', 'They are adapted to local conditions', 'detail'
FROM reading_passages WHERE title = 'The Art of Sustainable Gardening';

-- Questions for "The Complexity of Language Acquisition"
INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What is the main topic of this passage?', '["The history of language", "Theories of language acquisition", "Different world languages", "Teaching methods"]', 'Theories of language acquisition', 'main-idea'
FROM reading_passages WHERE title = 'The Complexity of Language Acquisition';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'According to the nativist perspective, what do humans possess at birth?', '["Knowledge of all languages", "An innate language acquisition device", "Perfect grammar skills", "A complete vocabulary"]', 'An innate language acquisition device', 'detail'
FROM reading_passages WHERE title = 'The Complexity of Language Acquisition';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What evidence supports the nativist theory?', '["Children learn languages at different rates", "All children go through similar language development stages", "Adults learn languages faster than children", "Environmental factors are unimportant"]', 'All children go through similar language development stages', 'detail'
FROM reading_passages WHERE title = 'The Complexity of Language Acquisition';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What does recent neuroscience research reveal about language processing?', '["It only involves one brain region", "It involves complex networks across multiple regions", "It is identical to visual processing", "It has no biological basis"]', 'It involves complex networks across multiple regions', 'detail'
FROM reading_passages WHERE title = 'The Complexity of Language Acquisition';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What can be inferred about the author''s view on language acquisition?', '["Only one theory explains it completely", "Multiple perspectives contribute to understanding", "Adults learn language better than children", "Environmental factors are most important"]', 'Multiple perspectives contribute to understanding', 'inference'
FROM reading_passages WHERE title = 'The Complexity of Language Acquisition';

-- Questions for "A Morning Walk in the Forest"
INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What time of day did the narrator take the walk?', '["Afternoon", "Evening", "Morning", "Night"]', 'Morning', 'detail'
FROM reading_passages WHERE title = 'A Morning Walk in the Forest';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'How did the deer react when they noticed the narrator?', '["They approached", "They ran away immediately", "The fawn froze before they bounded away", "They ignored the narrator"]', 'The fawn froze before they bounded away', 'detail'
FROM reading_passages WHERE title = 'A Morning Walk in the Forest';

INSERT INTO reading_questions (passage_id, question, options, correct_answer, question_type) 
SELECT id, 'What is the main theme of this passage?', '["The dangers of hiking alone", "Appreciating the beauty of nature", "Wildlife photography techniques", "Morning exercise routines"]', 'Appreciating the beauty of nature', 'main-idea'
FROM reading_passages WHERE title = 'A Morning Walk in the Forest';
