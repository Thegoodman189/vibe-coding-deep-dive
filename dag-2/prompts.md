# mermaid prompts
    # prompt 1
    Maak voor mij een ERD voor een biblotheek

    # prompt 2
    Maak voor mij een sequence diagram for een REST API van de biblotheek

    # prompt 3
    Maak voor mij een USE-case diagram for gebruikers van een biblotheek app

    # prompt 4
    Maak voor mij een mindmap voor een horror game

# cursor
    # prompt 1
    charts van mermaid + maak voor mij een REST API voor een bibliotheek

    # prompt 2  
    - wat doet deze code?
    - hoe werken de belangrijkste functies?
    - waar zitten mogelijke fouten of verbeteringen?

    # prompt 3
    Ik heb een bestaande REST API in deze codebase. Analyseer de huidige endpoints, request/response structs, validatie en error handling.

    Taak 1 – API-specificatie:
    - Schrijf een volledige API-specificatie in OpenAPI 3.0 (YAML).
    - Beschrijf alle endpoints, HTTP-methodes, query/path/body parameters.
    - Definieer request- en response-schema’s.
    - Neem standaard HTTP statuscodes op (200, 201, 400, 401, 403, 404, 422, 500).
    - Documenteer foutresponses met duidelijke error-objecten.
    - Gebruik consistente naming en realistische voorbeelden.

    Taak 2 – API integration tests:
    - Genereer integration tests op basis van de OpenAPI-specificatie.
    - Gebruik het bestaande testframework in deze repo (volg de bestaande teststijl).
    - Test zowel succes- als faalscenario’s (validatie, auth, edge cases).
    - Zorg dat tests onafhankelijk en herhaalbaar zijn.
    - Gebruik duidelijke testnamen en comments waar nodig.

    Output:
    1. Een `openapi.yaml` bestand.
    2. Integratietests per endpoint, gestructureerd per resource.
    3. Geen pseudocode — alleen echte, uitvoerbare code.

    Belangrijk:
    - Maak geen aannames die niet uit de code blijken.
    - Als iets onduidelijk is, laat een TODO-comment achter.
    - Houd alles production-ready.