import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_releases():
    response = client.get("/releases")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_release():
    response = client.post("/releases", json={
        "name": "Test Release",
        "date": "2026-03-22T00:00:00",
        "additional_info": "This is a test"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Release"
    assert data["status"] == "planned"

def test_create_and_delete_release():
    # Create
    response = client.post("/releases", json={
        "name": "Delete Me",
        "date": "2026-03-22T00:00:00",
    })
    assert response.status_code == 201
    release_id = response.json()["id"]

    # Delete
    response = client.delete(f"/releases/{release_id}")
    assert response.status_code == 204

def test_get_single_release():
    # Create one first
    response = client.post("/releases", json={
        "name": "Single Release",
        "date": "2026-03-22T00:00:00",
    })
    release_id = response.json()["id"]

    # Get it
    response = client.get(f"/releases/{release_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Single Release"

def test_update_release():
    # Create one first
    response = client.post("/releases", json={
        "name": "Update Me",
        "date": "2026-03-22T00:00:00",
    })
    release_id = response.json()["id"]

    # Update it
    response = client.patch(f"/releases/{release_id}", json={
        "additional_info": "Updated info",
        "steps_state": {"step_1": True, "step_2": False}
    })
    assert response.status_code == 200
    data = response.json()
    assert data["additional_info"] == "Updated info"
    assert data["status"] == "ongoing"