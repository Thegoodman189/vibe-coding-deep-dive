from datetime import date
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Boek, Lid, Uitlening, Boete
import schemas

app = FastAPI(title="Bibliotheek REST API")

# Tabellen aanmaken bij opstart (SQLite)
Base.metadata.create_all(bind=engine)


@app.get("/boeken", response_model=List[schemas.BoekOut])
def list_boeken(
    titel: Optional[str] = None,
    genre: Optional[str] = None,
    jaar: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Boek)
    if titel:
        query = query.filter(Boek.titel.ilike(f"%{titel}%"))
    if genre:
        query = query.filter(Boek.genre.ilike(f"%{genre}%"))
    if jaar:
        query = query.filter(Boek.jaar == jaar)
    return query.all()


@app.post("/boeken", response_model=schemas.BoekOut, status_code=status.HTTP_201_CREATED)
def create_boek(data: schemas.BoekCreate, db: Session = Depends(get_db)):
    boek = Boek(**data.model_dump())
    db.add(boek)
    db.commit()
    db.refresh(boek)
    return boek


@app.get("/boeken/{boek_id}", response_model=schemas.BoekOut)
def get_boek(boek_id: int, db: Session = Depends(get_db)):
    boek = db.get(Boek, boek_id)
    if not boek:
        raise HTTPException(404, "Boek niet gevonden")
    return boek


@app.patch("/boeken/{boek_id}", response_model=schemas.BoekOut)
def update_boek(boek_id: int, data: schemas.BoekUpdate, db: Session = Depends(get_db)):
    boek = db.get(Boek, boek_id)
    if not boek:
        raise HTTPException(404, "Boek niet gevonden")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(boek, field, value)

    db.commit()
    db.refresh(boek)
    return boek


@app.delete("/boeken/{boek_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_boek(boek_id: int, db: Session = Depends(get_db)):
    boek = db.get(Boek, boek_id)
    if not boek:
        raise HTTPException(404, "Boek niet gevonden")

    actieve_uitleningen = (
        db.query(Uitlening)
        .filter(Uitlening.boek_ID == boek_id, Uitlening.terugbrengdatum.is_(None))
        .count()
    )
    if actieve_uitleningen > 0:
        raise HTTPException(
            400, "Boek heeft nog actieve uitleningen en kan niet worden verwijderd"
        )

    db.delete(boek)
    db.commit()
    return None


@app.get("/leden", response_model=List[schemas.LidOut])
def list_leden(db: Session = Depends(get_db)):
    return db.query(Lid).all()


@app.post("/leden", response_model=schemas.LidOut, status_code=status.HTTP_201_CREATED)
def create_lid(data: schemas.LidCreate, db: Session = Depends(get_db)):
    lid = Lid(**data.model_dump())
    db.add(lid)
    db.commit()
    db.refresh(lid)
    return lid


@app.get("/leden/{lid_id}", response_model=schemas.LidOut)
def get_lid(lid_id: int, db: Session = Depends(get_db)):
    lid = db.get(Lid, lid_id)
    if not lid:
        raise HTTPException(404, "Lid niet gevonden")
    return lid


@app.patch("/leden/{lid_id}", response_model=schemas.LidOut)
def update_lid(lid_id: int, data: schemas.LidUpdate, db: Session = Depends(get_db)):
    lid = db.get(Lid, lid_id)
    if not lid:
        raise HTTPException(404, "Lid niet gevonden")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lid, field, value)

    db.commit()
    db.refresh(lid)
    return lid


@app.delete("/leden/{lid_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lid(lid_id: int, db: Session = Depends(get_db)):
    lid = db.get(Lid, lid_id)
    if not lid:
        raise HTTPException(404, "Lid niet gevonden")

    actieve_uitleningen = (
        db.query(Uitlening)
        .filter(Uitlening.lid_ID == lid_id, Uitlening.terugbrengdatum.is_(None))
        .count()
    )
    open_boetes = (
        db.query(Boete)
        .filter(Boete.lid_ID == lid_id, Boete.betaaldatum.is_(None))
        .count()
    )
    if actieve_uitleningen > 0 or open_boetes > 0:
        raise HTTPException(
            400,
            "Lid heeft nog actieve uitleningen of openstaande boetes en kan niet worden verwijderd",
        )

    db.delete(lid)
    db.commit()
    return None


@app.get("/uitleningen", response_model=List[schemas.UitleningOut])
def list_uitleningen(
    lid_ID: Optional[int] = None,
    actief: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Uitlening)
    if lid_ID is not None:
        query = query.filter(Uitlening.lid_ID == lid_ID)
    if actief is True:
        query = query.filter(Uitlening.terugbrengdatum.is_(None))
    return query.all()


@app.post(
    "/uitleningen",
    response_model=schemas.UitleningOut,
    status_code=status.HTTP_201_CREATED,
)
def create_uitlening(data: schemas.UitleningCreate, db: Session = Depends(get_db)):
    boek = db.get(Boek, data.boek_ID)
    if not boek:
        raise HTTPException(404, "Boek niet gevonden")
    if boek.exemplaren <= 0:
        raise HTTPException(400, "Geen exemplaren beschikbaar")

    lid = db.get(Lid, data.lid_ID)
    if not lid:
        raise HTTPException(404, "Lid niet gevonden")

    boek.exemplaren -= 1
    uitlening = Uitlening(
        boek_ID=data.boek_ID,
        lid_ID=data.lid_ID,
        uitleendatum=data.uitleendatum,
        terugbrengdatum=None,
    )
    db.add(uitlening)
    db.commit()
    db.refresh(uitlening)
    return uitlening


@app.get("/uitleningen/{uitlening_id}", response_model=schemas.UitleningOut)
def get_uitlening(uitlening_id: int, db: Session = Depends(get_db)):
    uitlening = db.get(Uitlening, uitlening_id)
    if not uitlening:
        raise HTTPException(404, "Uitlening niet gevonden")
    return uitlening


@app.post("/uitleningen/{uitlening_id}/return", response_model=schemas.UitleningOut)
def return_boek(
    uitlening_id: int,
    body: schemas.ReturnRequest,
    db: Session = Depends(get_db),
):
    uitlening = db.get(Uitlening, uitlening_id)
    if not uitlening:
        raise HTTPException(404, "Uitlening niet gevonden")

    if uitlening.terugbrengdatum is not None:
        raise HTTPException(400, "Boek is al teruggebracht")

    terugbrengdatum = body.terugbrengdatum or date.today()
    uitlening.terugbrengdatum = terugbrengdatum

    boek = db.get(Boek, uitlening.boek_ID)
    if boek:
        boek.exemplaren += 1

    days = (terugbrengdatum - uitlening.uitleendatum).days
    if days > 14:
        bedrag = float((days - 14) * 0.5)
        boete = Boete(
            bedrag=bedrag,
            reden=f"Te laat inleveren ({days} dagen)",
            lid_ID=uitlening.lid_ID,
            betaaldatum=None,
        )
        db.add(boete)

    db.commit()
    db.refresh(uitlening)
    return uitlening


@app.get("/boetes", response_model=List[schemas.BoeteOut])
def list_boetes(
    lid_ID: Optional[int] = None,
    open: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Boete)
    if lid_ID is not None:
        query = query.filter(Boete.lid_ID == lid_ID)
    if open is True:
        query = query.filter(Boete.betaaldatum.is_(None))
    return query.all()


@app.get("/boetes/{boete_id}", response_model=schemas.BoeteOut)
def get_boete(boete_id: int, db: Session = Depends(get_db)):
    boete = db.get(Boete, boete_id)
    if not boete:
        raise HTTPException(404, "Boete niet gevonden")
    return boete


@app.post("/boetes/{boete_id}/pay", response_model=schemas.BoeteOut)
def pay_boete(
    boete_id: int,
    body: schemas.BoetePayRequest,
    db: Session = Depends(get_db),
):
    boete = db.get(Boete, boete_id)
    if not boete:
        raise HTTPException(404, "Boete niet gevonden")
    if boete.betaaldatum is not None:
        raise HTTPException(400, "Boete is al betaald")

    betaaldatum = body.betaaldatum or date.today()
    boete.betaaldatum = betaaldatum
    db.commit()
    db.refresh(boete)
    return boete

