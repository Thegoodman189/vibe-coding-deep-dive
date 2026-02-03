Een ERD voor een biblotheek
erDiagram
    direction TB
    BOEK ||--o{ UITLENING : "wordt uitgeleend met"
    BOEK }|--|{ AUTEUR : "is geschreven door"
    LID ||--o{ UITLENING : "leent"
    LID ||--o{ BOETE : "kan boete hebben"

    BOEK {
        int boek_ID PK "Uniek boeknummer"
        string titel
        int jaar
        string genre
        int exemplaren "Aantal beschikbare exemplaren"
    }
    AUTEUR {
        int auteur_ID PK
        string naam
        date geboortedatum
    }
    LID {
        int lid_ID PK
        string naam
        string adres
        date geboortedatum
        string email
    }
    UITLENING {
        int uitlening_ID PK
        date uitleendatum
        date terugbrengdatum
        int boek_ID FK
        int lid_ID FK
    }
    BOETE {
        int boete_ID PK
        float bedrag
        string reden
        int lid_ID FK
        date betaaldatum
    }


Een sequence diagram for een REST API van de biblotheek
flowchart TD
    subgraph Gebruiker
        Lid("Lid")
        Medewerker("Bibliotheekmedewerker")
    end
    Systeem("Bibliotheek Systeem")
    
    Zoeken["Boek zoeken"]
    Lenen["Boek lenen"]
    Inleveren["Boek inleveren"]
    Verlengen["Lening verlengen"]
    BoeteBetalen["Boete betalen"]
    Inschrijven["Lid worden"]
    Ledenbeheer["Leden beheren"]
    Leningbeheer["Leningen beheren"]
    
    Lid --> Zoeken
    Lid --> Lenen
    Lid --> Inleveren
    Lid --> Verlengen
    Lid --> BoeteBetalen
    Lid --> Inschrijven

    Medewerker --> Ledenbeheer
    Medewerker --> Leningbeheer

    Zoeken --> Systeem
    Lenen --> Systeem
    Inleveren --> Systeem
    Verlengen --> Systeem
    BoeteBetalen --> Systeem
    Inschrijven --> Systeem
    Ledenbeheer --> Systeem
    Leningbeheer --> Systeem


Een USE-case diagram for gebruikers van een biblotheek app
    flowchart LR
    %% Bovenste groepering
    subgraph Gebruiker
        Lid
        Bibliotheekmedewerker
    end

    %% Rollen naar acties (use cases)
    Lid --> Zoek[Boek zoeken]
    Lid --> Lenen[Boek lenen]
    Lid --> Inleveren[Boek inleveren]
    Lid --> Verlengen[Lening verlengen]
    Lid --> Boete[Boete betalen]
    Lid --> NieuwLid[Lid worden]

    Bibliotheekmedewerker --> BeheerLeden[Leden beheren]
    Bibliotheekmedewerker --> BeheerLeningen[Leningen beheren]

    %% Acties naar centrale systeem
    Zoek --> Systeem[Bibliotheek Systeem]
    Lenen --> Systeem
    Inleveren --> Systeem
    Verlengen --> Systeem
    Boete --> Systeem
    NieuwLid --> Systeem
    BeheerLeden --> Systeem
    BeheerLeningen --> Systeem

mindmap voor een horror game
mindmap
  Horror Game
    Verhaal
      Bovennatuurlijk
      Psychologische horror
      Mysterie
    Omgevingen
      Verlaten huis
      Donker bos
      Ondergronds lab
      Verlaten ziekenhuis
    Vijanden
      Geesten
      Demonen
      Mutanten
      "Onzichtbaar monster"
    Gameplay
      Overleven
      Stealth
      Puzzels oplossen
      Vluchten
      Multiple endings
    Geluid & Sfeer
      Angstaanjagende muziek
      Plotselinge geluidseffecten
      Donkere verlichting
      Fluisteringen
    Items
      Sleutels
      Zaklamp
      Batterijen
      Dagboekpagina's
      Eerste hulp