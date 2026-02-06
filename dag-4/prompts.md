### opdracht 1

can you make the Quit button close the tab the game is on

it only closes the game tab but not the main menu tab thats the one that should close as wel

can you make the options button open a modal with css and javascript so there does not have to be a seprate page for it

can you make the mp3 file in the mp3 file loop in the main menuand connect the settings to it

can you make it so the game opens on the same tab as the main menu


You are helping me implement core gameplay mechanics inspired by Plants vs. Zombies,
but with custom enemies (Miku-themed zombies).

Game overview:

The game uses a 5x9 grass grid (5 rows, 9 columns), similar to Plants vs. Zombies.
Plants are placed on grid tiles by the player.
Enemies are "Miku Zombies" that spawn on the right side and move left toward the house.
The game is 2D, grid-based, and lane-based.
-there is already a img on the game.html that will be the ground you just have to put everything one/around it.
Grid & planting system:

Represent the lawn as a 2D grid (rows x columns).
Each tile can hold only one plant.
Allow the player to select a plant and click a grid tile to place it.
Prevent planting if:
The tile is already occupied
The tile is outside the grid
The player lacks enough sun/energy
Plants have:
health
cost
attack damage
attack cooldown
row-based attacks (only affect enemies in the same row)
Miku zombie system:

Miku zombies spawn at the rightmost column.
Each zombie spawns in a random row (lane).
Zombie data (sprites, stats, types) already exists and should be reused.
Each Miku zombie has:
health
speed
attack damage
attack cooldown
sprite/animation reference
Zombies move left continuously unless blocked by a plant.
When a zombie reaches a plant:
It stops moving
Attacks the plant until it is destroyed
When a plant’s health reaches zero:
Remove the plant from the grid
The zombie resumes moving
When a zombie reaches the left edge of the grid:
Trigger game over
Spawning & waves:

Spawn Miku zombies using a timer or wave system.
Support multiple zombie types with different stats.
Increase difficulty over time by:
Faster spawn rates
Stronger Miku zombies
Multiple zombies per lane
Game loop responsibilities:

Update plant attacks and projectiles
Spawn Miku zombies
Move zombies
Handle collisions between:
projectiles and zombies
zombies and plants
Remove dead plants, zombies, and projectiles
Code quality:

Use clean, modular code
Separate game logic from rendering
Use classes or components for:
Grid
Plant
MikuZombie
Projectile
// Define the MikuZombie class using existing zombie data
// Handle grid cell detection from mouse clicks
// Spawn a random Miku zombie every X seconds
// Handle plant vs Miku zombie combat



can you make suns fall from above every 5 seconds and make a sunflower also the grid is to big a part of the right side is the house and then you have the lawn and then you have the street where the zombies/mikus come from


Implement a Plants vs Zombies–accurate wave and win system with a fixed total number of enemies.

Core rules:

The level has a MAX number of Miku zombies.
Once all zombies are spawned AND all spawned zombies are defeated, the player wins.
Zombies spawn in waves, not infinitely.
Zombie pool:

Define a totalZombieCount for the level (e.g. 30–50).
Keep track of:
zombiesSpawned
zombiesAlive
Do NOT spawn more zombies once zombiesSpawned reaches totalZombieCount.
Wave structure (PvZ-style):

Divide the level into multiple waves.
Example:
Early waves: small, slow spawn rate
Mid waves: more frequent spawns
Final wave: large burst of zombies ("Final Wave")
Wave behavior:

Each wave has:
zombieCount
spawnInterval
allowed zombie types
Zombies spawn one at a time during a wave until that wave’s quota is met.
After a wave finishes spawning:
Pause briefly before the next wave
The final wave should be clearly marked (e.g. “Final Wave!”).
Spawning logic:

Zombies spawn at the rightmost column.
Spawn lane (row) is random.
Spawn only if zombiesSpawned < totalZombieCount.
Increment zombiesSpawned and zombiesAlive on spawn.
Zombie death logic:

When a Miku zombie dies:
Decrement zombiesAlive
If:
zombiesSpawned == totalZombieCount
AND zombiesAlive == 0
→ trigger WIN condition.
Win & lose conditions:

LOSE if any zombie reaches the left edge.
WIN if all zombies are defeated after the final wave.
Difficulty scaling:

Early waves: basic Miku zombies only
Later waves:
Faster Miku zombies
Tankier Miku zombies
Final wave:
Highest spawn density
Multiple zombie types allowed
Code structure suggestions:

WaveManager class or system
ZombieSpawner with spawn timers
LevelConfig object defining:
totalZombieCount
wave definitions
// Define wave data structure
// Start next wave when previous wave finished spawning
// Trigger "Final Wave" warning
// Check win condition when a zombie dies

just Add a visible "Final Wave!" announcement at the start of final wave.



Create a PvZ-style screen layout with fixed horizontal proportions.

Screen layout rules:

The total screen width is divided into four horizontal sections.
Layout is left-to-right.
Section 1: Left black margin

Width: ~18.4% of total screen width
Purpose: off-screen buffer / decorative background
Color: black
Section 2: Main playfield (green lawn)

Width: ~51.3% of total screen width
Purpose: playable area
Background color: green
Contains a 5x9 grid (5 rows, 9 columns)
Grid cells should scale to fit this area exactly
Section 3: Thin black divider

Width: ~0.6% of total screen width
Purpose: visual separation
Color: black
Section 4: Right UI panel

Width: ~29.6% of total screen width
Purpose:
Seed packets
Sun counter
Wave progress indicator
Background color: gray
Implementation requirements:

Layout must scale correctly with screen resizing.
Use percentage-based or relative sizing (not hardcoded pixels).
Ensure the playfield maintains correct aspect ratio for grid alignment.
Keep game logic independent from rendering dimensions.
// Calculate grid cell width and height from playfield size
// Center the 5x9 grid inside the green area
// Prevent UI elements from overlapping the playfield

now add a starte button so you dont start the moment you hit play


the game does not stared when i clike the button and i cant see my plants anymore

i have added gothmiku lowpolymiku normalmiku retardedmiku and toastermiku to the spritesheets file so i want them to be the zombies and use the spritesheets as animation for them keep the health and damage the same for now

the sprites are to big can you make them the size of one square on the field

they are the same size still and they now move slower

THEY ARE NOT THE SAME SIZE AS A CELL THEY ARE STILL THE SAME HEIGHT TRY IT ONE MORE TIME LESE I AM GOING TO ASK YOU WHAT THE SIZE IS OF ONE CELL

what is the size of one cell in pixels

can you make the sprites a bit higher in there box as i can only see there head

i amde one a img instead and for now deleted the rest can you use the img for the zombies instead

its not a spritesheets its just a img so make sure the code is made for 1 img not a spritesheet

can you make the suns bigger and make the suns disapear after 3 seconds after they land on the ground

i have added all the miku versions can you add them

i have added img for the plants can you replace the boxes with them

he images re correct but the game wont run

Uncaught InvalidStateError: Failed to execute 'drawImage' on 'CanvasRenderingContext2D': The HTMLImageElement provided is in the 'broken' state.

now tje game works again but now the mikus dont have a img can you give them there imgs back

the last row is off screen can you fix that

i have a img for the shooter its a leek can you add that

no its called leek-projectile

you made the shooter the leek i need it to shoot leeks

now revert the shooter back to leeku

now when you beat a level you go on to the next wich should be a bit harder and when you compleet the 5 levels you recieve a winning screen wih a fun trophy that i will give you later