//Created by M. Francis - 2020

/**
 * A giant array of all possible "words" that can show up during the game.
 * Grouped into sections. All entries were hand-typed and entered by me.
 * A note to consider: I did not spell-check most of these (unless I was unsure)
 * 
 * WARNING:
 * By reading this array in the source file words.js, you are condoning yourself
 * to not only spoilers, but my occasional stupid comments, remarks, and jokes.
 * 
 * @author M. Francis
 */

const words = [
	/**************************/
	/*  FOOD AND RESTAURANTS  */
	/**************************/
	//Fruit
	"fruit",
	"cherry",
	"apple", //Pink Lady apples are my favorite kind of apple
	"pear",
	"banana",
	"coconut",
	"peach",
	"lemon",
	"lime",
	"strawberry",
	"blueberry",
	"raspberry",
	"blackberry",
	"watermelon",
	"cantaloupe",
	"tomato",
	"grapes",
	//Vegetables
	"vegetable",
	"carrot",
	"corn",
	"broccoli",
	"cauliflower",
	"potato",
	"asparagus",
	"brussel sprouts",
	"green beans",
	"cabbage",
	"turnip",
	//Other food
	"food",
	"chicken nuggets",
	"hamburger",
	"cheeseburger",
	"bread",
	"meat",
	//Fast Food Chains
	"fast food",
	"McDonalds",
	"Burger King",
	"Wendys",
	"Subway",
	"Taco Bell",
	"Kentucky Fried Chicken",
	"Starbucks",
	"Arbys",
	"Dominos",
	"Dunkin Donuts",
	"Panda Express",
	"Little Caesars",
	"White Castle",
	"Pizza Hut",
	"Tim Hortons",
	"Dairy Queen",
	"Buffalo Wild Wings",
	/*******************/
	/*  LIVING THINGS  */
	/*******************/
	//Mammals
	"ferret",
	"dog", //I have a dog named Bella
	"cat",
	"tiger",
	"lion",
	"giraffe",
	"zebra",
	"panda",
	"koala",
	"red panda",
	"black bear",
	"grizzly bear",
	"brown bear",
	"polar bear",
	"pig",
	"cow",
	"sheep",
	"horse",
	"wolf",
	"fox", //My favorite animal
	"arctic fox",
	"deer",
	"moose",
	"elephant",
	"warthog",
	"sloth",
	//Aquatic animals
	"seal",
	"fish",
	"shark",
	"whale",
	"plankton",
	//Birds
	"bird",
	"parrot",
	"owl",
	"eagle",
	"hawk",
	"turkey",
	"penguin",
	"falcon",
	"chicken",
	//Insects
	"bug",
	"insect",
	"fly",
	"bee",
	"wasp",
	"mosquito",
	"cockroach",
	//Other
	"spider", //A SPIDER IS NOT AN INSECT
	/****************************************/
	/*  COMICS, MOVIES, TV, AND CHARACTERS  */
	/****************************************/
	//DC characters
	"DC comics",
	"Batman",
	"Robin",
	"Superman",
	"Wonder Woman",
	"Green Lantern",
	"Aquaman",
	"The Joker",
	"Lex Luthor",
	"Catwoman",
	"Shazam",
	"The Flash",
	"Bizarro",
	"Beast Boy",
	"Poison Ivy",
	"Cyborg",
	"Alfred Pennyworth",
	"Batwoman",
	"Supergirl",
	//Marvel characters
	"Marvel comics",
	"Stan Lee",
	"Spider-man",
	"Iron man",
	"Thor",
	"Captain America",
	"The Hulk",
	"Black Widow",
	"Hawkeye",
	"Thanos",
	"Wolverine",
	"Nick Fury",
	"Star-Lord",
	"Gamora",
	"Drax the Destroyer",
	"Rocket Raccoon",
	"Groot",
	"Black Panther",
	"Ant-Man",
	"Captain Marvel",
	"Loki",
	"Deadpool",
	"Ultron",
	"Human Torch",
	"Silver Surfer",
	"Professor X", //I have never seen/read/anything the X-Men
	"Cyclops",
	//Kids television shows (and characters from them) (this is inclusive of young children's shows)
	"Mickey Mouse",
	"Minnie Mouse",
	"Donald Duck",
	"Daisy Duck",
	"Goofy",
	"Phineas and Ferb", //One of my favorite kids shows
	"Major Monogram",
	"Perry the Platypus",
	"Heinz Doofenshmirtz",
	"Amazing World of Gumball",
	"Gumball Watterson",
	"Darwin Watterson",
	"Cailou",
	"Peppa Pig",
	"The Backyardagains",
	"Little Einsteins",
	"Cat in the Hat",
	"Teen Titans",
	"Spongebob Squarepants",
	"Patrick Star",
	"Mr. Krabs",
	"Jimmy Neutron",
	"Liv and Maddie",
	"Steven Universe", //From what I've heard, great show but TOXIC community
	"Connie Maheswaran",
	"Rose Quartz",
	"Gravity Falls", //Also one of my favorite kids shows, shame they stopped making them
	"Dipper Pines",
	"Mabel Pines",
	"Stanley Pines",
	"Ford Pines",
	"Soos Ramirez",
	"Bill Cipher", //One off my favorite villans, he was funny
	//Disney and Pixar movies (and some characters sprinkled in)
	"Toy Story",
	"Monsters Inc",
	"Finding Nemo",
	"The Incredibles",
	"Wall-E",
	"Coco",
	"Onward",
	"Cinderella",
	"Fairy Godmother",
	"The Little Mermaid",
	"Ariel",
	"Beauty and the Beast",
	"Tangled",
	"Rapunzel",
	"Mother Gothel",
	"Mulan",
	"The Lion King",
	"Mufasa",
	"Simba",
	"Hercules",
	"Princess and the Frog",
	"Tiana",
	"Prince Naveen",
	"Dr. Facilier",
	"Snow White",
	"Sleeping Beauty",
	"Malificent",
	"Aladin",
	"Pocahontas",
	"Peter Pan",
	"Captain Hook",
	"Tinker Bell",
	"Lilo and Stitch",
	"Fantasia",
	"Bambi",
	"Pinocchio",
	"Alice in Wonderland",
	"Mad Hatter",
	"The Red Queen",
	"Cheshire Cat",
	"Meet the Robinsons",
	"Wreck-It Ralph", //First movie was good, second was a cash grab
	"Fix-It Felix",
	"Vanellope von Schweetz",
	"King Candy",
	"Frozen",
	"Prince Hans",
	"Elsa",
	"Zootopia",
	"Judy Hopps",
	"Nick Wilde",
	"Bellwether",
	"Moana",
	//Movies (generic (not by any particular company); kids and adult mixed; characters thrown in as well))
	"Shrek",
	"Princess Fiona",
	"Monster House",
	"Pirates of the Caribbean",
	"Jack Sparrow",
	"Davy Jones",
	"Barbossa",
	"The Lorax",
	"The Onceler",
	"Harry Potter",
	"Ron Weasley",
	"Hermoine Granger",
	"Draco Malfoy",
	"Albus Dumbledore",
	"Severus Snape",
	"Dolores Umbridge", //One of the most hated antagonists of all time
	"Lord Voldemort",
	"Despicable Me",
	"Gru",
	"minions",
	"Vector",
	"Jurassic Park",
	"Jurassic World",
	"How to Train Your Dragon",
	"Hiccup",
	"Stoick",
	"Night Fury",
	"Kung Fu Panda",
	"Happy Feet",
	"Over the Hedge",
	"The Verminator",
	"Megamind",
	"Metroman",
	"Monsters vs. Aliens",
	"The Boss Baby", //Why does this movie exist
	"Captain Underpants", //More known as a book series, but I'm putting it here because I'm not making a book catergory
	"The LEGO Movie",
	"Emmet Brickowski",
	"Lord Business",
	"Vitruvius",
	"Unikitty",
	"Cloudy with a Chance of Meatballs",
	"Flint Lockwood",
	"Sam Sparks",
	"Nightmare Before Christmas",
	"Jack Skellington",
	"Hotel Transylvania",
	"The Avengers",
	//Film/television companies
	"Disney",
	"Pixar",
	"Warner Bros",
	"Blue Sky Studios",
	"Universal Studios",
	"Illumination Entertainment", //The only good movie to come out of this stuido was Despicable Me 1, change my mind
	"Nickelodeon",
	"Paramount Pictures",
	"Dreamworks",
	/********************************/
	/*  VIDEO GAMES AND CHARACTERS  */
	/********************************/
	//Video Game Characters (Nintendo)
	"Mario",
	"Luigi",
	"Bowser",
	"Princess Peach",
	"Toad",
	"Pirana Plant",
	"Wario",
	"Waluigi",
	"Link",
	"Zelda",
	"Donkey Kong",
	"Diddy Kong",
	"Mr. Resetti",
	"Tom Nook", //Give me your money
	"Isabelle",
	"Kirby",
	"King Dedede",
	"Meta Knight",
	"Samus",
	"Metroids",
	"Star Fox", //DO A BARREL ROLL
	"Star Wolf",
	"Andross",
	"Captain Falcon",
	"Ness",
	"Sonic", //Chili dogs
	"Tails",
	"Doctor Eggman",
	"Knuckles",
	//Pokemon
	"Pokemon",
	"Ash Ketchum",
	"Professor Oak",
	"Team Rocket",
	"Team Plasma",
	"Pokeball",
	"Pikachu",
	"Eevee", //My favorite pokemon
	"Meowth",
	"Jigglypuff",
	"Snorlax",
	"Mewtwo",
	"Lucario",
	"Snom",
	"Charmander",
	"Charizard",
	"Squirtle",
	"Blastoise",
	"Bulbasaur",
	"Venusaur",
	"Chikorita",
	"Cyndaquil",
	"Totodile",
	"Treecko",
	"Torchic",
	"Mudkip",
	"Turtwig",
	"Chimchar",
	"Piplup",
	"Snivy",
	"Oshawott",
	"Tepig",
	"Chespin",
	"Fennekin",
	"Froakie",
	"Rowlet",
	"Litten",
	"Popplio",
	"Grookey",
	"Scorbunny",
	"Sobble",
	//Video Game Characters (General)
	"Sackboy",
	"GLaDOS",
	"Chell",
	"Doug Rattman",
	"Cave Johnson",
	"Weighted Companion Cube",
	"Gordon Freeman",
	"The G-Man",
	"Alyx Vance",
	"Master Chief",
	//Video Games/Video Game Franchises
	"Legend of Zelda",
	"Minecraft",
	"Super Mario Bros",
	"Super Smash Brothers",
	"Grand Theft Auto",
	"Fortnite",
	"The Elder Scrolls",
	"Skyrim",
	"World of Warcraft",
	"RAID Shadow Legends",
	"Red Dead Redemption",
	"Overwatch",
	"Animal Crossing",
	"LittleBig Planet",
	"Wii Sports",
	"Half-Life",
	"BioShock",
	"Pong",
	"Space Invaders",
	"Portal",
	"Street Fighter",
	"Mass Effect",
	"Fallout",
	"Cyberpunk",
	"Tetris",
	"The Sims",
	"Diablo",
	"Metal Gear Solid",
	"Halo",
	"Final Fantasy",
	"Colossal Cave Adventure",
	"Day of the Tentacle",
	"Maniac Mansion",
	"Call of Duty",
	"Angry Birds",
	"Terraria",
	"Duck Hunt",
	"Frogger",
	"Mario Kart",
	/*****************************/
	/*  PLACES AROUND THE WORLD  */
	/*****************************/
	//North American countries, states, cities, and landmarks
	"Canada",
	"The United States",
	"Mexico",
	"Greenland",
	"New York",
	"Alaska",
	"Hawaii",
	"Michigan", //The place where half the roads are full of holes. I live here
	"Florida",
	"California",
	"Texas",
	"Colorado",
	"New Jersey",
	"Virginia",
	"West Virginia",
	"Georgia",
	"Ohio",
	"South Dakota",
	"Nevada",
	"Idaho",
	"Mexico City",
	"New York City",
	"Los Angeles",
	"Toronto",
	"Chicago",
	"Houston",
	"Havana",
	"Ecatepec de Morelos",
	"Montreal",
	"Philadelphia",
	"Las Vegas",
	"San Diego",
	"San Francisco",
	"Washington DC",
	"The Great Lakes",
	"Mississippi River",
	"Grand Canyon",
	"Statue of Liberty",
	"Mount Rushmore",
	"Niagara Falls",
	"Golden Gate Bridge",
	"Disneyland",
	//South American countries, cities, and landmarks
	"Brazil",
	"Chile",
	"Peru",
	"Argentina",
	"Venezuela",
	"Buenos Aires",
	"Rio de Janeiro",
	"Santiago",
	"Lima",
	"Amazon rainforest",
	"Amazon river",
	"Machu Picchu",
	"El Morro",
	"Casapueblo",
	"Iguazu Falls",
	//Africa countries, cities, and landmarks
	"Egypt",
	"Algeria",
	"Democratic Republic of the Congo",
	"South Africa",
	"Madagascar",
	"Ethiopia",
	"Mali",
	"Nigeria",
	"Morocco",
	"Libya",
	"Cairo",
	"Lagos",
	"Alexandria",
	"The Pyramids",
	"Great Sphinx",
	"Mount Kilimanjaro",
	"Victoria Falls",
	//Europe countries, cities, and landmarks
	"England",
	"Ireland",
	"Scotland",
	"Sweden",
	"France",
	"Spain",
	"Switzerland",
	"Belgium",
	"Italy",
	"Greece",
	"Netherlands",
	"Poland",
	"Austria",
	"Germany",
	"Iceland", //While it is an island, it's still considered a part of Europe
	"Paris",
	"London",
	"Madrid",
	"Barcelona",
	"Rome",
	"Berlin",
	"Athens",
	"Brussels",
	"Warsaw",
	"Dublin",
	"Pompeii",
	"Eiffel Tower",
	"Colosseum",
	"Leaning Tower of Pisa",
	"Acropolis",
	"Parthenon",
	"Big Ben",
	"Louvre",
	"Stonehenge",
	"Arc de Triomphe",
	"Sistine Chapel",
	"Buckingham Palace",
	"Alps",
	"London Eye",
	"Tower of London",
	//Asia countries, cities, and landmarks
	"China",
	"Russia",
	"India",
	"Nepal",
	"Vietnam",
	"Japan",
	"Israel",
	"Saudi Arabia",
	"Tokyo",
	"Shanghai",
	"Mumbai",
	"Beijing",
	"Seoul",
	"Hong Kong",
	"Taj Mahal",
	"Moscow", //Yes, Moscow is a European city, but I'm putting it in Asia because most of Russia is in Asia
	"Great Wall of China",
	"Forbidden City",
	"Mount Fuji",
	"Mount Everest",
	/************************************************/
	/*  TECHNOLOGY COMPANIES AND INTERNET PRODUCTS  */
	/************************************************/
	//Technology companies and internet websites
	"Google",
	"Facebook",
	"Twitter",
	"Instagram",
	"Snapchat",
	"TikTok",
	"Reddit",
	"Pinterest",
	"YouTube",
	"Twitch",
	"Amazon",
	"Microsoft",
	"Apple",
	"Android",
	"Bing",
	"Yahoo",
	"Chrome",
	"Edge",
	"Firefox",
	"DeviantArt",
	"Discord",
	"Flickr",
	"Patreon",
	"Skype",
	"Slack",
	"LinkedIn",
	"GitHub",
	"Netflix",
	"Hulu",
	"Disney Plus",
	/****************************/
	/*  OCCUPATIONS AND PLACES  */
	/****************************/
	//Occupations, jobs, and specialized places
	"hospital",
	"clergy",
	"nurse",
	"doctor",
	"dentist",
	"therapist",
	"hygienist",
	"social worker",
	"police office",
	"police officer",
	"construction worker",
	"barber shop",
	"barber",
	"farm",
	"farmer",
	"breeder",
	"laborer",
	"office",
	"office worker",
	"detective",
	"firefighter",
	"fire station",
	"musician",
	"dancer",
	"school",
	"teacher",
	"tutor",
	"graveyard",
	"mechanic",
	"electrician",
	"plumber",
	"racer",
	"singer",
	"rapper",
	"announcer",
	"garbage man",
	"restaurant",
	"waiter",
	"bartender",
	"barista",
	"butler",
	"library",
	"librarian",
	"artist",
	"sculpter",
	"painter",
	"illustrator",
	"writer",
	"con artist", //why not
	"business man",
	"manager",
	"chief executive officer",
	"accountant",
	"logistician",
	"designer",
	"fashion designer",
	"mayor",
	"governor",
	"president",
	"astronaut",
	"programmer",
	"engineer",
	"civil engineer",
	"mathematician",
	"scientist",
	"biologist",
	"chemist",
	"physicist",
	"lab technician",
	"technician",
	"analyst",
	"data analyst",
	"sports analyst",
	"statistician",
	"editor",
	"operator",
	"radio operator",
	"umpire",
	"referee",
	"collector",
	"security guard",
	"janitor",
	"babysitter",
	"gardener",
	"appraiser",
	"specialist",
	"developer",
	"web developer",
	"software developer",
	"stonemason",
	"carpenter",
	"supermarket",
	"cashier",
	"tailor",
	"driller",
	"roofer",
	"curator",
	"archivist",
	"cook",
	"lawyer",
	"judge",
	"clerk",
	"reporter",
	"archeologist",
	"archeology",
	"anthropologist",
	"psychologist",
	"cartographer",
	"geography",
	"historian",
	"history",
	"natrualist",
	"zoologist",
	"zoology",
	"officer",
	"general",
	"infantry",
	"infantry officer",
	"special forces",
	"special forces officer",
	"publisher",
	"mailman",
	"bank teller",
	"director",
	"funeral director",
	"mortician",
	"usher",
	"jeweler",
	"blacksmith",
	/*************************/
	/*  POPULAR COMMUNITIES  */
	/*************************/
	//Anime (note: I do not watch or read anime or mangas, do not judge my lack of knowledge)
	//For anyone OOTL (I doubt there are such), anime is a style of Japanese animation/literature.
	"anime",
	"manga",
	//Furry fandom
	//For anyone OOTL, the furry fandom is a fandom that creates animal (usually anthropomorphic) personas.
	"furry",
	"fursuit",
	"fursona", //Furry persona
	"protogen", //Half-robot furries
	/********************************************/
	/*  HOLIDAYS AND KIDS FICTIONAL CHARACTERS  */
	/********************************************/
	//Christmas
	"Christmas",
	"Christmas tree",
	"Santa Claus", //Every company's favorite source of revenue
	"St. Nicholas",
	"North Pole",
	"elf",
	"The Grinch",
	"candy cane",
	"gingerbread",
	"gingerbread man",
	"Frosty the Snowman",
	"Rudolph the red-nosed reindeer",
	"eggnog",
	"mistletoe",
	//Other holidays and made-up things for kids and capitalism
	"Easter Bunny",
	"Tooth Fairy",
	"Easter",
	"Hanukkah",
	"Kwanzaa",
	"St. Valentines Day",
	"candy hearts",
	"St. Patricks Day",
	"Thansgiving",
	"leprechaun",
	/*************************/
	/*  MISCELLANEOUS WORDS  */
	/*************************/
	//Dining and kitchen objects
	"kitchen",
	"plate",
	"cup",
	"spoon",
	"fork",
	"knife",
	"pot",
	"pan",
	"cutting board",
	"blender",
	"fridge",
	"oven",
	"microwave",
	"toaster",
	"sink",
	"dishwasher",
	"cooking",
	//Household objects
	"dining room",
	"trash can",
	"table",
	"chair",
	"living room",
	"television",
	"dvd player",
	"cd player",
	"couch",
	"lamp",
	"door",
	"window",
	"foyer",
	"picture",
	"grandfather clock",
	"potted plant",
	"staircase",
	"bedroom",
	"bed",
	"dresser",
	"alarm clock",
	"calendar",
	"closet",
	"bathroom",
	"toilet",
	"bathtub",
	"shower",
	"attic",
	"ladder",
	"garage",
	"car",
	"porch",
	"grill",
	//School stuff
	"paper",
	"pencil",
	"pen",
	"notebook",
	"binder",
	"essay",
	"speech",
	"desk",
	//Office supplies
	"computer",
	"boss",
	"cubicle",
	"printer",
	"clock",
	//Gardening supplies
	"shovel",
	"spade",
	"rake",
	"plow",
	"scythe",
	//Instruments
	"saxophone",
	"clarinet",
	"flute",
	"oboe",
	"bassoon",
	"piccolo",
	"french horn",
	"mayonnaise", //This one is in here as a joke
	"trumpet",
	"trombone",
	"percussion",
	"drums",
	"guitar",
	"violin",
	"viola",
	//Geographical featues
	"lake",
	"river",
	"mountain",
	"hill",
	"valley",
	"canyon",
	"ocean",
	"volcano",
	"plateau",
	//Weather things
	"sun",
	"cloud",
	"rain",
	"snow",
	"sleet",
	"thunderstorm",
	"tornado",
	"hurricane",
	"typhoon",
	"tropical storm",
	//Solar System and outer space
	"space",
	"sun",
	"moon",
	"Mercury",
	"Venus",
	"Earth",
	"Mars",
	"asteroid belt",
	"Jupiter",
	"Saturn",
	"Uranus",
	"Neptune",
	"Pluto",
	"Milky Way",
	"galaxy",
	"meteor",
	"asteroid",
	//Colors (to spice things up a bit)
	"black", //Black ain't a color y'all
	"gray",
	"brown",
	"white",
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
	"rainbow",
	//Geometry
	"circle",
	"oval",
	"square",
	"rectangle",
	"trapezoid",
	"rhombus",
	"parallelogram",
	"kite", //This is a shape name, although it will probably be drawn as the kid toy
	"triangle",
	"pentagon",
	"hexagon",
	"octagon",
	"crescent",
	"arc",
	"line",
	"hyperbola",
	"sphere",
	"cube",
	"pyramid",
	"cylinder",
	"prism",
	"cone",
	"tetrahedron",
	//Music genres (a challenge and also a small group, I'm not putting that many here)
	"pop",
	"jazz",
	"rock",
	"dubstep",
	"rap",
	"synth",
	"blues",
	//Body parts
	"head",
	"arm",
	"leg",
	"hand",
	"finger",
	"foot",
	"toe",
	"blood",
	"stomach",
	"lungs",
	"heart",
	"kidney",
	"bladder",
	"hair",
	"eyeball",
	"nose",
	"ear",
	"mouth",
	"tongue",
	"tooth",
	"teeth",
	"face",
	"belly button",
	"elbow",
	"knee",
	"fingernail",
	"toenail",
	"neck",
	"butt",
	//Animal parts that are not a part of humans
	"tail",
	"wings",
	"paw",
	//Technology
	"robot",
	"internet",
	"server",
	"laptop",
	"circuit board",
];