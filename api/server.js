const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory "database"
let boeken = [];
let leden = [];
let uitleningen = [];
let boetes = [];

let nextBoekId = 1;
let nextLidId = 1;
let nextUitleningId = 1;
let nextBoeteId = 1;

// ------------- Helper functies -------------

function findById(list, id, name) {
  const item = list.find((i) => i.id === id);
  if (!item) {
    const err = new Error(`${name} niet gevonden`);
    err.status = 404;
    throw err;
  }
  return item;
}

// ------------- Boeken -------------

app.get("/boeken", (req, res) => {
  const { titel, genre, jaar } = req.query;
  let result = [...boeken];

  if (titel) {
    result = result.filter((b) =>
      b.titel.toLowerCase().includes(titel.toLowerCase())
    );
  }
  if (genre) {
    result = result.filter(
      (b) => b.genre.toLowerCase() === genre.toLowerCase()
    );
  }
  if (jaar) {
    result = result.filter((b) => b.jaar === Number(jaar));
  }

  res.json(result);
});

app.post("/boeken", (req, res) => {
  const { titel, jaar, genre, exemplaren } = req.body;
  const boek = {
    id: nextBoekId++,
    titel,
    jaar,
    genre,
    exemplaren,
  };
  boeken.push(boek);
  res.status(201).json(boek);
});

app.get("/boeken/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const boek = findById(boeken, id, "Boek");
    res.json(boek);
  } catch (err) {
    next(err);
  }
});

app.patch("/boeken/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const boek = findById(boeken, id, "Boek");
    const { titel, jaar, genre, exemplaren } = req.body;
    if (titel !== undefined) boek.titel = titel;
    if (jaar !== undefined) boek.jaar = jaar;
    if (genre !== undefined) boek.genre = genre;
    if (exemplaren !== undefined) boek.exemplaren = exemplaren;
    res.json(boek);
  } catch (err) {
    next(err);
  }
});

app.delete("/boeken/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const actief = uitleningen.some(
      (u) => u.boek_ID === id && u.terugbrengdatum === null
    );
    if (actief) {
      const err = new Error(
        "Boek heeft nog actieve uitleningen en kan niet worden verwijderd"
      );
      err.status = 400;
      throw err;
    }
    boeken = boeken.filter((b) => b.id !== id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ------------- Leden -------------

app.get("/leden", (req, res) => {
  res.json(leden);
});

app.post("/leden", (req, res) => {
  const { naam, adres, geboortedatum, email } = req.body;
  const lid = {
    id: nextLidId++,
    naam,
    adres,
    geboortedatum,
    email,
  };
  leden.push(lid);
  res.status(201).json(lid);
});

app.get("/leden/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const lid = findById(leden, id, "Lid");
    res.json(lid);
  } catch (err) {
    next(err);
  }
});

app.patch("/leden/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const lid = findById(leden, id, "Lid");
    const { naam, adres, geboortedatum, email } = req.body;
    if (naam !== undefined) lid.naam = naam;
    if (adres !== undefined) lid.adres = adres;
    if (geboortedatum !== undefined) lid.geboortedatum = geboortedatum;
    if (email !== undefined) lid.email = email;
    res.json(lid);
  } catch (err) {
    next(err);
  }
});

app.delete("/leden/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const actieveUitleningen = uitleningen.some(
      (u) => u.lid_ID === id && u.terugbrengdatum === null
    );
    const openBoetes = boetes.some(
      (b) => b.lid_ID === id && b.betaaldatum === null
    );
    if (actieveUitleningen || openBoetes) {
      const err = new Error(
        "Lid heeft nog actieve uitleningen of openstaande boetes"
      );
      err.status = 400;
      throw err;
    }
    leden = leden.filter((l) => l.id !== id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ------------- Uitleningen -------------

app.get("/uitleningen", (req, res) => {
  const { lid_ID, actief } = req.query;
  let result = [...uitleningen];

  if (lid_ID !== undefined) {
    const idNum = Number(lid_ID);
    result = result.filter((u) => u.lid_ID === idNum);
  }
  if (actief === "true") {
    result = result.filter((u) => u.terugbrengdatum === null);
  }

  res.json(result);
});

app.post("/uitleningen", (req, res, next) => {
  try {
    const { boek_ID, lid_ID, uitleendatum } = req.body;
    const boek = findById(boeken, Number(boek_ID), "Boek");
    const lid = findById(leden, Number(lid_ID), "Lid");

    if (boek.exemplaren <= 0) {
      const err = new Error("Geen exemplaren beschikbaar");
      err.status = 400;
      throw err;
    }

    boek.exemplaren -= 1;

    const uitlening = {
      id: nextUitleningId++,
      boek_ID: boek.id,
      lid_ID: lid.id,
      uitleendatum,
      terugbrengdatum: null,
    };
    uitleningen.push(uitlening);
    res.status(201).json(uitlening);
  } catch (err) {
    next(err);
  }
});

app.get("/uitleningen/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const uitlening = findById(uitleningen, id, "Uitlening");
    res.json(uitlening);
  } catch (err) {
    next(err);
  }
});

app.post("/uitleningen/:id/return", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const uitlening = findById(uitleningen, id, "Uitlening");

    if (uitlening.terugbrengdatum !== null) {
      const err = new Error("Boek is al teruggebracht");
      err.status = 400;
      throw err;
    }

    const terugbrengdatum =
      req.body.terugbrengdatum || new Date().toISOString().slice(0, 10);
    uitlening.terugbrengdatum = terugbrengdatum;

    const boek = findById(boeken, uitlening.boek_ID, "Boek");
    boek.exemplaren += 1;

    const uitleenDate = new Date(uitlening.uitleendatum);
    const terugDate = new Date(terugbrengdatum);
    const diffMs = terugDate - uitleenDate;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 14) {
      const bedrag = (days - 14) * 0.5;
      const boete = {
        id: nextBoeteId++,
        bedrag,
        reden: `Te laat inleveren (${days} dagen)`,
        lid_ID: uitlening.lid_ID,
        betaaldatum: null,
      };
      boetes.push(boete);
    }

    res.json(uitlening);
  } catch (err) {
    next(err);
  }
});

// ------------- Boetes -------------

app.get("/boetes", (req, res) => {
  const { lid_ID, open } = req.query;
  let result = [...boetes];

  if (lid_ID !== undefined) {
    const idNum = Number(lid_ID);
    result = result.filter((b) => b.lid_ID === idNum);
  }
  if (open === "true") {
    result = result.filter((b) => b.betaaldatum === null);
  }

  res.json(result);
});

app.get("/boetes/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const boete = findById(boetes, id, "Boete");
    res.json(boete);
  } catch (err) {
    next(err);
  }
});

app.post("/boetes/:id/pay", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const boete = findById(boetes, id, "Boete");
    if (boete.betaaldatum !== null) {
      const err = new Error("Boete is al betaald");
      err.status = 400;
      throw err;
    }
    const betaaldatum =
      req.body.betaaldatum || new Date().toISOString().slice(0, 10);
    boete.betaaldatum = betaaldatum;
    res.json(boete);
  } catch (err) {
    next(err);
  }
});

// ------------- Foutafhandeling -------------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ detail: err.message || "Server error" });
});

app.listen(port, () => {
  console.log(`Bibliotheek API (JS) draait op http://localhost:${port}`);
});

