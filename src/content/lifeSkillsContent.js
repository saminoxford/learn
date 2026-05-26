// Life Skills question bank — curated, age-tuned per grade.
//
// Organized as: GRADES[grade][category] = [question, …]
// Categories: household | mechanical | financial | personal
//
// Each question is shaped like the rest of the app:
//   { type: 'choice' | 'order', category, question, ... }
//
// `choice` shape: { options: [...4], answer: '...', emoji }
// `order`  shape: { steps: [...3-5 in correct order], emoji }

// ---- Helpers ----
const c = (category, question, answer, distractors, emoji) => ({
  type: 'choice',
  category,
  question,
  options: shuffleAtBuild([answer, ...distractors]),
  answer,
  emoji
})

const o = (category, question, steps, emoji) => ({
  type: 'order',
  category,
  question,
  steps,
  emoji
})

// Build-time pseudo-shuffle so options aren't always in the same order in
// devtools, but stable enough for the bundler. Actual quiz-time shuffle
// happens in the generator.
function shuffleAtBuild(arr) {
  return arr
}

// ---- 1st Grade ----

const G1_HOUSEHOLD = [
  c('household', 'Before eating, you should always…', 'Wash your hands', ['Watch TV', 'Yell really loud', 'Hide the soap'], '🧼'),
  c('household', 'When you finish your snack, what do you do with the wrapper?', 'Put it in the trash', ['Leave it on the floor', 'Hide it under the couch', 'Throw it outside'], '🗑️'),
  c('household', 'When you make a mess, you should…', 'Clean it up', ['Walk away', 'Blame your brother', 'Hide it'], '🧹'),
  c('household', 'Where do dirty clothes go?', 'In the laundry basket', ['Under the bed', 'On the floor', 'In the kitchen'], '🧺'),
  c('household', 'When you wake up, you should make your…', 'Bed', ['Breakfast for the dog', 'Brother angry', 'Bath'], '🛏️'),
  c('household', 'When the table needs to be set, you put forks on the…', 'Left of the plate', ['Floor', 'Roof', 'Inside the cup'], '🍽️'),
  c('household', 'When you spill water on the floor, you should…', 'Wipe it up with a towel', ['Step in it', 'Let the dog drink it', 'Tell no one'], '💧'),
  c('household', 'When you take a book off the shelf, when you are done you…', 'Put it back', ['Leave it on the floor', 'Hide it', 'Eat a snack'], '📚'),
  o('household', 'Put these steps in order to wash your hands:', [
    'Turn on the water',
    'Put soap on your hands',
    'Scrub for 20 seconds',
    'Rinse and dry'
  ], '🧼'),
  c('household', 'What helps soup stay warm on the table?', 'A lid', ['A pillow', 'A sock', 'A book'], '🍲')
]

const G1_MECHANICAL = [
  c('mechanical', 'Which tool do you use to hammer a nail?', 'A hammer', ['A spoon', 'A book', 'A sock'], '🔨'),
  c('mechanical', 'Which tool do you use to tighten a screw?', 'A screwdriver', ['A fork', 'A toothbrush', 'A pencil'], '🪛'),
  c('mechanical', 'A flashlight needs… to work.', 'Batteries', ['Water', 'Bread', 'Sand'], '🔦'),
  c('mechanical', 'When a light bulb stops working, you should…', 'Tell a grown-up', ['Touch it with wet hands', 'Throw it', 'Yell at it'], '💡'),
  c('mechanical', 'You should NEVER touch…', 'A hot stove', ['Your own toys', 'A clean table', 'Your stuffed animal'], '🔥'),
  c('mechanical', 'When you are done using a tool, you…', 'Put it back where it belongs', ['Throw it across the room', 'Hide it from your brother', 'Bury it in the yard'], '🧰'),
  c('mechanical', 'Tools that cut should only be used…', 'With a grown-up', ['By yourself in the dark', 'At the dinner table', 'In the bathtub'], '🪚'),
  c('mechanical', 'What should you wear to protect your eyes when building?', 'Safety glasses', ['Sunglasses', 'A blindfold', 'A hat backwards'], '🥽'),
  c('mechanical', 'If a toy breaks, you should…', 'Tell a grown-up so they can help fix it', ['Throw away all your other toys', 'Cry forever', 'Hide it'], '🧸'),
  c('mechanical', 'If you smell smoke at home, you should…', 'Tell a grown-up right away', ['Hide', 'Go to sleep', 'Pretend you don\'t smell it'], '🚨')
]

const G1_FINANCIAL = [
  c('financial', 'How much is one penny worth?', '1 cent', ['5 cents', '10 cents', '25 cents'], '🪙'),
  c('financial', 'How much is one nickel worth?', '5 cents', ['1 cent', '10 cents', '25 cents'], '🪙'),
  c('financial', 'How much is one dime worth?', '10 cents', ['1 cent', '5 cents', '25 cents'], '🪙'),
  c('financial', 'How much is one quarter worth?', '25 cents', ['1 cent', '5 cents', '10 cents'], '🪙'),
  c('financial', 'Which coin is worth the MOST?', 'Quarter', ['Penny', 'Nickel', 'Dime'], '💰'),
  c('financial', 'Which coin is worth the LEAST?', 'Penny', ['Nickel', 'Dime', 'Quarter'], '🪙'),
  c('financial', 'If you have a nickel and a penny, you have…', '6 cents', ['2 cents', '7 cents', '10 cents'], '💵'),
  c('financial', 'If you have two dimes, you have…', '20 cents', ['2 cents', '11 cents', '25 cents'], '💵'),
  c('financial', 'It\'s smart to save some of your money in a…', 'Piggy bank', ['Toilet', 'Sandbox', 'Lunchbox'], '🐷'),
  c('financial', 'When you want a toy at the store, you need…', 'Money', ['A pillow', 'A song', 'A bedtime story'], '🛒')
]

const G1_PERSONAL = [
  c('personal', 'When you bump into someone, you say…', '"Excuse me"', ['Nothing', '"Move!"', '"Ha-ha!"'], '🙇'),
  c('personal', 'When someone gives you a gift, you say…', '"Thank you"', ['Nothing', '"I wanted a better one"', '"You shouldn\'t have"'], '🎁'),
  c('personal', 'When a friend falls down, you should…', 'Help them up and ask if they\'re okay', ['Laugh at them', 'Run away', 'Push them again'], '🤝'),
  c('personal', 'When you want something, you say…', '"Please"', ['"Now!"', 'Nothing', '"You owe me"'], '🙏'),
  c('personal', 'When you feel angry, the best thing to do is…', 'Take a deep breath', ['Hit something', 'Yell as loud as you can', 'Throw your toys'], '🌬️'),
  c('personal', 'When you make a mistake, the best thing to do is…', 'Try again', ['Quit forever', 'Blame your brother', 'Hide it'], '🌱'),
  c('personal', 'If you\'re playing and your friend wants a turn, you should…', 'Share or take turns', ['Hide the toy', 'Run away with it', 'Pretend you didn\'t hear'], '🤝'),
  c('personal', 'Telling the truth is…', 'Always the best, even when it\'s hard', ['Only good when you feel like it', 'Bad', 'For other people, not you'], '✨'),
  c('personal', 'When you feel scared, you can…', 'Ask a grown-up for help', ['Pretend you\'re not', 'Yell at someone', 'Hide forever'], '🤗'),
  c('personal', 'When someone is talking to you, you should…', 'Look at them and listen', ['Look at your phone', 'Walk away', 'Interrupt right away'], '👂')
]

// ---- 2nd Grade ----

const G2_HOUSEHOLD = [
  c('household', 'When you sort laundry, you should separate…', 'Whites from colors', ['Big from small', 'Heavy from light', 'New from old'], '🧺'),
  c('household', 'When you make your bed, you start by…', 'Pulling up the sheet', ['Jumping on it', 'Hiding pillows', 'Lying down again'], '🛏️'),
  c('household', 'Before you go to bed, you should brush your…', 'Teeth', ['Hair on the floor', 'Pillow', 'Pets only'], '🪥'),
  c('household', 'When you set the table, the napkin goes…', 'Next to the fork', ['On the floor', 'In your shirt', 'Under the chair'], '🍽️'),
  c('household', 'When you finish a meal, you should…', 'Carry your plate to the sink', ['Run outside', 'Hide it under the table', 'Put it back in the fridge dirty'], '🍽️'),
  c('household', 'Hot food should be eaten with a…', 'Fork or spoon', ['Hand', 'Foot', 'Hair'], '🍴'),
  c('household', 'When you finish playing, you should…', 'Put your toys away', ['Leave them everywhere', 'Throw them out the window', 'Lock them in the bathroom'], '🧸'),
  c('household', 'When the trash can is full, you should…', 'Take it out (or ask a grown-up to)', ['Push the trash down harder forever', 'Cover it with a blanket', 'Pretend not to notice'], '🗑️'),
  o('household', 'Put these steps in order to make your bed:', [
    'Straighten the sheet',
    'Pull up the blanket',
    'Put pillows at the top',
    'Smooth out wrinkles'
  ], '🛏️'),
  c('household', 'If a fork falls on the floor, you should…', 'Pick it up and wash it', ['Eat off it anyway', 'Kick it under the fridge', 'Throw it in the trash'], '🍴')
]

const G2_MECHANICAL = [
  c('mechanical', 'Which tool helps you measure how long something is?', 'A ruler', ['A spoon', 'A pillow', 'A cup'], '📏'),
  c('mechanical', 'A wrench is used to…', 'Tighten or loosen nuts and bolts', ['Cut paper', 'Stir soup', 'Sweep the floor'], '🔧'),
  c('mechanical', 'A pair of pliers is used to…', 'Grip and bend things', ['Wash dishes', 'Brush hair', 'Eat soup'], '🛠️'),
  c('mechanical', 'When you carry scissors, you should hold them…', 'By the closed blades, point down', ['Above your head', 'Open and pointing forward', 'In your mouth'], '✂️'),
  c('mechanical', 'When you finish using a tool, you should…', 'Put it back in the toolbox', ['Throw it in the yard', 'Hide it from grown-ups', 'Leave it on the stairs'], '🧰'),
  c('mechanical', 'If a smoke alarm is beeping, it probably needs…', 'A new battery', ['A song', 'Water', 'A snack'], '🔔'),
  c('mechanical', 'When you walk past a hot stove, you should…', 'Stay back so you don\'t touch it', ['Lean on it', 'Reach over it', 'Climb on it'], '🔥'),
  c('mechanical', 'If a glass breaks, what should you do FIRST?', 'Stay back and tell a grown-up', ['Pick up the pieces fast', 'Walk on it barefoot', 'Hide the broken glass'], '🥛'),
  c('mechanical', 'When you ride your bike, you should always wear a…', 'Helmet', ['Hat', 'Costume', 'Pillow'], '🚴'),
  c('mechanical', 'If a battery is leaking, you should…', 'Not touch it and tell a grown-up', ['Put it in your mouth', 'Lick it', 'Squeeze it'], '🔋')
]

const G2_FINANCIAL = [
  c('financial', 'A dollar bill is worth…', '100 cents', ['10 cents', '50 cents', '1 cent'], '💵'),
  c('financial', 'If something costs 50¢ and you have a dollar, you should get…', '50¢ back', ['$1 back', '$2 back', 'Nothing back'], '💰'),
  c('financial', 'Four quarters make…', '$1', ['25¢', '50¢', '$10'], '💵'),
  c('financial', 'If you have $1 and a candy costs $2, you…', 'Need more money', ['Can buy it anyway', 'Get extra change', 'Have plenty'], '🍬'),
  c('financial', 'If you get $5 for chores, you should…', 'Save some and spend some', ['Spend it all at once', 'Lose it', 'Give it all away'], '🐷'),
  c('financial', 'A "need" is something you…', 'Have to have, like food or shelter', ['Just want', 'Saw on TV', 'Want for a birthday'], '🏠'),
  c('financial', 'A "want" is something that is…', 'Nice to have but not necessary', ['Always needed', 'Free', 'Bad to want'], '🎁'),
  c('financial', 'If you have 2 quarters and 1 dime, you have…', '60¢', ['35¢', '50¢', '75¢'], '🪙'),
  c('financial', 'Saving money means…', 'Keeping some instead of spending it', ['Spending faster', 'Losing it', 'Giving it to a stranger'], '🏦'),
  c('financial', 'A piggy bank helps you…', 'Save coins over time', ['Hide things from grown-ups', 'Keep snacks', 'Win contests'], '🐷')
]

const G2_PERSONAL = [
  c('personal', 'When you accidentally hurt your friend\'s feelings, you should…', 'Apologize sincerely', ['Pretend it didn\'t happen', 'Laugh louder', 'Walk away'], '🤝'),
  c('personal', 'If you don\'t understand something at school, you should…', 'Ask a question', ['Pretend you understand', 'Cry quietly', 'Look angry'], '🙋'),
  c('personal', 'When you\'re frustrated, a healthy thing to do is…', 'Take a few deep breaths', ['Hit someone', 'Break a toy', 'Yell at your dog'], '🌬️'),
  c('personal', 'If your brother gets a bigger piece of cake, you should…', 'Tell a grown-up calmly', ['Steal his cake', 'Cry until you get more', 'Refuse to eat dinner ever again'], '🍰'),
  c('personal', 'When you lose a game, the kind thing to say is…', '"Good game!"', ['"You cheated!"', '"That\'s not fair!"', 'Storm off'], '🎲'),
  c('personal', 'If a friend at school is sitting alone at lunch, you could…', 'Invite them to sit with you', ['Point and laugh', 'Tell others to ignore them', 'Walk past'], '🥪'),
  c('personal', 'If you make a mistake on your homework, you should…', 'Erase it and try again', ['Crumple the paper and throw it', 'Cry', 'Cheat next time'], '✏️'),
  c('personal', 'When a grown-up asks for help, you should…', 'Help when you can', ['Pretend you didn\'t hear', 'Say "no" and walk away', 'Hide'], '🤝'),
  c('personal', 'If you feel really sad, the bravest thing is to…', 'Tell someone you trust', ['Hide it forever', 'Pretend you\'re fine', 'Take it out on your brother'], '🫂'),
  c('personal', 'When someone is talking, a kind listener…', 'Looks at them and waits to speak', ['Interrupts every sentence', 'Looks at the ceiling', 'Walks away'], '👂')
]

// ---- 3rd Grade ----

const G3_HOUSEHOLD = [
  c('household', 'When you follow a recipe, you should measure ingredients with a…', 'Measuring cup or spoon', ['Your hand', 'A coffee mug', 'A regular spoon and hope'], '🥣'),
  c('household', 'Before you start cooking, you should always…', 'Wash your hands', ['Turn off the stove', 'Open the windows', 'Eat a snack'], '🧼'),
  c('household', 'If you spill milk on the counter, you should…', 'Wipe it up right away', ['Wait for it to dry', 'Throw a towel on it and leave', 'Tell the dog'], '🥛'),
  c('household', '"Sort by color" for laundry means…', 'Put whites, lights, and darks in different piles', ['Sort by smell', 'Sort by size', 'Mix them all together'], '🧺'),
  c('household', 'The hottest water in the washer is best for…', 'White towels', ['Bright red socks', 'Delicate sweaters', 'Plastic toys'], '♨️'),
  c('household', 'If a recipe says "1 tsp", that means…', '1 teaspoon', ['1 table', '1 tablespoon', '1 cup'], '🥄'),
  o('household', 'Put these steps in order to set the table for dinner:', [
    'Put down a placemat',
    'Place the plate in the center',
    'Set the fork on the left',
    'Set the knife and spoon on the right'
  ], '🍽️'),
  c('household', 'Raw chicken should be cooked until it\'s…', 'No longer pink inside', ['A little pink is fine', 'Still cold inside', 'Bright pink'], '🍗'),
  c('household', 'When you\'re done with dishes, you should…', 'Wash, rinse, and put them away', ['Stack them in a cabinet dirty', 'Leave them in the sink for someone else', 'Throw them out'], '🧽'),
  c('household', 'If you finish the toilet paper roll, you should…', 'Put a new roll on', ['Pretend it wasn\'t you', 'Walk away laughing', 'Leave the empty roll'], '🧻')
]

const G3_MECHANICAL = [
  c('mechanical', 'A "Phillips" screwdriver has a tip shaped like a…', '"+"', ['Flat line', 'Star', 'Circle'], '➕'),
  c('mechanical', 'To change a battery, you should match the "+" side to…', 'The "+" mark in the device', ['Whichever side fits', 'Either side', 'The bottom'], '🔋'),
  c('mechanical', 'If a toilet is clogged, the right tool is…', 'A plunger', ['A hammer', 'A spoon', 'A vacuum'], '🚽'),
  o('mechanical', 'Put these steps in order to plunge a clogged toilet:', [
    'Make sure water isn\'t about to overflow',
    'Place the plunger over the drain',
    'Push down and pull up firmly several times',
    'Flush to check it\'s clear'
  ], '🚽'),
  c('mechanical', 'A drill is used to…', 'Make holes', ['Cut paper', 'Stir soup', 'Sweep floors'], '🪛'),
  c('mechanical', 'Before plugging in any cord, you should check that…', 'It\'s not damaged or frayed', ['It matches your shirt', 'It\'s warm', 'It\'s the longest one'], '🔌'),
  c('mechanical', 'If you smell gas in the house, you should…', 'Tell a grown-up and go outside', ['Light a candle to check', 'Open the fridge', 'Take a nap'], '🚨'),
  o('mechanical', 'Put these steps in order to hammer a nail safely:', [
    'Hold the nail steady near the bottom',
    'Tap it gently to start',
    'Move your hand away',
    'Swing the hammer harder to drive it in'
  ], '🔨'),
  c('mechanical', 'A "Stanley knife" or box cutter should be used…', 'Only with a grown-up and pointed away from you', ['By yourself in your room', 'To open packages quickly without thinking', 'For cutting hair'], '🔪'),
  c('mechanical', 'If a light switch sparks when you flip it, you should…', 'Stop using it and tell a grown-up', ['Flip it faster', 'Touch the wires', 'Pour water on it'], '⚡')
]

const G3_FINANCIAL = [
  c('financial', 'If a toy costs $7 and you have $10, you get back…', '$3', ['$2', '$7', '$13'], '💵'),
  c('financial', 'If you save $1 every week, in 10 weeks you\'ll have…', '$10', ['$1', '$5', '$100'], '🐷'),
  c('financial', 'If something costs $4.50, two of them cost…', '$9.00', ['$4.50', '$8.00', '$9.50'], '🧮'),
  c('financial', '"Saving" and "spending" are…', 'Two different choices with money', ['The same thing', 'Both bad', 'Only for grown-ups'], '💰'),
  c('financial', 'If you have $20 and spend half, you have…', '$10', ['$2', '$5', '$15'], '💵'),
  c('financial', 'Three $5 bills make…', '$15', ['$8', '$10', '$50'], '💵'),
  c('financial', '"Allowance" is money you get for…', 'Doing chores or helping at home', ['Crying', 'Doing nothing', 'Breaking things'], '🧺'),
  c('financial', 'If you really want a toy that costs $30 but only have $10, you should…', 'Save until you have enough', ['Steal it', 'Ask the store to wait forever', 'Cry until grown-ups give in'], '🛍️'),
  c('financial', 'It\'s a good idea to write down what you spend so you can…', 'See where your money goes', ['Show off your wallet', 'Make a paper airplane', 'Hide it from grown-ups'], '📒'),
  c('financial', 'If a friend lends you a dollar, the right thing to do is…', 'Pay them back', ['Forget about it', 'Lend them a sock instead', 'Spend even more of theirs'], '🤝')
]

const G3_PERSONAL = [
  c('personal', 'You missed a basket in basketball. A growth-mindset response is…', '"I\'ll keep practicing."', ['"I\'m terrible at this."', '"This game is dumb."', '"I quit."'], '🏀'),
  c('personal', 'If a friend is bragging about something you can\'t do yet, you can…', 'Be happy for them and keep trying yourself', ['Pretend you can do it too', 'Tell them they\'re bad', 'Stop being their friend'], '🌱'),
  c('personal', 'When a teacher gives you feedback, you should…', 'Listen and try to improve', ['Argue', 'Cry', 'Ignore it'], '📝'),
  c('personal', 'If your brother breaks your toy, the best first reaction is…', 'Take a breath and tell a grown-up calmly', ['Punch him', 'Break two of his toys', 'Run away from home'], '🧸'),
  c('personal', 'Telling someone you\'re sorry works best when you…', 'Mean it and try not to do it again', ['Mumble it fast', 'Roll your eyes', 'Blame them too'], '🤝'),
  c('personal', 'When you don\'t know the answer in class, the brave thing is…', 'Ask for help', ['Pretend you do', 'Look around to copy', 'Stop trying'], '🙋'),
  c('personal', 'If your team loses a game, a good thing to say is…', '"Good game, let\'s play again."', ['"You all stink."', '"It\'s the ref\'s fault."', '"I\'m never playing again."'], '⚽'),
  c('personal', 'Active listening means…', 'Looking at the person and trying to understand', ['Looking at your phone', 'Thinking about lunch', 'Interrupting often'], '👂'),
  c('personal', 'When you feel jealous, a healthy thought is…', '"I can work for what I want too."', ['"They don\'t deserve it."', '"I\'ll take theirs."', '"I\'ll be mean to them."'], '🌟'),
  c('personal', 'When you make a mistake, a "growth mindset" says…', '"What can I learn from this?"', ['"I\'m stupid."', '"It\'s someone else\'s fault."', '"I\'ll never try again."'], '🌱')
]

// ---- 4th Grade ----

const G4_HOUSEHOLD = [
  c('household', 'When you operate a washing machine, you should add detergent…', 'Before starting it (in the right slot)', ['After it\'s already washing', 'A whole bottle at once', 'Only after it\'s done'], '🧴'),
  c('household', 'You should NOT put these in the dryer:', 'Wool sweaters or delicates', ['Cotton t-shirts', 'Towels', 'Sheets'], '🧶'),
  o('household', 'Put these laundry steps in order:', [
    'Sort clothes by color',
    'Load the washer',
    'Add detergent and start',
    'Move clothes to the dryer when done'
  ], '🧺'),
  c('household', 'Before ironing a shirt, you should check the…', 'Care label for the right heat', ['Color match for your shoes', 'Time of day', 'Phase of the moon'], '👔'),
  c('household', 'Raw chicken should be cooked to an internal temperature of…', '165°F', ['100°F', '140°F', '212°F'], '🌡️'),
  o('household', 'Put these steps in order to make scrambled eggs:', [
    'Crack eggs into a bowl',
    'Whisk with a small splash of milk',
    'Pour into a heated, buttered pan',
    'Stir gently until cooked through'
  ], '🍳'),
  c('household', 'A "load" of laundry should be…', 'Not too packed in', ['Stuffed as full as possible', 'One sock at a time', 'Mixed with the dishes'], '🧺'),
  c('household', 'When ironing, you should keep the iron…', 'Moving so it doesn\'t scorch', ['Sitting in one spot', 'Face down on the rug', 'Pointed at the cat'], '👕'),
  c('household', 'Bleach should be used…', 'Carefully, only on whites', ['On every color', 'As a snack', 'On your skin'], '⚠️'),
  c('household', 'If a recipe says "preheat the oven to 350°F", you should…', 'Start the oven before mixing so it\'s ready', ['Skip it', 'Put cold food in cold oven', 'Set it to 500°F instead'], '🔥')
]

const G4_MECHANICAL = [
  c('mechanical', 'A "Phillips" screwdriver fits a screw with a tip shaped like a…', '+ (cross)', ['– (flat)', 'Star (Torx)', 'Square'], '➕'),
  c('mechanical', 'To check a car\'s oil, the engine should be…', 'Off, and cool for a few minutes', ['Running fast', 'Just turned off and burning hot', 'On fire'], '🛢️'),
  o('mechanical', 'Put these steps in order to check the engine oil:', [
    'Park on level ground and turn off the engine',
    'Pull out the dipstick and wipe it clean',
    'Push it all the way back in and pull it out again',
    'Check the oil level against the marks'
  ], '🚗'),
  o('mechanical', 'Put these steps in order to change a flat tire:', [
    'Park on level ground and turn on hazard lights',
    'Loosen the lug nuts (don\'t remove yet)',
    'Jack up the car',
    'Remove the lug nuts and swap the tire'
  ], '🛞'),
  c('mechanical', 'A "GFCI" outlet (with test/reset buttons) is found in…', 'Bathrooms and kitchens (near water)', ['Only the garage', 'Bedrooms only', 'Closets'], '🔌'),
  c('mechanical', 'If a circuit breaker trips, you should…', 'Find the tripped breaker and reset it (with dry hands)', ['Touch the wires', 'Pour water on it', 'Ignore it forever'], '⚡'),
  c('mechanical', 'A cordless drill\'s battery should be…', 'Charged before a big project', ['Left in the rain', 'Thrown in the trash when low', 'Microwaved'], '🔋'),
  c('mechanical', 'When using power tools, you should always wear…', 'Safety glasses', ['Sunglasses', 'A scarf', 'Slippers'], '🥽'),
  c('mechanical', 'A tire that looks low on air should be…', 'Inflated to the recommended pressure', ['Driven on as-is', 'Replaced immediately', 'Filled with water'], '💨'),
  c('mechanical', 'A "fuse" in a device protects it by…', 'Breaking the circuit if there\'s too much current', ['Making it louder', 'Recording your voice', 'Cooling it down'], '🔥')
]

const G4_FINANCIAL = [
  c('financial', 'If you earn $5 a week for chores, in a year (52 weeks) you\'ll earn…', '$260', ['$60', '$100', '$500'], '💰'),
  c('financial', 'If you make a budget, you decide…', 'How much to save and how much to spend', ['How much your brother gets', 'How much to lose', 'How much to throw away'], '📒'),
  c('financial', 'Saving 10% of $20 means setting aside…', '$2', ['$1', '$5', '$10'], '🧮'),
  c('financial', 'If you have $50 and a game costs $35, you have left…', '$15', ['$5', '$10', '$85'], '🎮'),
  c('financial', 'A "checking account" lets you…', 'Pay for things with a card or check', ['Check the weather', 'Watch TV', 'Read a book'], '🏦'),
  c('financial', '"Interest" on savings means…', 'The bank pays you a little for keeping your money there', ['The bank takes your money', 'Your money disappears', 'You owe the bank'], '📈'),
  c('financial', 'Three $20 bills plus one $10 bill equals…', '$70', ['$50', '$60', '$80'], '💵'),
  c('financial', '"Earning money" usually means…', 'Doing work for it', ['Wishing for it', 'Finding it on the ground every day', 'Stealing it'], '🛠️'),
  c('financial', 'A "goal" with money might be…', 'Saving $40 for a new bike helmet', ['Spending it all today', 'Losing it', 'Hiding it under a rock'], '🎯'),
  c('financial', 'If a friend asks to borrow money, you should…', 'Decide carefully and only lend what you can spare', ['Lend them everything', 'Never lend anything ever', 'Pretend you don\'t have any'], '🤝')
]

const G4_PERSONAL = [
  c('personal', 'A classmate disagrees with you. The respectful thing to do is…', 'Listen first, then explain your view calmly', ['Yell over them', 'Roll your eyes', 'Walk out of the room'], '🗣️'),
  c('personal', 'When you write a thank-you note, you should…', 'Mention what you\'re thanking them for', ['Make it as short as possible', 'Send the same one to everyone', 'Skip the name'], '✉️'),
  c('personal', 'If you accidentally break something at a friend\'s house, you should…', 'Tell them and offer to help fix it or replace it', ['Hide it under a couch', 'Pretend it was always broken', 'Leave quickly'], '🏠'),
  c('personal', 'When you feel really angry, a healthy move is to…', 'Walk away and take a break', ['Throw something', 'Slam doors', 'Yell at the closest person'], '🚪'),
  c('personal', 'When you don\'t agree with a teacher\'s grade, you should…', 'Ask politely if you can talk about it', ['Refuse to do work', 'Tell your friends she\'s mean', 'Lie about your grade at home'], '🎓'),
  c('personal', 'If a friend tells you a secret about being sad, you should…', 'Listen and, if it\'s serious, encourage them to tell a trusted adult', ['Tell everyone at school', 'Make a joke about it', 'Ignore them'], '🫂'),
  c('personal', 'Asking for help is…', 'A sign of strength, not weakness', ['Always embarrassing', 'For little kids only', 'Bad'], '💪'),
  c('personal', 'When someone is talking, you show respect by…', 'Making eye contact and not interrupting', ['Looking at your phone', 'Talking over them', 'Walking away mid-sentence'], '👁️'),
  c('personal', 'If you lose a game and feel mad, the best thing is to…', 'Shake hands and try again later', ['Knock over the board', 'Accuse the winner of cheating', 'Storm out'], '🤝'),
  c('personal', 'When a younger kid is having a hard time, you can…', 'Be patient and help them', ['Tease them', 'Tell them to grow up', 'Walk past'], '🧒')
]

// ---- 5th Grade ----

const G5_HOUSEHOLD = [
  o('household', 'Put these steps in order to cook plain white rice:', [
    'Rinse the rice in cold water',
    'Add rice and water to a pot (about 2 cups water per cup of rice)',
    'Bring to a boil, then reduce to a simmer with the lid on',
    'Cook ~18 minutes, then let rest 5 minutes before fluffing'
  ], '🍚'),
  c('household', 'When you cook with a sharp knife, you should…', 'Curl your fingers under (claw grip) on the food', ['Point fingers straight out toward the blade', 'Hold the food with both palms', 'Look away while cutting'], '🔪'),
  c('household', 'A kitchen fire from oil should be put out with…', 'A lid (smother it) — never water', ['A bucket of water', 'A fan', 'A pillow'], '🔥'),
  c('household', 'Cross-contamination means…', 'Spreading germs from raw food to cooked food', ['Using two cutting boards on purpose', 'Cooking with cross stitches', 'Mixing two recipes'], '🦠'),
  c('household', 'Before you eat eggs, they should be…', 'Cooked until the whites are set', ['Slightly runny on the bottom', 'Cold from the fridge', 'In the shell'], '🍳'),
  c('household', 'When folding a t-shirt, you should…', 'Smooth it flat first, then fold in thirds', ['Roll it into a ball', 'Stretch it as much as possible', 'Cut it in half'], '👕'),
  c('household', 'Cleaning a bathroom usually means…', 'Wiping surfaces, scrubbing the toilet, and mopping the floor', ['Spraying everything with perfume', 'Lighting candles only', 'Hiding the towels'], '🧽'),
  o('household', 'Put these steps in order to wash dishes by hand:', [
    'Scrape off food scraps',
    'Wash with soapy water',
    'Rinse with clean water',
    'Air-dry or towel-dry'
  ], '🍽️'),
  c('household', 'A measuring cup is most accurate when…', 'You read it at eye level', ['You guess from above', 'You shake it', 'You pour quickly'], '🥛'),
  c('household', 'If milk smells sour, you should…', 'Throw it out', ['Drink it fast', 'Use it for cereal anyway', 'Hide it back in the fridge'], '🥛')
]

const G5_MECHANICAL = [
  o('mechanical', 'Put these steps in order to fill a car with gas:', [
    'Turn off the engine and open the fuel door',
    'Select the right grade and pay or pre-pay',
    'Insert nozzle and start fueling',
    'Replace nozzle and close fuel door'
  ], '⛽'),
  c('mechanical', 'A car\'s "check engine" light usually means…', 'Something needs to be looked at by a mechanic', ['You can keep driving forever', 'The car is brand new', 'The radio is broken'], '🚗'),
  c('mechanical', 'The "lug nuts" on a tire should be tightened in a…', 'Star pattern, not in a circle', ['Tightest one first, then ignore the rest', 'Whichever order is fastest', 'Loosest pattern you can'], '🔧'),
  o('mechanical', 'Put these steps in order to safely use a power saw:', [
    'Put on safety glasses and clear the work area',
    'Mark and clamp the workpiece',
    'Make the cut with steady, even pressure',
    'Turn off the saw and wait for the blade to stop'
  ], '🪚'),
  c('mechanical', 'If you smell natural gas in the house, you should…', 'Leave the house and call from outside', ['Try to find the source with a lighter', 'Open the fridge', 'Take a nap'], '🚨'),
  c('mechanical', 'Tire tread that\'s too worn means…', 'It\'s time to replace the tire', ['It\'ll last forever', 'You can drive faster', 'It only matters in summer'], '🛞'),
  c('mechanical', 'When unplugging an appliance, pull on the…', 'Plug, not the cord', ['Cord, hard', 'Outlet itself', 'Wall'], '🔌'),
  c('mechanical', 'A "GFCI" outlet should be tested…', 'Every month with the test button', ['Once in a lifetime', 'Only when something breaks', 'Never'], '⚡'),
  c('mechanical', 'Before drilling into a wall, you should check for…', 'Studs, wires, and pipes', ['The color of the paint', 'Whether it\'s lunchtime', 'Your favorite song'], '🪛'),
  c('mechanical', 'A spare tire should be…', 'Driven on slowly until you get a real tire', ['Used for years', 'Driven at top speed', 'Filled with anything handy'], '🛞')
]

const G5_FINANCIAL = [
  c('financial', '15% of $20 is…', '$3', ['$1', '$2', '$5'], '🧮'),
  c('financial', 'If a bank pays 5% interest on $100, after a year you have about…', '$105', ['$100', '$50', '$500'], '🏦'),
  c('financial', 'A budget is a plan that compares…', 'Money coming in vs. money going out', ['Cars vs. trucks', 'Days vs. nights', 'Friends vs. enemies'], '📒'),
  c('financial', 'A "fixed expense" is something you pay…', 'About the same every month (like rent)', ['Once in a lifetime', 'Whenever you feel like', 'Only on holidays'], '🏠'),
  c('financial', 'Saving $20 a month for a year gives you…', '$240', ['$20', '$120', '$2,400'], '🐷'),
  c('financial', 'A "credit card" lets you…', 'Borrow money that you have to pay back', ['Get free money forever', 'Avoid all bills', 'Print money'], '💳'),
  c('financial', '"Compound interest" is interest paid on…', 'Both your savings AND the interest you\'ve already earned', ['Just the original deposit, never more', 'Other people\'s money', 'Air'], '📈'),
  c('financial', 'A "tip" at a restaurant is usually about…', '15–20% of the bill', ['1%', '50%', 'A handshake instead of money'], '🍽️'),
  c('financial', 'If you earn $50 and save 20%, you save…', '$10', ['$5', '$20', '$30'], '💵'),
  c('financial', 'A subscription that costs $10 a month costs how much per year?', '$120', ['$10', '$20', '$1,200'], '🗓️')
]

const G5_PERSONAL = [
  c('personal', 'If a friend tells you they\'re thinking about hurting themselves, you should…', 'Tell a trusted adult right away — even if you promised secrecy', ['Keep it a secret to be loyal', 'Tell only other kids', 'Pretend you didn\'t hear'], '🫂'),
  c('personal', 'When you write a formal email to a teacher, you should…', 'Use a greeting, full sentences, and a polite sign-off', ['Use slang and emojis', 'Type in ALL CAPS', 'Just send "k"'], '✉️'),
  c('personal', 'When you disagree with a friend\'s opinion, you can…', 'Share your view respectfully without insulting them', ['Call them names', 'Stop being friends', 'Ignore them forever'], '🗣️'),
  c('personal', 'A growth-mindset response to "I failed my test" is…', '"What can I do differently next time?"', ['"I\'m stupid."', '"School is dumb."', '"I quit."'], '🌱'),
  c('personal', 'When you feel overwhelmed, a healthy first step is…', 'Pause, breathe, and break the problem into smaller parts', ['Ignore everything', 'Yell at someone', 'Stay up all night worrying'], '🌬️'),
  c('personal', 'If you see a classmate being bullied, you can…', 'Tell a teacher and check on the person later', ['Join in', 'Film it', 'Walk past'], '🛡️'),
  c('personal', 'Apologizing well means…', 'Naming what you did, saying sorry, and making it right', ['Mumbling "sorry" and moving on', 'Blaming the other person', 'Saying "I\'m sorry you feel that way"'], '🤝'),
  c('personal', 'Saying "no" politely to peer pressure sounds like…', '"No thanks, that\'s not for me."', ['"You\'re all jerks."', 'Silence and walking away every time', 'Doing it anyway just to be cool'], '🛑'),
  c('personal', 'When a grown-up gives you constructive feedback, you should…', 'Thank them and think about what they said', ['Argue right away', 'Pretend to listen', 'Roll your eyes'], '🎓'),
  c('personal', 'Asking for help is hardest but most useful when…', 'You feel like you should already know it', ['Everyone else is helping', 'You don\'t need it', 'No one is around'], '💪')
]

// ---- Assemble + tag with stable ids ----

const GRADES = {
  '1st Grade': {
    household: G1_HOUSEHOLD,
    mechanical: G1_MECHANICAL,
    financial: G1_FINANCIAL,
    personal: G1_PERSONAL
  },
  '2nd Grade': {
    household: G2_HOUSEHOLD,
    mechanical: G2_MECHANICAL,
    financial: G2_FINANCIAL,
    personal: G2_PERSONAL
  },
  '3rd Grade': {
    household: G3_HOUSEHOLD,
    mechanical: G3_MECHANICAL,
    financial: G3_FINANCIAL,
    personal: G3_PERSONAL
  },
  '4th Grade': {
    household: G4_HOUSEHOLD,
    mechanical: G4_MECHANICAL,
    financial: G4_FINANCIAL,
    personal: G4_PERSONAL
  },
  '5th Grade': {
    household: G5_HOUSEHOLD,
    mechanical: G5_MECHANICAL,
    financial: G5_FINANCIAL,
    personal: G5_PERSONAL
  }
}

// Stable id per question so anti-repeat works without re-hashing identical text.
for (const [grade, cats] of Object.entries(GRADES)) {
  for (const [cat, list] of Object.entries(cats)) {
    list.forEach((q, idx) => {
      q.id = `life-${grade}-${cat}-${idx}`
    })
  }
}

export const LIFESKILLS = GRADES
export const CATEGORIES = ['household', 'mechanical', 'financial', 'personal']
