# vibe-coding-deep-dive

Een LLM is een taalmodel dat leert om het volgende woord te voorspellen op basis van grote hoeveelheden tekst uit verschillende bronnen. Tijdens de training wordt een woord weggehaald en moet het model dit voorspellen. Als dit fout gaat, worden de parameters aangepast zodat het model dichter bij het juiste antwoord komt. Dit proces wordt herhaald met enorme hoeveelheden tekst.

Daarna volgt een tweede trainingsfase: Reinforcement Learning from Human Feedback. Hierbij beantwoorden modellen vragen die door mensen zijn opgesteld. Mensen beoordelen vervolgens of de antwoorden goed zijn, waarna het model verder wordt bijgestuurd. Waarom dit zo goed werkt, is niet volledig duidelijk.

Een mogelijk risico voor developers is dat vooral beginnende programmeurs te afhankelijk worden van deze modellen. Hierdoor kan hun leergroei afnemen, omdat ze code gebruiken zonder echt te begrijpen hoe die werkt, wat kan leiden tot fouten die ze zelf niet kunnen oplossen.