# Fishtopia
An interactive Slack bot fishing game 

# How to play

Use the /f-start command to get started!

Some useful commands to know
 - /f-profile - View your profile
 - /f-boat - View your boats
 - /f-equipment - View your tools and baits
 - /f-shop - Purchase tools/baits/boats
 - /f-inventory - View the results of your recent fishing trip
 - /f-fish - Actually go fishing! 
 - /f-use - Open chests you get from fishing!


Note: This is just v1 of the game so there may be some balancing issues. I also missed out on some minor details (ex. completion stats, boat addons, tool/bait durability) since I'm heading off to uni and the deadline is coming up! Also I know it says that I was planning to do artwork (trust me i was) in the TODO but at the end I just couldn't get anything to my liking. So no artwork unfortunately. Full AI usage info in Notes section.

# How to use

All you have to do is install dependencies using `npm install` and run using `npm start`. Make sure you have a `.env` setup as shown below.
```
APP_ID=XXXXXXXX
SLACK_CLIENT_ID=XXXXXX
SLACK_CLIENT_SECRET=XXXXXXXXXXXXXXXXX
SLACK_SIGNING_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_APP_TOKEN=xapp-XXXXXXXXXXXXXXXXXXXXXXXXX
SLACK_BOT_TOKEN=XXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

# TODO
 - [x] Create bot application and add to channel
   - [x] Create slash commands
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
     - [x] Start page
       - [x] Tool select
       - [x] Bait select
       - [x] Location select
       - [x] Start functionality
       - [x] Check for no boat, no tools, or no baits
     - [x] Travel page
       - [x] Layout
       - [x] Show basic info
     - [x] Prefishing apge
       - [x] Show basic info
       - [x] Option to cast
     - [x] Fishing page
       - [x] Results layout
       - [x] Prefish layout
       - [x] Handle fishing random logic
         - [x] Value calculation
       - [x] Full storage check
       - [x] End trip functionality
   - [ ] /f-shop
     - [x] Paginated layout
     - [x] Functionality
       - [x] User pagination controls
       - [x] Buying option
       - [ ] Bulk buying
       - [x] Search option?
   <!-- - [ ] /f-market
     - [ ] UI layout
     - [ ] Functionality
       - [ ] Paginated list of active offers
       - [ ] Creating offers
       - [ ] Managing offers -->
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
   - [x] /f-inventory
     - [x] Layout
     - [x] Specific type selling functionality
     - [x] Sell all functionality
 - [x] Tool effects
   - [x] Figure out what tool effects theres going to eb -> its just going to be the same as the boats pretty much
   - [ ] Implement in /f-fish
 - [ ] some way for me to edit my own data? better than the awkward functions i have right now?
 - [ ] bugs + fixes
   - [x] Trying to select a tool in profile doesn't work after you select it the second time? -> forgot to set action id lol whoops
   - [ ] Didn't really implement checks to ensure that the right user is interacting
   - [x] Metadata not updating? -> weirdly disappeared will monitor. Marking as fixed for now but will monitor. 
   - [x] Weird message timestamping issue -> new messages will change their timestamps to become very, very old. Fixed, this was a weird typo
   - [x] wow i even forgot to store balance information
     - [x] issue: performing an action (ex. repairing a boat) doesn't update the original message -> possible solution: refresh button with reminders to do so.  Need this like like every command with direct action comamnds
     - [x] /equipment
     - [x] /boat
   - [x] I missed metadata in a lot of plaecs -> double check 
   - [x] markdown not working for /f-shop command? apparently it decided to only take single *
   - [ ] Just realized different button styles exist -> put in later
   - [x] Tool, bait, and boat IDs are not transferred between traveling and fishing states
   - [x] Setting fishes as default doesn't change the one that is currently default
   - [x] Going to set travel time to be 1s for now - make sure to remove!!
   - [x] Items! Big thing i forgot about.  
   - [ ] Project clean up
     - [x] Add README instructions
     - [x] Clean up starting equipment
     - [x] Full testing / bugs scan
 - [ ] Revisit #1 - hoping to clean things up a little more
   - [x] Fish completion stats
   - [x] Overall usage stats
     - [x] Total fish caught/sold/value
     - [x] Total amt earned -> this should be where the fish selling is
       - [x] Total shop purchases
     - [x] Commands used? -> have to put it into every file
       - [x] Boat
       - [x] Equipment
       - [x] Fish
       - [x] inventory
       - [x] Ping
       - [x] Profile
       - [x] Profile
       - [x] Shop
       - [x] Use
     - [x] Total xp -> just keep track when adding
     - [x] Total boats/equipment/baits used - scrapped
   - [x] XP + leveling
   - [x] Individual tool/bait/boat usage stats
 - [ ] Boat addons
   - [x] Modify layout
     - [x] Extra message block to handle upgrades only
     - [x] Populate layout
   - [x] Functionality handlers
     - [x] /f-fish command
       - [x] Upgraded engine
       - [x] Autopilot
       - [x] Radar
       - [x] Extra bucket
       - [x] /f-boat command
 - [x] Durability functionality
   - [x] tools
   - [x] baits
   - [x] Low durability warning somewhere
 - [x] Fix rounding issues -> mostly with the usage stats
 - [ ] Use item command improvements
   - [ ] Show probs after selecting type
   - [x] Add a better prob distribution
 - [x] Final checks (again)
   - [x] /f-profile
   - [x] /f-boat
   - [x] /f-equipment
   - [x] /f-use
   - [x] /f-shop
   - [x] /f-inventory
   - [x] /f-fish



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
   - /inventory -> see what actual fish you have bruh i forgot about this
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
     - Main front layout
       - Goals
         - Easy for user to search?
         - Allow users to search for specific items?
         - Easy for users to manage existing offers and post new ones?
         - Multi-paginated?
         - Shop should primarily be for getting items (chests and stuff)?
       - Title (obviously)
       - Carousel (10 items) -> by default show random 10 items
       - Pagination options (next, prev button with text somewhere showing page number)
       - Divider and then some search options
         - Static select different itesm for offered and requested fields 
         - Option to view only offers that the user can fulfill
     - Sadge market is getting scrapped
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
   - Use /inventory to see what fish you have and manage them
       - Condensed list of all fishes (shows variants separately)
       - Option to sell x amount of a type of fish (maybe a select menu (select a type) and an input area (amt))
       - Layout
         - Header
         - Main body -> list of fishes. Full list
         - Sell type static select -> including all fish types wiht actual amoutns + sell all option
         - Sell amt -> input text, ,optional. Defaults to 1
         - Perform action button
         - Sell results layout
           - Simple title, text. Don't think there is going to be a confirmation for this one
   - /f-use to use an item
     - You have include item name (static select)
     - Press and then updates message to show results
 - Additional gameplay features
   - Fish
     - Rarity tags: Common, Uncommon, Rare, Epic, Legendary
     - Variants for each type (super rare "Chroma", rare "Shiny")
     - Data included: name, rarity, xp, maps (with catch probability weighting), type (regular, chroma, or shiny), weight, sell value
   - Items?
     - Will likely be a separate percentage from fish
     - mix of common ish to rare ish items
     - Maybe usable items? (boxes?? gamblign???)
     - How to put this into current data????
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
 - How items are going to work
   - They are going to be found in inventory
   - Need to update to make sure they work in /f-fish command as well as /f-inventory
   - I alreayd have an item chance thing and multipliers so that should be easy to implement
     - Should be on top of the catch (which is capped at 6)
     - You can only get 1 item at a time 
     - Data format
       - Coins range -> coins will always be given
       - Probs for bait
         - List of probs for each tier
       - Probs for no item
       - Probs for tool
         - List of probs for each tier
   - Need a /use command to use item
   - XP calculation?
     - Should be only through fishing
     - Just different xp at different rarity catches i guess
       - Common - 5
       - Uncommon - 12
       - Rare - 30
       - Epic - 70
       - Legendary - 180
   - For total command used, I may have to just the data into every command unfortunately. The main handler doesn't make it easy to use. 
 - Individual tool usage stats
   - Boat - stats.trips, stats.distance, stats.fish
   - Bait/tool - usage_stats.trips, usage_stats.fish_caught, usage_stats.fish_weight, usage_stats.fish_value
 - Boat addons
   - Upgraded Engine - faster speed to destination. I guess 10% increases in speed.
   - Extra Bucket - 10 extra slots for boat. 
   - Autopilot System - fasting catching speed
   - Specialized Radar - lower catch nothing change
   - You can get as many of each as you want. But certain ones don't stack:
     - Specialized radar 
     - Autopilot
     - Nevermind. You cannot get as much as you want. It'll just update the list when you use the upgrading menu.
   - Handling in /f-fish command
     - Checks for kcast and pre fish
     - For slots? Uh...I guess we just adjust the check
     - Everything else should be super easy
 - Durability for baits/tools
   - Performance decreases as durability gets lower
     - Should really be only noticable at the lower levels - should probably do like all normal until 30% - should be linear changes from there on 
     - Should reduce basically all the effects
   - Should be a pretty slow effect
     - Maybe like .5% per use? 200 uses


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

Catch time should be limited to up to 15 seconds -> 6-8 seconds now

Used AI to brainstorm effects for each tool

I don't really want this to stretch to far. honestly, adding items and then market will probably be the last few things. 

Market is getting scrapped. :(

Used AI to help brainstorm balanced items (in particular the chests)

