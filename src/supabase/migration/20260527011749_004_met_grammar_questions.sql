/*
  # Additional Michigan English Test Grammar Questions

  1. Adding 20 Michigan English Test specific grammar questions
  2. Covering various grammar topics relevant to the MET
  3. Multiple choice format with 4 options each
*/

-- Michigan English Test Grammar Questions
INSERT INTO grammar_exercises (question, options, correct_answer, explanation, difficulty, category) VALUES
-- Verb Tenses
('The students _____ their homework when the teacher entered the room.', '["were doing", "did", "have done", "are doing"]', 'were doing', 'Past continuous tense describes an ongoing action interrupted by another past event.', 'medium', 'verb-tenses'),

('By next June, I _____ here for ten years.', '["will work", "will have worked", "am working", "have worked"]', 'will have worked', 'Future perfect tense indicates an action completed before a specific future time.', 'hard', 'verb-tenses'),

('She _____ English for five years before she moved to London.', '["studies", "has studied", "had studied", "studied"]', 'had studied', 'Past perfect tense shows an action completed before another past action.', 'medium', 'verb-tenses'),

('This time tomorrow, we _____ on the beach.', '["will lie", "will be lying", "are lying", "lie"]', 'will be lying', 'Future continuous describes an action in progress at a specific future time.', 'medium', 'verb-tenses'),

-- Conditionals
('If I had known about the traffic, I _____ earlier.', '["will leave", "would leave", "would have left", "had left"]', 'would have left', 'Third conditional expresses hypothetical past situations with past perfect and would have + past participle.', 'hard', 'conditionals'),

('Unless you study hard, you _____ the exam.', '["won''t pass", "don''t pass", "wouldn''t pass", "didn''t pass"]', 'won''t pass', 'First conditional with "unless" (if not) - negative future result.', 'medium', 'conditionals'),

('_____ you need any help, please let me know.', '["If", "Unless", "Should", "Would"]', 'Should', 'Inverted conditional: "Should" at the beginning is a formal way to express "if".', 'hard', 'conditionals'),

-- Articles
('_____ Mount Everest is the highest mountain in the world.', '["A", "An", "The", "No article"]', 'No article', 'No article is used with the names of most mountains.', 'medium', 'articles'),

('She plays _____ violin in the orchestra.', '["a", "an", "the", "no article"]', 'the', 'The definite article "the" is used with musical instruments.', 'easy', 'articles'),

('Many people consider _____ English language to be easy to learn.', '["a", "an", "the", "no article"]', 'the', 'The definite article "the" is used when referring to a specific language by name.', 'medium', 'articles'),

-- Prepositions
('The meeting has been postponed _____ next Tuesday.', '["to", "on", "at", "in"]', 'to', 'The preposition "to" indicates movement or extension to a future time.', 'easy', 'prepositions'),

('She is very good _____ solving problems.', '["in", "at", "on", "for"]', 'at', 'The adjective "good" is followed by the preposition "at" when describing skills.', 'easy', 'prepositions'),

('The book was written _____ a famous author.', '["from", "by", "with", "of"]', 'by', 'The preposition "by" is used in passive constructions to indicate the agent.', 'easy', 'prepositions'),

-- Relative Clauses
('The book _____ I bought yesterday is very interesting.', '["who", "which", "whose", "whom"]', 'which', 'The relative pronoun "which" is used for things in defining relative clauses.', 'easy', 'relative-clauses'),

('The woman _____ car was stolen called the police.', '["who", "which", "whose", "whom"]', 'whose', 'The relative pronoun "whose" shows possession and can be used for people or things.', 'medium', 'relative-clauses'),

-- Passive Voice
('The report _____ by the committee yesterday.', '["was written", "is written", "has been written", "were written"]', 'was written', 'Past simple passive: was/were + past participle describes a completed past action.', 'medium', 'passive-voice'),

('All the tickets _____ before we arrived.', '["have been sold", "had been sold", "were sold", "are sold"]', 'had been sold', 'Past perfect passive indicates an action completed before another past event.', 'hard', 'passive-voice'),

-- Modals
('You _____ wear a uniform to school; it''s mandatory.', '["can", "may", "must", "could"]', 'must', 'The modal verb "must" expresses obligation or necessity.', 'easy', 'modals'),

('You _____ have seen him at the party; he wasn''t there.', '["can''t", "mustn''t", "shouldn''t", "wouldn''t"]', 'can''t', 'Modal perfect: "can''t have + past participle" expresses logical deduction about the past.', 'hard', 'modals'),

('Students _____ use dictionaries during the test.', '["mustn''t", "needn''t", "couldn''t", "wouldn''t"]', 'needn''t', 'The modal "needn''t" expresses lack of necessity or permission not to do something.', 'hard', 'modals');
