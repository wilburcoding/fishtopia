# Fishtopia
An interactive Slack bot fishing game 

# TODO
 - [x] Create bot application and add to channel
   - [ ] Create slash commands
 - [x] Setup database
   - [x] Database schema
 - [ ] Preset data
   - [ ] Fish 
     - [ ] Fish artwork
     - [ ] Balance fishes
     - [ ] Fish variants
   - [ ] Equipment (tools + baits)
     - [ ] Item artwork
     - [ ] Balance items
   - [ ] Maps
     - [ ] Maps artwork
   - [ ] Boats (hoping for at least like 8)
     - [ ] Boat artwork
     - [ ] Balance boats
 - [ ] Commands 
   - [ ] /f-fish
   - [ ] /f-shop
   - [ ] /f-market
   - [x] /f-start
   - [ ] /f-equipment
   - [ ] /f-boat
 - [ ] 


# IDEA DUMP
 - Commands
   - /fish -> actually fishing
     - Going to have a mix of options. Maps
   - /shop -> buy well anything
   - /market -> view offers from other people
   - /start -> set up user data
   - /ping -> bot ping -> mostly just a testing command
   - /boat -> view your boat (with options)
   - /equipment -> tools, baits, other equipment
   - /profile -> overview of your equipment, boat
 - Gameplay
   - Use /start command
   - Users start with basic tools and a boat
   - Use /fish to go fishing
     - Need to travel to different areas (time to travel varies based on boat, location)
       - Pick specific equipment (tools, baits) to bring with you (limited storage on boats -> dependent on boat)
       - Maximum amount of equipment you can bring for each ship 
     - Before you fish, you can select tools/bait (using buttons) to boost odds
     - May have to wait some time before anything comes up -> chance of nothing
       - Odds are different for different types of baits or tools
       - Can choose to keep or throw back fish
     - Shows catch + option to fish again (same tools), change setup, or return home
   - Use /shop to buy equipment 
     - Boat, tools, baits. Prices in both coins and gold
     - Some items are only available in gold (rare stuff)
   - Use /market to put offers and trade things with other people 
   - Use /equpment to check out your tools, baits, and other equipment
     - Options to upgrade, sell, repair tools
   - Use /profile to get an overview of your stuff
     - Multi-paginated with tabs on boat, tools, stats
       - Money page with net worth + start date + if the user is currently fishing right now
       - Boats page showing list of owned boats + currently equipped boat stats + addons
       - Equipment -> tools and baits
       - Stats -> other usage stats (ex. times fished)
     - Ability to search up other users
   - Fish species with rarity
 - Additional gameplay features
   - Fish
     - Rarity tags: Common, Uncommon, Rare, Epic, Legendary
     - Variants for each type (super rare "Chroma", rare "Shiny")
     - Data included: name, rarity, xp, maps (with catch probability weighting), type (regular, chroma, or shiny), weight, sell value
   - Maps
     - Different fish for each location
     - Differnt distances from home location
     - Max capacity for locations? 
       - More people = lower chance of catching fish
     - Different availability times -> or rather different best fishing times
   - Events
   - Currency
       - Coins -> can get from selling catch
       - Gold -> decently rare currency
   - Boat
     - Different kinds of boat have different appearence, speed, capacity, range
     - Durability -> for different types of waters
       - You can enter any water you want but if you're below the durability minimum for the map you may capsize. If you are near the durability minimum, there is a chance you're boat gets damaged
     - Stats
       - Speed -> starts at 5 kt and goes up to 60 kt. Though it dosen't always go up with level or cost
       - Capacity -> starts at 5 slots and goes up to like 100
       - Range -> in miles. Limits where boat can go + how far you can fish for
       - Durability -> 1-20 (lowest to highest)
     - Rowboat, sailboat, motorboat, trawler
     - Different upgrades to expand boat
       - Upgraded motor -> faster travel
         - Only available for motored boats
       - Cooler -> extra storage 
       - Extra fuel -> further range for boat (more locations)
       - Rod holder -> faster fishing
       - More TBD
     - Tiers: Novice, Amateur, Professional, Elite, Legendary
   - Equipment
     - Tools
       - Hand
       - Pole
       - Spear
       - Fishing Rod
       - Net
       - Speargun
       - Electric Reel Rig
       - Harpoon gun
       - More special tools TBD
       - Different levels -> increased durability or effect
       - Multipliers:
         - catch rate
         - catch speed 
         - 
     - Baits -> real stuff
       - No bait
       - Basic bait
       - Jumbo bait
         - Slight boost in size and rarity
       - Lucky bait
         - Decent boost in rarity
       - Scented bait
         - Slight boost in rarity and faster catch speed. Lower chance of nothing
       - Golden bait
         - Boost rarity, even bigger boost for "Chroma" or "shiny" variants
       - Treasure bait
         - Major increase in getting items 
       - Chum bait
         - Almost instant bite time and dramatically lowers chance of catching nothing
       - Weighted Bait
         - Increase in size of fish caught
       - Mythical bait
         - Dramatic increase in getting rare fishes
       - Different levels for each bait -> effect multiplier
 - Database? -> keep it simple and use local sqlite
 - Unfortunately it looks like I need to do art for this one
 - 


# NOTES

Column "status" of users DB is going to be a object that contains information of where the user is traveling, where they are right now (or headed), and when they will get there. Specific details TBD. 

Scratch that I'm going to put everything into a JSON blob bcs I don't have to query other details really. 

Make sure to copy blocks when using them from presets (!!)