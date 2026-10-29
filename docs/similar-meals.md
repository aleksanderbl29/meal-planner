# Lignende retter

Når du tilføjer eller redigerer et måltid, vises gemte måltider med samme
grundnavn under navnefeltet, inklusive deres uge og år. Forslagene ændrer intet:
hver post beholder sit id, navn, dato og spisestatus. Ingen sammenlægning,
datamigrering eller eksterne AI-tjenester er nødvendige.

Matchningen er deterministisk: Unicode normaliseres (NFC), store/små bogstaver
ignoreres, tegnsætning bliver til mellemrum, og gentagne mellemrum samles.
Grundnavnet er teksten før det første selvstændige »med«. Hele navnet bruges,
hvis »med« mangler. Tomme grundnavne og grundnavne under to tegn matches ikke.

- »Wok med kylling«, »wok med tofu« og »Wok« matcher.
- »Grøn wok med tofu« matcher ikke »Wok med kylling«.
- »Pasta med tofu« matcher ikke »Wok med tofu«: fælles ingredienser er ikke nok.
- Stavefejl, synonymer og omvendt ordstilling matches ikke.

Reglen er bevidst enkel og kan foreslå forskellige retter med samme grundnavn,
fx »Salat med tun« og »Salat med kartofler«. Derfor er resultatet kun forslag.
Redigering udelader den aktuelle post, men viser andre forekomster, også med
præcis samme navn, så historikken fortsat er synlig.
