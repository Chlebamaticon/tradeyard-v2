# PRACA INŻYNIERSKA

## Platforma Pośrednicząca wymianie dóbr, usług traktując kryptowaluty jako środek płatniczy

#### Jakub Chlebowicz, numer albumut s16506

#### Infomartyka, studia internetowe

#### Programowanie aplikacji biznesowych

## 1. Temat pracy

### 1.1. Cel pracy

Celem pracy opisywanej w Tym dokumencie jest stworzenie platformy pośredniczącej wymianie dóbr pomiędzy dwoma stronami - kupującym i sprzedającym - gdzie płatność ma odbywać się za pomocą kryptowalut.

### 1.2. Motywaja

Opisywana przeze mnie praca jest adresowana do dwóch grup uzytkownikow;

- Usługodawców, chętnych zaoferować swoje usługi, czy tez produkty na nowej platformie, dzieki której istnieje mozliwość dotarcia do nowej grupy odbiorczej,
- Konsumentów, poszukujących usług, oraz towarów, posiadających ekspozycje na kryptowaluty którymi są w stanie opłacić wcześniej wymienione dobra,

Obydwie te grupy, jeżeli zdecydują się na wykorzystanie swoich kryptowalut w celu zrealizowania jakiegoś zakupu, są zmuszone przelać te fundusze na CEX, lub mechanizm off-ramp w celu przewalutowania kryptowaluty na walute FIAT. Każda taka wymiania wiąże się również z pokryciem prowizji, oraz bardzo często może zostać potraktowana jako realizowanie zysków kapitałowych, z których należy rozliczyć się z urzędem skarbowym w danym regionie.

W celu próby optymalizacji i ułatwieniu procesu nabywania dóbr za pomocą kryptowalut, powstaje opisywana w Tej pracy platforma, które ma na celu umożliwienie dokonywania płatności bezpośrednio za pomocą - na początku - wybranych kryptowalut, z przyszła perspektywą na rozszerzenie wsparcia dla innych sieci blockchain.

### 1.3. Zakres pracy

W celu osiągnięcia wyżej wymienionego celu, oraz spełnienia motywacji, w zakresie Tej pracy leży zaplanowanie, tworzenie, oraz implementacja platformy która będzie zgodna z opisem wymagań funkcjonalnych, oraz niefunkcjonalnych zawartych w Tym dokumencie, realizujących wartość praktyczną projektu którą następnie zaprezentuje. Omówienie decyzji podjętych w zakresie bezpieczeństwa, architektury systemu, wykorzystanych technologi oraz narzędzi, wraz z uzasadnieniem ich obecności. Zaprojektowany interfejs użytkownika, a następnie zaimplementowany. Spis potencjalnych usprawnień systemu, jak i zdefiniowanie słownika terminów użytych w Tej pracy.

## 2. Zastosowane narzędzia oraz technologie

### 2.1. Języki programowania

W trakcie realizacji projektu posłużyłem się dwoma językami programowania, które umożliwiły spełnienie wszystich wymagań funkcjonalnych projektu. Tymi językami są;

- JavaScript (TypeScript),
- Solidity,

#### 2.1.1 JavaScript

Język JavaScript, umożliwił mi stworzenie dwóch aplikacji składających sie na cała platformę, czyli aplikacje webową - odpowiadającą za warstwe wizualną czyli interfejs użytkownika - oraz aplikacje serwerową, która implementuje API za pomocą którego udostępniane są dane platformy, oraz poprzez które autoryzowany jest użytkownik.

#### 2.1.2 Solidity

Język Solidity, posłużył mi do stworzenia trzeciej aplikacji, czy też programu której środowiskiem uruchomieniowym jest EVM, co otwiera Nam drzwi do sieci blockchain.

### 2.2. Obsługiwane projekty blockchain

W iteracji Tego projektu przewiduję najpierw obsługe jednej sieci blockchain, jednak ze względu na zastosowanie języku Solidity który opiera się o wcześniej wspomnianą EVM. Dodanie wsparcia dla wszystkich sieci pochodnych, sieci Ethereum nie powinno być większym problemem. Jednak ze względu na czas, oraz chęć dowiedzenia możliwości implementacji takiej platformy, skupię się najpierw na wymianie tylko za pomocą jednej kryptowaluty.

### 2.3. Wybrana metodologia pracy

Cały projekt został zaplanowany przy zastosowaniu metodologii Kanban, wspartej narzędziem Trello które umożliwiło rozpisanie zadań, oraz adekwatne śledzenie postępu prac w postaci tablicy w której prace podzieliłem na dwie kategorie; praca, projekt. Pierwsza skupiała się na przygotowaniu Tego dokumentu, druga bezpośrednio na implementacji samej platformy.

### 2.4. Wybrane technologie

Dobierając technologię do Tego projektu zależało mi na zastosowaniu technologi które obecnie znam, aby usprawnić oszacowywanie czasu realizacji poszczególnych fragmentów platformy, bez narażania się na różne niewiadome który mogły by wynikać z rozwiązywania problemów, czy dokształcania się z zakresu technologii której w momencie rozpoczynania prac byłaby dla mnie kompletnie nie znana.

Poniżej przedstawie zastosowane technologie dzieląc Je na cztery kategorie.

- Browser, czyli wszystkie technologie które zostały zastosowane do przygotowania interfejsu użytkownika, ale też za pomocą których umożliwiłem interakcje z siecią blockchain,
- Server, czyli technologie za pomocą których udostępniłem API które umożliwia dostęp do bazy danych,
- Blockchain, stosowane bezpośrednio do tworzenia aplikacji dedykowanych zdecentralizowanej sieci blockchain,
- Utility, narzędzie usprawniające prace w obrębie monolitycznego repozytorium, oraz narzędzia dostarczające CI/CD,

#### 2.4.1 Browser

#### 2.4.2 Server

#### 2.4.3 Blockchain

#### 2.4.4 Utility

## 3. Specyfikacja wymagań

### 3.1. Zakres prac

| Zagadnienie                                           | w/poza |
| ----------------------------------------------------- | :----: |
| stworzenie modułu zamówień                            |   w    |
| stworzenie modułu zgłoszeń dot. zamówień              |   w    |
| przechowywanie statusu zamówień on-chain              |   w    |
| umożliwienie autoryzacji użytkowników                 |   w    |
| system uprawnień współbieżnego z systemem zamówień    |   w    |
| przygotowanie spójnego interfejsu na całej platformie |   w    |

### 3.2. Schemat platformy

![schemat](images/schemat.png 'schemat')

### 3.3. Wymagania funkcjonalne

#### 3.3.1 Uczestnicy

| Aktor | Nazwa        | Uwagi                                                                                                                                                                     |
| ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tak   | Gość witryny | Nieautoryzowany użytkownik witryny, posiada dostęp do przeglądarki ofert                                                                                                  |
| Tak   | Konsument    | Autoryzowany użytkownik, posiada dostęp do przeglądarki ofert z możliwością do składania zamówień                                                                         |
| Tak   | Sprzedawca   | Autoryzowany użytkownik, posiada dostęp do przegląradki ofert, rozszerzony o możliwość tworzenia swoich własnych, ma wgląd w zamówienia, oraz możliwość zarządzania nimi. |
| Tak   | Moderator    | Autoryzowany użytkownik pośredniczący w rozstrzyganiu sporów między konsumentem, a sprzedawcą wy wypadku sporów                                                           |
