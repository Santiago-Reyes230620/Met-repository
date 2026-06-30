"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaywallAlert } from "@/components/shared/PaywallAlert";
import {
  Headphones,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

const categories = [
  { id: "conversations", name: "Conversations" },
  { id: "lectures", name: "Lectures" },
  { id: "interviews", name: "Interviews" },
  { id: "announcements", name: "Announcements" },
  { id: "directions", name: "Directions" },
  { id: "news", name: "News Reports" },
  { id: "phone", name: "Phone Calls" },
  { id: "daily", name: "Daily Life" },
];

interface ListeningExercise {
  id: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  title: string;
  transcript: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  speed: 0.7 | 0.85 | 1;
}

const listeningExercises: ListeningExercise[] = [
  // === CONVERSATIONS - Beginner ===
  {
    id: 1,
    category: "conversations",
    difficulty: "beginner",
    title: "Coffee Shop Order",
    transcript: "Barista: Good morning! What can I get for you today? Customer: Hi, I'd like a medium latte with oat milk, please. Barista: Sure! Would you like any flavor added? Customer: No, just the latte is fine. How much is it? Barista: That'll be four dollars and fifty cents. Customer: Here you go. Thanks!",
    question: "What does the customer order?",
    options: ["A large cappuccino with regular milk", "A medium latte with oat milk", "A small black coffee", "A medium latte with vanilla flavor"],
    correctAnswer: 1,
    explanation: "The customer says 'I'd like a medium latte with oat milk' and declines the flavor offer.",
    speed: 0.85,
  },
  {
    id: 2,
    category: "conversations",
    difficulty: "beginner",
    title: "Meeting a Neighbor",
    transcript: "Tom: Hi there! I'm Tom, I just moved in next door. Sarah: Oh hi Tom! I'm Sarah. Welcome to the neighborhood! Tom: Thanks! Is there a good grocery store nearby? Sarah: Yes, there's one on Main Street, about two blocks from here. It's called Fresh Market. Tom: Great, I'll check it out. Thanks for the tip!",
    question: "Where is the grocery store located?",
    options: ["On Park Avenue", "On Main Street, two blocks away", "Next to the apartment", "Across the street"],
    correctAnswer: 1,
    explanation: "Sarah says the grocery store is on Main Street, about two blocks away.",
    speed: 0.85,
  },
  {
    id: 3,
    category: "conversations",
    difficulty: "beginner",
    title: "At the Restaurant",
    transcript: "Waiter: Are you ready to order? Customer: Yes, I'll have the grilled salmon with a side salad, please. Waiter: Would you like anything to drink? Customer: Just a glass of water, thanks. Waiter: Perfect. Your food will be ready in about fifteen minutes.",
    question: "How long will the food take to be ready?",
    options: ["Five minutes", "Ten minutes", "Fifteen minutes", "Twenty minutes"],
    correctAnswer: 2,
    explanation: "The waiter says 'Your food will be ready in about fifteen minutes.'",
    speed: 0.85,
  },
  {
    id: 4,
    category: "conversations",
    difficulty: "beginner",
    title: "Booking a Hotel Room",
    transcript: "Receptionist: Grand Hotel, how can I help you? Guest: I'd like to book a room for two nights, please. Starting this Friday. Receptionist: A single or a double room? Guest: A double room, please. What's the rate? Receptionist: The double room is one hundred and twenty dollars per night, including breakfast. Guest: That sounds great. I'll take it.",
    question: "What is the price per night for the double room?",
    options: ["$100", "$120", "$150", "$200"],
    correctAnswer: 1,
    explanation: "The receptionist says the double room is one hundred and twenty dollars per night.",
    speed: 0.85,
  },
  {
    id: 5,
    category: "conversations",
    difficulty: "beginner",
    title: "At the Doctor's Office",
    transcript: "Doctor: What seems to be the problem? Patient: I've had a headache for three days and I feel really tired. Doctor: Do you have any other symptoms? Patient: My throat is a bit sore too. Doctor: Let me check your temperature. It's slightly elevated. I'll prescribe some medication. Take it twice a day for five days.",
    question: "How often should the patient take the medication?",
    options: ["Once a day", "Twice a day", "Three times a day", "Every four hours"],
    correctAnswer: 1,
    explanation: "The doctor says 'Take it twice a day for five days.'",
    speed: 0.85,
  },

  // === CONVERSATIONS - Intermediate ===
  {
    id: 6,
    category: "conversations",
    difficulty: "intermediate",
    title: "Discussing Weekend Plans",
    transcript: "Mike: Hey Lisa, do you have any plans for the weekend? Lisa: Not really. I was thinking about going to the art exhibition downtown. They have a new collection of impressionist paintings. Mike: Oh that sounds interesting! What time does it open? Lisa: It opens at ten in the morning and closes at six. Tickets are fifteen dollars if we book online. Mike: Let's go on Saturday morning then. I can drive us there. Lisa: Perfect! We could grab lunch at that Italian place nearby afterward. Mike: Great idea. I'll pick you up at nine thirty.",
    question: "What time will Mike pick Lisa up?",
    options: ["At 9:00 AM", "At 9:30 AM", "At 10:00 AM", "At 10:30 AM"],
    correctAnswer: 1,
    explanation: "Mike says 'I'll pick you up at nine thirty.'",
    speed: 0.85,
  },
  {
    id: 7,
    category: "conversations",
    difficulty: "intermediate",
    title: "Office Project Discussion",
    transcript: "Manager: How's the quarterly report coming along? Employee: I've finished the data analysis and the charts. I just need to write the executive summary and conclusions. Manager: Good. When can you have it ready? Employee: By Wednesday afternoon at the latest. Manager: The board meeting is on Thursday morning, so that works. Make sure to include the revenue projections for next quarter. Employee: Will do. Should I send it to you first for review? Manager: Yes, please. I'd like to look it over before Thursday.",
    question: "When is the board meeting?",
    options: ["Tuesday morning", "Wednesday afternoon", "Thursday morning", "Friday morning"],
    correctAnswer: 2,
    explanation: "The manager says 'The board meeting is on Thursday morning.'",
    speed: 0.85,
  },
  {
    id: 8,
    category: "conversations",
    difficulty: "intermediate",
    title: "Apartment Viewing",
    transcript: "Agent: This is the two-bedroom apartment I mentioned. It has a spacious living room, a modern kitchen with stainless steel appliances, and a balcony with a city view. Tenant: It looks nice. What about laundry facilities? Agent: There's a shared laundry room on the ground floor. The rent is eighteen hundred dollars per month, and we require first month's rent and a security deposit equal to one month's rent. Tenant: Are utilities included? Agent: Water and trash are included. Electricity and internet are the tenant's responsibility.",
    question: "What utilities are included in the rent?",
    options: ["Electricity and internet", "Water, trash, and electricity", "Water and trash only", "All utilities are included"],
    correctAnswer: 2,
    explanation: "The agent says 'Water and trash are included' while electricity and internet are the tenant's responsibility.",
    speed: 0.85,
  },

  // === LECTURES - Intermediate ===
  {
    id: 9,
    category: "lectures",
    difficulty: "intermediate",
    title: "Introduction to Climate Change",
    transcript: "Today we'll discuss the primary causes of climate change. The main driver is the burning of fossil fuels such as coal, oil, and natural gas, which releases carbon dioxide into the atmosphere. This traps heat from the sun, creating what scientists call the greenhouse effect. The three most significant greenhouse gases are carbon dioxide, methane, and nitrous oxide. Since the industrial revolution began in the late eighteenth century, global temperatures have risen by approximately one point one degrees Celsius.",
    question: "How much has the global temperature risen since the industrial revolution?",
    options: ["0.5 degrees Celsius", "1.1 degrees Celsius", "1.5 degrees Celsius", "2.0 degrees Celsius"],
    correctAnswer: 1,
    explanation: "The lecture states global temperatures have risen by approximately one point one degrees Celsius.",
    speed: 0.85,
  },
  {
    id: 10,
    category: "lectures",
    difficulty: "intermediate",
    title: "The Water Cycle",
    transcript: "The water cycle, also known as the hydrologic cycle, describes the continuous movement of water on, above, and below the surface of the Earth. The process begins with evaporation, where the sun heats water in oceans, lakes, and rivers, turning it into vapor. This vapor rises into the atmosphere and cools, forming clouds through a process called condensation. When the clouds become too heavy, precipitation occurs in the form of rain, snow, or hail. The water then flows back into bodies of water through runoff or seeps into the ground through infiltration.",
    question: "What is the process called when water vapor cools and forms clouds?",
    options: ["Evaporation", "Precipitation", "Condensation", "Infiltration"],
    correctAnswer: 2,
    explanation: "The lecture explains that vapor cools and forms clouds through a process called condensation.",
    speed: 0.85,
  },
  {
    id: 11,
    category: "lectures",
    difficulty: "intermediate",
    title: "History of the Internet",
    transcript: "The internet originated from a project called ARPANET, funded by the United States Department of Defense in the late nineteen sixties. Its initial purpose was to create a decentralized communication network that could survive a military attack. In nineteen eighty-nine, Tim Berners-Lee at CERN invented the World Wide Web, which made the internet accessible to the general public. By the year two thousand, approximately three hundred and sixty million people were using the internet worldwide. Today, that number exceeds five billion users.",
    question: "When was the World Wide Web invented?",
    options: ["In the late 1960s", "In 1989", "In the year 2000", "In 1995"],
    correctAnswer: 1,
    explanation: "The lecture states that Tim Berners-Lee invented the World Wide Web in nineteen eighty-nine.",
    speed: 0.85,
  },

  // === LECTURES - Advanced ===
  {
    id: 12,
    category: "lectures",
    difficulty: "advanced",
    title: "Quantum Mechanics Principles",
    transcript: "Quantum mechanics demonstrates that particles can exist in multiple states simultaneously until they are observed. This phenomenon is known as superposition. A related concept is quantum entanglement, where two particles become connected so that the state of one instantly influences the other, regardless of the distance between them. Einstein famously referred to this as 'spooky action at a distance.' The uncertainty principle, formulated by Heisenberg, states that we cannot simultaneously know both the exact position and momentum of a particle. The more precisely we measure one, the less precisely we can know the other.",
    question: "What does the uncertainty principle state?",
    options: [
      "Particles can exist in multiple states at once",
      "Two particles can be connected across any distance",
      "We cannot simultaneously know both the exact position and momentum of a particle",
      "Observing a particle changes its state"
    ],
    correctAnswer: 2,
    explanation: "Heisenberg's uncertainty principle states we cannot simultaneously know both the exact position and momentum of a particle.",
    speed: 0.7,
  },

  // === INTERVIEWS - Intermediate ===
  {
    id: 13,
    category: "interviews",
    difficulty: "intermediate",
    title: "Job Interview - Marketing Position",
    transcript: "Interviewer: Tell me about a successful campaign you managed. Candidate: At my previous company, I led a social media campaign for a new product launch. We targeted young adults aged eighteen to thirty. The campaign ran for six weeks and resulted in a forty percent increase in brand awareness and a twenty-five percent boost in sales compared to our projections. Interviewer: That's impressive. How did you measure brand awareness? Candidate: We used a combination of surveys and social media analytics, tracking mentions, shares, and engagement rates across all platforms.",
    question: "How much did sales increase compared to projections?",
    options: ["15%", "20%", "25%", "40%"],
    correctAnswer: 2,
    explanation: "The candidate mentions a twenty-five percent boost in sales compared to projections.",
    speed: 0.85,
  },
  {
    id: 14,
    category: "interviews",
    difficulty: "intermediate",
    title: "Celebrity Interview",
    transcript: "Host: Your latest film has been a huge success. What inspired the story? Actor: It was based on my grandmother's experience immigrating to this country in the nineteen fifties. She faced incredible challenges but never gave up. I wanted to honor that generation's resilience. Host: How long did it take to write the screenplay? Actor: About three years. I did extensive research, interviewing over thirty families who had similar experiences. Host: That dedication really shows in the final product.",
    question: "What inspired the actor's latest film?",
    options: [
      "A novel they read",
      "Their grandmother's immigration experience in the 1950s",
      "A documentary about immigration",
      "A news story they saw on television"
    ],
    correctAnswer: 1,
    explanation: "The actor says the film was based on their grandmother's experience immigrating to this country in the nineteen fifties.",
    speed: 0.85,
  },

  // === ANNOUNCEMENTS - Beginner ===
  {
    id: 15,
    category: "announcements",
    difficulty: "beginner",
    title: "Airport Flight Delay",
    transcript: "Attention passengers. This is an announcement for flight twenty-four five to New York. We regret to inform you that this flight has been delayed by thirty minutes due to severe weather conditions. The new departure time is three forty-five PM. Please remain in the gate area for further updates. We apologize for the inconvenience.",
    question: "What is the new departure time for flight 245?",
    options: ["3:15 PM", "3:45 PM", "4:00 PM", "4:15 PM"],
    correctAnswer: 1,
    explanation: "The announcement states the new departure time is three forty-five PM.",
    speed: 0.85,
  },
  {
    id: 16,
    category: "announcements",
    difficulty: "beginner",
    title: "School Cancellation",
    transcript: "Good morning. Due to heavy snowfall overnight, all schools in the district will be closed today, Monday, January fifteenth. All after-school activities and sports practices are also cancelled. School buses will not be running. Please check the district website for updates regarding tomorrow's schedule. Stay safe and warm!",
    question: "What date are the schools closed?",
    options: ["January 13th", "January 14th", "January 15th", "January 16th"],
    correctAnswer: 2,
    explanation: "The announcement says schools will be closed on Monday, January fifteenth.",
    speed: 0.85,
  },
  {
    id: 17,
    category: "announcements",
    difficulty: "beginner",
    title: "Museum Closing Early",
    transcript: "Attention all visitors. The National History Museum will be closing at two PM today instead of the usual six PM, due to a private event this evening. The gift shop will remain open until two thirty. We apologize for any inconvenience. Regular hours will resume tomorrow. Thank you for visiting.",
    question: "What time will the gift shop close?",
    options: ["2:00 PM", "2:30 PM", "3:00 PM", "6:00 PM"],
    correctAnswer: 1,
    explanation: "The announcement says the gift shop will remain open until two thirty.",
    speed: 0.85,
  },
  {
    id: 18,
    category: "announcements",
    difficulty: "beginner",
    title: "Train Platform Change",
    transcript: "Attention passengers traveling to Boston on the ten fifteen AM express train. This train will now depart from platform number seven instead of platform three. I repeat, the ten fifteen AM express to Boston will depart from platform seven. Please proceed to platform seven immediately. Thank you.",
    question: "Which platform will the Boston train depart from?",
    options: ["Platform 3", "Platform 5", "Platform 7", "Platform 9"],
    correctAnswer: 2,
    explanation: "The announcement clearly states the train will depart from platform number seven.",
    speed: 0.85,
  },

  // === DIRECTIONS - Beginner ===
  {
    id: 19,
    category: "directions",
    difficulty: "beginner",
    title: "Finding the Library",
    transcript: "Excuse me, could you tell me how to get to the public library? Sure! Go straight down this road for two blocks. Then turn left at the traffic light onto Oak Street. Walk past the park and you'll see the library on your right, next to the post office. It's a big brick building with a blue sign. You can't miss it! Thank you so much!",
    question: "What building is next to the library?",
    options: ["A school", "A hospital", "The post office", "A supermarket"],
    correctAnswer: 2,
    explanation: "The directions mention the library is next to the post office.",
    speed: 0.85,
  },
  {
    id: 20,
    category: "directions",
    difficulty: "beginner",
    title: "Getting to the Stadium",
    transcript: "Can you help me find the football stadium? Of course! From here, take the bus number twelve heading east. Get off at the third stop, which is Central Avenue. Cross the street and walk south for about five minutes. The stadium entrance will be on your left, just after the bridge. The whole trip should take about twenty minutes.",
    question: "How many bus stops should the person travel?",
    options: ["Two stops", "Three stops", "Four stops", "Five stops"],
    correctAnswer: 1,
    explanation: "The directions say to get off at the third stop.",
    speed: 0.85,
  },
  {
    id: 21,
    category: "directions",
    difficulty: "intermediate",
    title: "Navigating the University Campus",
    transcript: "Welcome to the campus tour. The science building is directly ahead of us. If you look to your left, you'll see the student union with the cafeteria on the ground floor. Behind the student union is the library, which has four floors and study rooms available for booking. The gymnasium is located at the north end of campus, about a ten-minute walk from here. Parking lot B is the closest to the gym, while parking lot A serves the main academic buildings.",
    question: "Where is the library located?",
    options: [
      "Directly ahead of the tour group",
      "To the left of the science building",
      "Behind the student union",
      "At the north end of campus"
    ],
    correctAnswer: 2,
    explanation: "The guide says the library is behind the student union.",
    speed: 0.85,
  },

  // === NEWS REPORTS - Intermediate ===
  {
    id: 22,
    category: "news",
    difficulty: "intermediate",
    title: "Local News - Park Renovation",
    transcript: "Good evening. The city council announced today that Riverside Park will undergo a major renovation starting next month. The project, estimated at two point five million dollars, will include new playground equipment, a refurbished walking trail, and improved lighting throughout the park. The renovation is expected to take approximately eight months, with completion scheduled for March. During this time, the eastern section of the park will be closed to the public. However, the western section, including the dog park and picnic areas, will remain open.",
    question: "How much will the park renovation cost?",
    options: ["$1.5 million", "$2.5 million", "$3.5 million", "$5 million"],
    correctAnswer: 1,
    explanation: "The news report says the project is estimated at two point five million dollars.",
    speed: 0.85,
  },
  {
    id: 23,
    category: "news",
    difficulty: "intermediate",
    title: "Technology News - AI Breakthrough",
    transcript: "In technology news today, researchers at Stanford University have announced a breakthrough in artificial intelligence. Their new AI model can accurately translate between one hundred languages in real-time, a significant improvement over the previous record of forty languages. The system uses a novel neural network architecture that processes speech patterns three times faster than existing models. Lead researcher Doctor Sarah Chen says the technology could be available in consumer applications within two years. Several major tech companies have already expressed interest in licensing the technology.",
    question: "How many languages can the new AI model translate?",
    options: ["40 languages", "50 languages", "75 languages", "100 languages"],
    correctAnswer: 3,
    explanation: "The report states the AI model can translate between one hundred languages in real-time.",
    speed: 0.85,
  },

  // === PHONE CALLS - Beginner ===
  {
    id: 24,
    category: "phone",
    difficulty: "beginner",
    title: "Making a Dinner Reservation",
    transcript: "Hello, Bella Italia restaurant, how can I help you? Hi, I'd like to make a reservation for tonight at seven thirty. For how many people? It will be four of us. Could I get a table by the window? Let me check. Yes, we have a window table available for four at seven thirty. The name, please? It's under Johnson. Perfect, see you tonight at seven thirty, Mr. Johnson.",
    question: "How many people will be dining?",
    options: ["Two", "Three", "Four", "Five"],
    correctAnswer: 2,
    explanation: "The caller says 'It will be four of us.'",
    speed: 0.85,
  },
  {
    id: 25,
    category: "phone",
    difficulty: "beginner",
    title: "Calling the Dentist",
    transcript: "Bright Smile Dental, this is Maria speaking. Hi, I'd like to make an appointment for a check-up. I'm a new patient. Of course! We have openings next week. Would Tuesday morning at ten AM work for you? Actually, I prefer the afternoon. Is there anything on Wednesday? Let me see. Wednesday at two fifteen PM is available. That would be perfect. Great, I'll book you in. Please arrive fifteen minutes early to fill out the new patient forms.",
    question: "What time is the dental appointment?",
    options: ["Tuesday at 10:00 AM", "Wednesday at 2:15 PM", "Wednesday at 3:00 PM", "Thursday at 2:15 PM"],
    correctAnswer: 1,
    explanation: "The receptionist books the appointment for Wednesday at two fifteen PM.",
    speed: 0.85,
  },
  {
    id: 26,
    category: "phone",
    difficulty: "intermediate",
    title: "Customer Service Call",
    transcript: "Thank you for calling Tech Solutions customer support. My name is David. How may I assist you? Hi David, I purchased a laptop from your store last week and the screen keeps flickering. I'm sorry to hear that. Could you provide your order number? It's TK seven eight four three two one. Thank you. I can see your order here. Since the laptop was purchased within the last thirty days, you're eligible for a full replacement. Would you like me to arrange that? Yes, please. I'll send you a prepaid shipping label by email within the next two hours. Once we receive the defective unit, we'll ship the replacement within three to five business days.",
    question: "How soon will the customer receive the replacement after the defective unit is received?",
    options: ["1-2 business days", "3-5 business days", "7-10 business days", "Immediately"],
    correctAnswer: 1,
    explanation: "David says they'll ship the replacement within three to five business days after receiving the defective unit.",
    speed: 0.85,
  },

  // === DAILY LIFE - Beginner ===
  {
    id: 27,
    category: "daily",
    difficulty: "beginner",
    title: "At the Supermarket Checkout",
    transcript: "Cashier: Did you find everything you were looking for? Customer: Yes, thanks. Oh wait, I forgot to get eggs. Are they in aisle three? Cashier: No, eggs are in the dairy section at the back, aisle six. Customer: I'll go grab them quickly. Cashier: Take your time. I'll wait. Customer: Okay, I'm back. Cashier: That's three items at two dollars each, so six dollars for the eggs. Your total comes to forty-seven dollars and eighty cents.",
    question: "Where are the eggs located in the store?",
    options: ["Aisle 3", "Aisle 4", "Aisle 6", "Aisle 8"],
    correctAnswer: 2,
    explanation: "The cashier says eggs are in the dairy section at the back, aisle six.",
    speed: 0.85,
  },
  {
    id: 28,
    category: "daily",
    difficulty: "beginner",
    title: "Bus Schedule Inquiry",
    transcript: "Excuse me, do you know when the next bus to downtown leaves? Let me check. The buses run every twenty minutes on weekdays. The last one left at eight forty, so the next one should be at nine. You can catch it at that stop right there. Does it go past City Hall? Yes, City Hall is the fifth stop. Just stay on for about twelve minutes. Thank you!",
    question: "What is the fifth stop on the bus route?",
    options: ["The university", "The hospital", "City Hall", "The shopping center"],
    correctAnswer: 2,
    explanation: "The person confirms that City Hall is the fifth stop.",
    speed: 0.85,
  },
  {
    id: 29,
    category: "daily",
    difficulty: "intermediate",
    title: "Gym Membership Sign-Up",
    transcript: "I'd like to sign up for a gym membership. We have three options. The basic plan is thirty dollars per month and includes access to the gym floor and locker rooms. The standard plan is fifty dollars per month and adds group classes and the swimming pool. The premium plan is seventy-five dollars per month and includes everything plus personal training sessions, two per month, and access to the sauna and steam room. All plans require a one-time registration fee of twenty dollars. I think the standard plan works best for me. Great choice! Would you like to start today?",
    question: "What is included in the premium plan but NOT in the standard plan?",
    options: [
      "Group classes and swimming pool",
      "Gym floor and locker rooms",
      "Personal training sessions, sauna, and steam room",
      "Only the swimming pool"
    ],
    correctAnswer: 2,
    explanation: "The premium plan adds personal training sessions and access to the sauna and steam room beyond what the standard plan offers.",
    speed: 0.85,
  },

  // === INTERVIEWS - Advanced ===
  {
    id: 30,
    category: "interviews",
    difficulty: "advanced",
    title: "Scientific Research Interview",
    transcript: "Host: Doctor Miller, your recent study on ocean acidification has attracted significant attention. Could you summarize your findings? Miller: Certainly. Our five-year study revealed that ocean pH levels have decreased by zero point one units since the beginning of industrialization. While that may sound small, it represents a twenty-six percent increase in acidity. This change threatens coral reefs, shellfish populations, and the entire marine food chain. We project that at current emission rates, coral reef ecosystems could collapse by twenty-fifty. Host: What solutions do you propose? Miller: Reducing carbon emissions is critical. Additionally, we're researching marine vegetation that could help buffer acidity in localized areas, though this won't solve the root cause.",
    question: "What percentage increase in ocean acidity has occurred since industrialization?",
    options: ["10%", "26%", "35%", "50%"],
    correctAnswer: 1,
    explanation: "Doctor Miller states that the zero point one decrease in pH represents a twenty-six percent increase in acidity.",
    speed: 0.7,
  },

  // === CONVERSATIONS - Advanced ===
  {
    id: 31,
    category: "conversations",
    difficulty: "advanced",
    title: "Academic Debate",
    transcript: "Professor A: I believe standardized testing provides an objective measure of student achievement across different schools. Professor B: I disagree. These tests primarily measure test-taking ability, not genuine understanding. Students from underprivileged backgrounds consistently score lower, not because they lack ability, but because they lack resources for test preparation. Professor A: While that's a valid concern, without standardized metrics, how can we ensure educational quality across districts? Professor B: Portfolio-based assessment and continuous evaluation provide a more comprehensive picture. Finland eliminated standardized testing and consistently ranks among the top educational systems globally.",
    question: "What alternative does Professor B propose to standardized testing?",
    options: [
      "More frequent standardized tests",
      "Portfolio-based assessment and continuous evaluation",
      "Privatizing the education system",
      "Increasing test preparation resources"
    ],
    correctAnswer: 1,
    explanation: "Professor B suggests portfolio-based assessment and continuous evaluation as alternatives.",
    speed: 0.7,
  },

  // === ANNOUNCEMENTS - Intermediate ===
  {
    id: 32,
    category: "announcements",
    difficulty: "intermediate",
    title: "Event Cancellation Notice",
    transcript: "This is an important message for all participants of the annual charity marathon scheduled for this Sunday. Due to the severe weather warning issued by the National Weather Service, the event has been postponed to the following Sunday, November twelfth. All registered participants will automatically be enrolled for the new date. If you are unable to attend on November twelfth, you may request a full refund by emailing marathon at charity dot org before November first. We apologize for any inconvenience and appreciate your understanding. Safety is our top priority.",
    question: "By what date must participants request a refund?",
    options: ["October 29th", "November 1st", "November 5th", "November 12th"],
    correctAnswer: 1,
    explanation: "The announcement says refunds can be requested before November first.",
    speed: 0.85,
  },

  // === NEWS - Advanced ===
  {
    id: 33,
    category: "news",
    difficulty: "advanced",
    title: "Economic Policy Report",
    transcript: "The Federal Reserve announced today a quarter-point increase in the benchmark interest rate, bringing it to five point two five percent, the highest level in twenty-two years. The decision comes amid persistent inflation concerns, with the Consumer Price Index showing a three point seven percent increase year over year. Fed Chair Janet Powell emphasized that while the labor market remains strong with unemployment at three point eight percent, further rate hikes may be necessary if inflation does not show sustained improvement toward the two percent target. Analysts predict this could impact mortgage rates, potentially pushing the average thirty-year fixed rate above eight percent for the first time since two thousand.",
    question: "What is the new benchmark interest rate after the increase?",
    options: ["4.75%", "5.00%", "5.25%", "5.50%"],
    correctAnswer: 2,
    explanation: "The report states the benchmark interest rate was brought to five point two five percent.",
    speed: 0.7,
  },

  // === PHONE - Advanced ===
  {
    id: 34,
    category: "phone",
    difficulty: "advanced",
    title: "Insurance Claim Discussion",
    transcript: "Agent: Thank you for calling SafeHome Insurance. I'm reviewing your claim for water damage from the storm on March third. Homeowner: Yes, the contractor estimated repairs at twelve thousand five hundred dollars. Agent: I see. Under your policy, the deductible for storm damage is one thousand dollars. After that, we cover eighty percent of the remaining cost up to your policy limit of fifty thousand. Homeowner: So I'd be responsible for one thousand plus twenty percent of the remaining eleven thousand five hundred? Agent: That's correct. Your out-of-pocket would be three thousand three hundred dollars, and we would cover nine thousand two hundred dollars. I'll need the contractor's detailed estimate and photos of the damage to process this.",
    question: "How much will the insurance company cover?",
    options: ["$8,500", "$9,200", "$10,000", "$11,500"],
    correctAnswer: 1,
    explanation: "After the $1000 deductible, 80% of the remaining $11,500 equals $9,200 that the insurance covers.",
    speed: 0.7,
  },

  // === DAILY LIFE - Advanced ===
  {
    id: 35,
    category: "daily",
    difficulty: "advanced",
    title: "Car Repair Estimate",
    transcript: "Mechanic: We've completed the diagnostic on your vehicle. The issue is with the transmission. There are two options. A rebuilt transmission would cost approximately two thousand eight hundred dollars with a one-year warranty. A new transmission would run about four thousand five hundred dollars but comes with a three-year warranty. The labor for either option is an additional eight hundred dollars, and we'd need the car for about three to four business days. Customer: Is there any way to repair just the damaged component? Mechanic: In this case, the damage is too extensive for a partial repair. I'd recommend the new transmission given the longer warranty and reliability. Customer: Let me think about it. Can I have until tomorrow to decide?",
    question: "What is the total cost for a new transmission including labor?",
    options: ["$2,800", "$3,600", "$4,500", "$5,300"],
    correctAnswer: 3,
    explanation: "The new transmission costs $4,500 plus $800 labor, totaling $5,300.",
    speed: 0.7,
  },

  // === LECTURES - Beginner ===
  {
    id: 36,
    category: "lectures",
    difficulty: "beginner",
    title: "Basic Nutrition Tips",
    transcript: "Good morning, everyone. Today we'll talk about simple ways to improve your diet. First, try to eat at least five servings of fruits and vegetables each day. A serving is roughly the size of your fist. Second, drink plenty of water. Most adults need about eight glasses per day. Third, reduce your intake of processed foods, especially those high in sugar and salt. And finally, try to eat regular meals at consistent times, as this helps maintain stable energy levels throughout the day.",
    question: "How many servings of fruits and vegetables should you eat daily?",
    options: ["Three", "Four", "Five", "Six"],
    correctAnswer: 2,
    explanation: "The lecturer recommends eating at least five servings of fruits and vegetables each day.",
    speed: 0.85,
  },
  {
    id: 37,
    category: "lectures",
    difficulty: "beginner",
    title: "How to Study Effectively",
    transcript: "Welcome to our study skills workshop. The most effective study technique is called spaced repetition. Instead of studying for five hours the night before an exam, break it into shorter sessions over several days. For example, study for forty-five minutes, then take a ten-minute break. Research shows that you remember information better when you review it multiple times over a longer period. Also, try to study in a quiet place without your phone, as distractions can reduce your learning by up to forty percent.",
    question: "How much can distractions reduce learning?",
    options: ["Up to 20%", "Up to 30%", "Up to 40%", "Up to 50%"],
    correctAnswer: 2,
    explanation: "The lecturer says distractions can reduce your learning by up to forty percent.",
    speed: 0.85,
  },

  // === DIRECTIONS - Intermediate ===
  {
    id: 38,
    category: "directions",
    difficulty: "intermediate",
    title: "Subway Navigation",
    transcript: "You need to get to the museum from Central Station. Take the blue line heading north toward Oakwood. Travel four stops and get off at Riverside station. Transfer to the green line going east. Take the green line for two stops and exit at Museum Plaza. Take exit number two from the station, and the museum is directly across the street. The whole journey takes approximately twenty-five minutes. Remember, you'll need a transfer ticket, which costs three dollars and fifty cents. The museum is open from nine AM to six PM, and general admission is twelve dollars.",
    question: "How many stops do you travel on the green line?",
    options: ["One stop", "Two stops", "Three stops", "Four stops"],
    correctAnswer: 1,
    explanation: "The directions say to take the green line for two stops.",
    speed: 0.85,
  },

  // === DAILY LIFE - Intermediate ===
  {
    id: 39,
    category: "daily",
    difficulty: "intermediate",
    title: "Car Rental at the Airport",
    transcript: "I'd like to rent a car for the weekend, please. We have several options available. The economy car is thirty-five dollars per day with unlimited mileage. The midsize sedan is forty-eight dollars per day, also with unlimited mileage. Both require a credit card on file and a valid driver's license. You must return the car with a full tank of gas, or there's a refueling charge of five dollars and fifty cents per gallon. Insurance is optional and costs fifteen dollars per day for full coverage. I'll take the economy car with insurance for two days. That comes to one hundred dollars total.",
    question: "What is the total cost for the economy car with insurance for two days?",
    options: ["$70", "$$85", "$100", "$126"],
    correctAnswer: 2,
    explanation: "Economy car $35/day + insurance $15/day = $50/day x 2 days = $100.",
    speed: 0.85,
  },

  // === NEWS - Beginner ===
  {
    id: 40,
    category: "news",
    difficulty: "beginner",
    title: "Weather Report",
    transcript: "Good morning. Here's your weather forecast for the week. Monday will be sunny with a high of seventy-two degrees. Tuesday will be partly cloudy with temperatures around sixty-eight degrees. Wednesday brings a chance of rain, so don't forget your umbrella. By Thursday, the rain will clear up and we'll see temperatures climb back to seventy degrees. The weekend looks great with sunny skies and highs near seventy-five degrees. It's a perfect weekend for outdoor activities!",
    question: "What day is rain expected?",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    correctAnswer: 2,
    explanation: "The forecast says Wednesday brings a chance of rain.",
    speed: 0.85,
  },
];

export default function ListeningPage() {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading, hasAccess } = useSubscription();
  const router = useRouter();

  const [filteredExercises, setFilteredExercises] = useState<ListeningExercise[]>(listeningExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Filter exercises when category/difficulty changes
  useEffect(() => {
    let filtered = listeningExercises;
    if (selectedCategory) {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }
    if (difficulty !== "all") {
      filtered = filtered.filter((e) => e.difficulty === difficulty);
    }
    setFilteredExercises(filtered);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setAnsweredCount(0);
    setPlayCount(0);
    setShowTranscript(false);
  }, [selectedCategory, difficulty]);

  // Auth & access check - separate from filtering
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !subLoading) {
      if (!hasAccess("listening")) {
        setShowPaywall(true);
      }
    }
  }, [authLoading, user, subLoading, router, hasAccess]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const currentExercise = filteredExercises[currentIndex];
  if (!currentExercise) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Headphones className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Exercises Found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
              <Button onClick={() => { setSelectedCategory(null); setDifficulty("all"); }}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const playAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentExercise.transcript);
    utterance.rate = currentExercise.speed;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    // Try to get a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.includes("Female")
    ) || voices.find((v) => v.lang.startsWith("en-US"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
      setPlayCount((prev) => prev + 1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    setAnsweredCount((prev) => prev + 1);
    if (selectedAnswer === currentExercise.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      stopAudio();
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setPlayCount(0);
      setShowTranscript(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      stopAudio();
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setPlayCount(0);
      setShowTranscript(false);
    }
  };

  const isCorrect = selectedAnswer === currentExercise.correctAnswer;
  const progress = ((currentIndex + (showResult ? 1 : 0)) / filteredExercises.length) * 100;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "beginner": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "advanced": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Headphones className="h-6 w-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Listening Practice</h1>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Question {currentIndex + 1} of {filteredExercises.length}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <label className="text-sm font-semibold mb-2 block">Category</label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex items-end">
                <Badge variant="outline" className="w-full text-center py-2 justify-center">
                  Score: {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
                </Badge>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="w-full text-center py-2 justify-center">
                  {filteredExercises.length} exercises
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentExercise.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {categories.find((c) => c.id === currentExercise.category)?.name}
                      </CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                      {currentExercise.difficulty.charAt(0).toUpperCase() + currentExercise.difficulty.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Audio Player */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={isPlaying ? stopAudio : playAudio}
                          className="rounded-full h-14 w-14 transition-all duration-200"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6 ml-0.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={playAudio}
                          className="text-muted-foreground"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Replay
                        </Button>
                        {isSpeaking && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 bg-primary rounded-full animate-pulse"
                                style={{
                                  height: `${Math.random() * 20 + 10}px`,
                                  animationDelay: `${i * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4" />
                        <span>
                          {playCount === 0
                            ? "Click play to listen"
                            : `Played ${playCount} time${playCount > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transcript Toggle */}
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="mb-2"
                    >
                      {showTranscript ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                      {showTranscript ? "Hide Transcript" : "Show Transcript"}
                    </Button>
                    {showTranscript && (
                      <p className="text-sm p-4 bg-muted/50 border border-border rounded-lg leading-relaxed">
                        {currentExercise.transcript}
                      </p>
                    )}
                  </div>

                  {/* Question */}
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">{currentExercise.question}</h3>
                    <div className="space-y-3">
                      {currentExercise.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const showCorrectHighlight = showResult && idx === currentExercise.correctAnswer;
                        const showWrongHighlight = showResult && isSelected && idx !== currentExercise.correctAnswer;

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (!showResult) setSelectedAnswer(idx);
                            }}
                            disabled={showResult}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-all duration-200 ${
                              showCorrectHighlight
                                ? "border-green-500 bg-green-500/10"
                                : showWrongHighlight
                                ? "border-red-500 bg-red-500/10"
                                : isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-primary/5 hover:border-primary/30"
                            } ${showResult ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <span
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                                showCorrectHighlight
                                  ? "border-green-500 bg-green-500 text-white"
                                  : showWrongHighlight
                                  ? "border-red-500 bg-red-500 text-white"
                                  : isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border"
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {showCorrectHighlight && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                            {showWrongHighlight && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Result */}
                  {showResult && (
                    <Alert className={isCorrect ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}>
                      <div className="flex items-start space-x-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        )}
                        <div>
                          <h4 className={isCorrect ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                            {isCorrect ? "Correct!" : "Incorrect"}
                          </h4>
                          <AlertDescription className="mt-1 text-sm">
                            <Lightbulb className="h-4 w-4 inline mr-1" />
                            {currentExercise.explanation}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {!showResult ? (
                      <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="flex-1">
                        Check Answer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={currentIndex === filteredExercises.length - 1}
                        className="flex-1 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                      >
                        {currentIndex === filteredExercises.length - 1 ? "Finish" : "Next"}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Correct</span>
                      <span className="font-semibold text-green-600">{correctCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="font-semibold">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-semibold">
                        {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">By Category</h4>
                    {categories.map((cat) => {
                      const count = listeningExercises.filter((e) => e.category === cat.id).length;
                      if (count === 0) return null;
                      return (
                        <div key={cat.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{cat.name}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">By Difficulty</h4>
                    {["beginner", "intermediate", "advanced"].map((d) => {
                      const count = listeningExercises.filter((e) => e.difficulty === d).length;
                      return (
                        <div key={d} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listening Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Listen to the audio first before reading the transcript.</p>
                  <p>Replay the audio multiple times to catch details you missed.</p>
                  <p>Focus on key words and numbers in the passage.</p>
                  <p>Try the exercise without the transcript first, then check it to verify your understanding.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PaywallAlert
        isOpen={showPaywall}
        feature="Listening"
        plan="pro"
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
