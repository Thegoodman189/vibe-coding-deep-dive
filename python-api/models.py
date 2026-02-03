from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Boek(Base):
    __tablename__ = "boeken"

    boek_ID = Column(Integer, primary_key=True, index=True)
    titel = Column(String, nullable=False)
    jaar = Column(Integer, nullable=False)
    genre = Column(String, nullable=False)
    exemplaren = Column(Integer, nullable=False)

    uitleningen = relationship("Uitlening", back_populates="boek")


class Lid(Base):
    __tablename__ = "leden"

    lid_ID = Column(Integer, primary_key=True, index=True)
    naam = Column(String, nullable=False)
    adres = Column(String, nullable=False)
    geboortedatum = Column(Date, nullable=False)
    email = Column(String, nullable=False, unique=True)

    uitleningen = relationship("Uitlening", back_populates="lid")
    boetes = relationship("Boete", back_populates="lid")


class Uitlening(Base):
    __tablename__ = "uitleningen"

    uitlening_ID = Column(Integer, primary_key=True, index=True)
    uitleendatum = Column(Date, nullable=False)
    terugbrengdatum = Column(Date, nullable=True)

    boek_ID = Column(Integer, ForeignKey("boeken.boek_ID"), nullable=False)
    lid_ID = Column(Integer, ForeignKey("leden.lid_ID"), nullable=False)

    boek = relationship("Boek", back_populates="uitleningen")
    lid = relationship("Lid", back_populates="uitleningen")


class Boete(Base):
    __tablename__ = "boetes"

    boete_ID = Column(Integer, primary_key=True, index=True)
    bedrag = Column(Float, nullable=False)
    reden = Column(String, nullable=False)
    betaaldatum = Column(Date, nullable=True)

    lid_ID = Column(Integer, ForeignKey("leden.lid_ID"), nullable=False)
    lid = relationship("Lid", back_populates="boetes")

