mindmap
  PlantsVsMiku's
    Gameplay
      Plaatsen van verdediging
      Golven vijanden
      Zonne-energie verzamelen
    Inspiratie
      Plants vs. Zombies
      Anime/Miku Elementen
    Personages
      Planten
      Miku's & varianten
      Vijanden (bijv. zombies, robots)
    Levelontwerp
      Verschillende thema's
      Moeilijkheidsgraden
      Speciale uitdagingen
    Strategieën
      Optimale opstelling
      Gebruik specials
      Resource management
    Items/Upgrades
      Power-ups
      Nieuwe planten/Miku's vrijspelen
      Verbeteringen kopen

flowchart TD

Start([Gebruiker start sessie])

Start -->|Initieer| Auth["Authenticatie API"]
Auth -->|Token/ID| MainMenu["Laad hoofdmenu"]

MainMenu -->|Kies Level| LevelAPI["GET /level/{id}"]
LevelAPI -->|Levelgegevens| ClientGameplay["Client toont level, thema, uitdagingen"]

ClientGameplay -->|Speler plaatst verdediging| PlaceDefAPI["POST /defense"]
ClientGameplay -->|Speler gebruikt special| SpecialAPI["POST /specials"]
ClientGameplay -->|Verzamel zonne-energie| SunAPI["POST /sun/collect"]

ClientGameplay -->|Start golf vijanden| WavesAPI["GET /waves/{level}"]
WavesAPI --> ClientGameplay

ClientGameplay -->|Gebruik power-up| PowerUpAPI["POST /powerup"]
ClientGameplay -->|Koop verbeteringen| ShopAPI["POST /shop/buy"]
ClientGameplay -->|Unlock nieuwe planten/Miku's| UnlockAPI["POST /unlock"]

ClientGameplay -->|Einde level| EndLevelAPI["POST /level/end"]
EndLevelAPI -->|Sla voortgang op| SaveAPI["POST /progress"]

SaveAPI --> MainMenu