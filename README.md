# Fishtopia
An interactive Slack bot fishing game 

# TODO
 - [x] Create bot application and add to channel
   - [ ] Create slash commands
 - [x] Setup database
   - [x] Database schema
 - [x] Preset data
   - [x] Fish 
     - [ ] Fish artwork
     - [x] Balance fishes
     - [x] Fish variants
   - [x] Equipment (tools + baits)
     - [ ] Item artwork
     - [x] Balance items
   - [x] Maps
     - [ ] Maps artwork
   - [x] Boats (hoping for at least like 8)
     - [ ] Boat artwork
     - [x] Balance boats
 - [ ] Commands 
   - [ ] /f-fish
     - [x] Layout
     - [ ] Start page
       - [x] Tool select
       - [x] Bait select
       - [x] Location select
       - [x] Start functionality
       - [x] Check for no boat, no tools, or no baits
     - [ ] Travel page
       - [x] Layout
       - [x] Show basic info
     - [ ] Prefishing apge
       - [x] Show basic info
       - [x] Option to cast
     - [ ] Fishing page
   - [ ] /f-shop
     - [x] Paginated layout
     - [x] Functionality
       - [x] User pagination controls
       - [x] Buying option
       - [ ] Bulk buying
       - [x] Search option?
   - [ ] /f-market
   - [x] /f-start
   - [x] /f-equipment
     - [x] UI Layout -> similar to boat comamnd layout
     - [x] Functionality
       - [x] User selecting + controls
       - [x] Selling
       - [x] Repair
       - [x] Check for empty tool lists
   - [x] /f-boat
     - [x] UI -> current boat with buttons to move around
     - [x] Functionality
       - [x] User selecting + controls
       - [x] Selling
       - [x] Repair
       - [x] Check for empty boat lists
   - [x] /f-profile
     - [x] Overview section
     - [x] baits section
       - [x] bait selecting functionality
     - [x] Tools section
       - [x] tool selecting functionality
     - [x] Completion stats section
     - [x] usage stats sectio
   - [ ] an overall command message catch?
 - [ ] Tool effects
   - [x] Figure out what tool effects theres going to eb -> its just going to be the same as the boats pretty much
   - [ ] Implement in /f-fish
 - [ ] some way for me to edit my own data?
 - [ ] bugs + fixes
   - [x] Trying to select a tool in profile doesn't work after you select it the second time? -> forgot to set action id lol whoops
   - [ ] Didn't really implement checks to ensure that the right user is interacting
   - [x] Metadata not updating? -> weirdly disappeared will monitor. Marking as fixed for now but will monitor. 
   - [x] Weird message timestamping issue -> new messages will change their timestamps to become very, very old. Fixed, this was a weird typo
   - [x] wow i even forgot to store balance information
   - [ ] issue: performing an action (ex. repairing a boat) doesn't update the original message -> possible solution: refresh button with reminders to do so.  Need this like like every command with direct action comamnds
     - [x] /equipment
     - [x] /boat
   - [ ] I missed metadata in a lot of plaecs -> double check 
   - [x] markdown not working for /f-shop command? apparently it decided to only take single *
   - [ ] Just realized different button styles exist -> put in later
   - [ ] Tool, bait, and boat IDs are not transferred between traveling and fishing states



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
     - Layout
       - First screen -> select map and equipment to bring. Shows your current default boat
         - Show brief intro
         - Cards to show tool, bait, and boat info before they go in? Switching to carousel layout
         - v2 layout -> also show selected location information
           - Show sturdiness, description, fish
           - Add warning for recommended sturdiness
       - Second screen -> show actively moving to location (and ETA)
         - Show location destination
         - Show ETA
         - probably the simplest of the fishing screens
       - Third screen -> multiple buttons to pick a spot to fish
         - Layout -> compressed view showing tool, bait, boat
           - 
         - Pick a spot to fish
         - This should realistically only show up in the beginning
       - Fourth screen -> Showing fishing and then after delay, show catch 
         - Options: Release and Catch Again, Keep and Catch Again
           - Release if they don't like fish so no space wasted 
       - Fifth screen -> traveling back with catch results
   - Use /shop to buy equipment 
     - Boat, tools, baits. Prices in both coins and gold
     - Some items are only available in gold (rare stuff)
     - Layout
       - Title
       - Show balance
       - Boat info here
       - Show page info
       - Buttons for moving around / options
     - Layout v2
       - Title
       - Show balance
       - Item information maybe as carousel
       - Action options
       - Select different shop page -> there are multiple pages for each type
       - search bar?
           - 
   - Use /market to put offers and trade things with other people
   - Use /boat to select main boat, see other boats 
     - Actions - show confirmation menu
       - Sell -> sell at 70% of buy price * the durability
       - Repair -> improve durability of boat by 25% using 8% of the buy price
   - Use /equpment to check out your tools, baits, and other equipment
     - Options to upgrade, sell, repair tools
       - Upgrading is not going be done right now -> need to figure out how its actually gonna work
       - Selling is going to be the same as boats ->, 70% of buy price * durability
       - Repair is going to be the same as boats -> 25% for 8% of the buy price
    - List both tools and baits? Probably won't get too disorganized...?
   - Use /profile to get an overview of your stuff
     - Multi-paginated with tabs on boat, tools, stats
       - Starting profile page with net worth + start date + if the user is currently fishing right now
       - Completion page -> shows completion stats (ex. what kinds of fish caught)
       - Boats page showing list of owned boats + currently equipped boat stats + addons
       - Equipment -> tools and baits -> can selected list baits or tools and view full list
       - Stats -> other usage stats (ex. times fished)
     - Ability to search up other users
   - Fish species with rarity
 - Additional gameplay features
   - Fish
     - Rarity tags: Common, Uncommon, Rare, Epic, Legendary
     - Variants for each type (super rare "Chroma", rare "Shiny")
     - Data included: name, rarity, xp, maps (with catch probability weighting), type (regular, chroma, or shiny), weight, sell value
   - Items?
     - Will likely be a separate percentage from fish
     - mix of common ish to rare ish items
     - Maybe usable items? (boxes?? gamblign???)
     - How to put this into current data?
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
       - You can enter any water you want but if you're below the durability minimum for the map you may capsize. If you are near the durability minimum, there is a chance you're boat gets damaged NOTE: RENAMED TO STURDINESS
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
     - Tiers -> same as boat tiers
     - Tools
       - Hand -> no effects
       - Pole -> 
       - Spear
       - Fishing Rod
       - Net
       - Speargun
       - Electric Reel Rig
       - Harpoon gun
       - More special tools TBD
       - Different levels -> increased durability or effect
       - Multipliers:
         - catch speed -> catch_speed
         - catch nothing rate -> catch_nothing
         - catch count -> catch_count
         - weight multiplier -> weight_multiplier
         - xp multiplier -> xp_multiplier
         - multiplier for each rarity (common, uncommon, rare, epic, legendary) -> x_multipluer
         - Variant multiplier (shiny or chroma) -> x_multiplier
         - Item multiplier -> item_multiplier
         - Pretty much all the same as the bait ones 
       - Gradually lose durability -> can repair but otherwise breaks
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
       - List of multipliers
         - catch speed (increase by range amount so [1, 2] decreases by 1-2 seconds) catch_speed
         - catching nothing (reduces it by the percentage) catch_nothing
         - catch count bonus (range increase by [x, y]) catch_count 
         - weight multiplier (multiplies) weight
         - multipliers for every rarity (all percentage increases)
           - common_multiplier common_multi
           - uncommon_multiplier uncommon_multi
           - rare_multiplier rare_multi
           - epic_multiplier epic_multi
           - legendary_multiplier legendary_multi
         - shiny_multiplier (added percentage) shiny_multi
         - chroma_multiplier (added percentage) chroma_multi
         - item_multiplier -> higher chance of getting an item when fishing
         - xp_multiplier -> (multiplies by percentage)
         - All of the effects are on top of the basic boat's effects
           - If there is going to be?
       - Baits can be reused to a certain point and then they self destruct. No chance of like repairing or anything. 
 - Database? -> keep it simple and use local sqlite
 - Unfortunately it looks like I need to do art for this one
 - 


# NOTES

Column "status" of users DB is going to be a object that contains information of where the user is traveling, where they are right now (or headed), and when they will get there. Specific details TBD. 

Scratch that I'm going to put everything into a JSON blob bcs I don't have to query other details really. 

Make sure to copy blocks when using them from presets (!!)

Used AI for generating fishes data (there's a lot of them lol)
Used AI for list of possible baits / tools / maps (though the actual stats were created by me)
 - bruh forgot I had some idaes already for baits. Redoing. 
 - Also a little help with actually balancing my game

Not going to limit baits to maps. For now. 
Also not bait tiers because it's a pretty mixed bag of level

Payload data is just really going to be holding userId data because otherwise action values got it

XP processing (checking levels and stuff) is going to be done whenever the user recieves XP

Max carousel size is 10. I guess I have to redo whatever is happening with the shop layout. 

How did i not come up with this helper function based command population earlier

Catch time should be limited to up to 15 seconds

Used AI to brainstorm effects for each tool