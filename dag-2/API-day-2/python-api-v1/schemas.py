from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr


class BoekBase(BaseModel):
    titel: str
    jaar: int
    genre: str
    exemplaren: int


class BoekCreate(BoekBase):
    pass


class BoekUpdate(BaseModel):
    titel: Optional[str] = None
    jaar: Optional[int] = None
    genre: Optional[str] = None
    exemplaren: Optional[int] = None


class BoekOut(BoekBase):
    boek_ID: int

    class Config:
        from_attributes = True


class LidBase(BaseModel):
    naam: str
    adres: str
    geboortedatum: date
    email: EmailStr


class LidCreate(LidBase):
    pass


class LidUpdate(BaseModel):
    naam: Optional[str] = None
    adres: Optional[str] = None
    geboortedatum: Optional[date] = None
    email: Optional[EmailStr] = None


class LidOut(LidBase):
    lid_ID: int

    class Config:
        from_attributes = True


class UitleningBase(BaseModel):
    boek_ID: int
    lid_ID: int
    uitleendatum: date


class UitleningCreate(UitleningBase):
    pass


class UitleningOut(UitleningBase):
    uitlening_ID: int
    terugbrengdatum: Optional[date] = None

    class Config:
        from_attributes = True


class BoeteOut(BaseModel):
    boete_ID: int
    bedrag: float
    reden: str
    lid_ID: int
    betaaldatum: Optional[date] = None

    class Config:
        from_attributes = True


class BoetePayRequest(BaseModel):
    betaaldatum: Optional[date] = None


class ReturnRequest(BaseModel):
    terugbrengdatum: Optional[date] = None

