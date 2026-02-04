"""
Integration tests for the Bibliotheek API.

NOTE / TODO:
- Deze repo bevat nog geen bestaand testframework of teststructuur.
- Hieronder gebruiken we pytest + FastAPI's TestClient als voorstel.
"""

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_create_and_get_boek_success():
    payload = {
        "titel": "De Ontdekking",
        "jaar": 2020,
        "genre": "Roman",
        "exemplaren": 5,
    }
    resp = client.post("/boeken", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["titel"] == payload["titel"]
    boek_id = data["boek_ID"]

    resp_get = client.get(f"/boeken/{boek_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["boek_ID"] == boek_id


def test_create_boek_validation_error():
    # ontbrekende verplichte velden moet leiden tot 422 (FastAPI validatie)
    resp = client.post("/boeken", json={"titel": "Zonder jaar"})
    assert resp.status_code == 422


def test_delete_boek_blocked_when_active_loan():
    # Maak een boek en lid aan
    boek = client.post(
        "/boeken",
        json={"titel": "Lenen Test", "jaar": 2021, "genre": "Test", "exemplaren": 1},
    ).json()
    lid = client.post(
        "/leden",
        json={
            "naam": "Test Lid",
            "adres": "Straat 1",
            "geboortedatum": "1990-01-01",
            "email": "testlid@example.com",
        },
    ).json()

    # Lenen
    resp_loan = client.post(
        "/uitleningen",
        json={
            "boek_ID": boek["boek_ID"],
            "lid_ID": lid["lid_ID"],
            "uitleendatum": str(date.today()),
        },
    )
    assert resp_loan.status_code == 201

    # Proberen te verwijderen moet 400 geven
    resp_delete = client.delete(f"/boeken/{boek['boek_ID']}")
    assert resp_delete.status_code == 400


def test_loan_and_return_with_fine():
    boek = client.post(
        "/boeken",
        json={"titel": "Te Laat Boek", "jaar": 2022, "genre": "Test", "exemplaren": 1},
    ).json()
    lid = client.post(
        "/leden",
        json={
            "naam": "Boete Lid",
            "adres": "Straat 2",
            "geboortedatum": "1995-05-05",
            "email": "boetelid@example.com",
        },
    ).json()

    uitleen_datum = date.today() - timedelta(days=20)
    resp_loan = client.post(
        "/uitleningen",
        json={
            "boek_ID": boek["boek_ID"],
            "lid_ID": lid["lid_ID"],
            "uitleendatum": str(uitleen_datum),
        },
    )
    assert resp_loan.status_code == 201
    uitlening = resp_loan.json()

    # Terugbrengen na 20 dagen -> boete verwacht
    resp_return = client.post(
        f"/uitleningen/{uitlening['uitlening_ID']}/return",
        json={"terugbrengdatum": str(uitleen_datum + timedelta(days=20))},
    )
    assert resp_return.status_code == 200

    # Check of er een openstaande boete is voor dit lid
    resp_fines = client.get(f"/boetes?lid_ID={lid['lid_ID']}&open=true")
    assert resp_fines.status_code == 200
    fines = resp_fines.json()
    assert len(fines) >= 1


def test_pay_boete_twice_fails():
    # Setup: maak lid aan en geforceerde boete
    lid = client.post(
        "/leden",
        json={
            "naam": "Dubbele Boete",
            "adres": "Straat 3",
            "geboortedatum": "1992-03-03",
            "email": "dubbele@example.com",
        },
    ).json()

    # Direct een boete-object via API verkrijgen kan alleen na te laat terugbrengen,
    # dus we gebruiken hetzelfde pad als in de vorige test.
    boek = client.post(
        "/boeken",
        json={
            "titel": "Boete 2x",
            "jaar": 2023,
            "genre": "Test",
            "exemplaren": 1,
        },
    ).json()

    uitleen_datum = date.today() - timedelta(days=20)
    uitlening = client.post(
        "/uitleningen",
        json={
            "boek_ID": boek["boek_ID"],
            "lid_ID": lid["lid_ID"],
            "uitleendatum": str(uitleen_datum),
        },
    ).json()

    client.post(
        f"/uitleningen/{uitlening['uitlening_ID']}/return",
        json={"terugbrengdatum": str(uitleen_datum + timedelta(days=20))},
    )

    fines = client.get(f"/boetes?lid_ID={lid['lid_ID']}&open=true").json()
    assert fines
    boete_id = fines[0]["boete_ID"]

    # Eerste betaling moet slagen
    resp_pay1 = client.post(f"/boetes/{boete_id}/pay", json={})
    assert resp_pay1.status_code == 200

    # Tweede betaling moet 400 opleveren
    resp_pay2 = client.post(f"/boetes/{boete_id}/pay", json={})
    assert resp_pay2.status_code == 400

