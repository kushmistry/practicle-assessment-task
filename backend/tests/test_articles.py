import pytest
from fastapi.testclient import TestClient


def test_create_article_success(client: TestClient):
    payload = {
        "company_name": "Google",
        "title": "Google announces new AI advancements",
        "url": "https://news.google.com/articles/123",
        "content": "Google has announced significant milestones in their latest AI models.",
    }
    response = client.post("/api/v1/articles", json=payload)
    assert response.status_code == 201
    res_json = response.json()

    # Standard ApiResponse Envelope assertions
    assert res_json["status"] == "success"
    assert res_json["message"] == "Article created successfully"
    assert res_json["meta"] is None

    data = res_json["data"]
    assert data is not None
    assert data["id"] is not None
    assert data["company_name"] == "Google"
    assert data["title"] == payload["title"]
    assert data["url"] == payload["url"]
    assert data["content"] == payload["content"]
    assert data["status"] == "PENDING"
    # Phase 1 Requirement: category and summary must remain null upon creation
    assert data["category"] is None
    assert data["summary"] is None
    assert "created_at" in data


def test_create_article_validation_error(client: TestClient):
    # Empty title
    payload = {
        "company_name": "Google",
        "title": "   ",
        "url": "https://news.google.com",
        "content": "Some content",
    }
    response = client.post("/api/v1/articles", json=payload)
    assert response.status_code == 422
    res_json = response.json()

    # Uniform error response format
    assert res_json["status"] == "error"
    assert "validation" in res_json["message"].lower()
    assert isinstance(res_json["data"], list)
    assert len(res_json["data"]) > 0
    assert any("title" in err["field"] for err in res_json["data"])
    assert res_json["meta"] is None


def test_get_article_by_id_success(client: TestClient):
    # Create article first
    payload = {
        "company_name": "Microsoft",
        "title": "Microsoft Copilot updates",
        "url": "https://news.microsoft.com/copilot",
        "content": "Microsoft introduced new features to Copilot.",
    }
    create_res = client.post("/api/v1/articles", json=payload)
    article_id = create_res.json()["data"]["id"]

    # Fetch by ID
    get_res = client.get(f"/api/v1/articles/{article_id}")
    assert get_res.status_code == 200
    res_json = get_res.json()

    assert res_json["status"] == "success"
    assert res_json["message"] == "Article retrieved successfully"
    assert res_json["data"]["id"] == article_id
    assert res_json["data"]["company_name"] == "Microsoft"
    assert res_json["meta"] is None


def test_get_article_not_found(client: TestClient):
    response = client.get("/api/v1/articles/99999")
    assert response.status_code == 404
    res_json = response.json()

    assert res_json["status"] == "error"
    assert "not found" in res_json["message"].lower()
    assert res_json["data"] is None
    assert res_json["meta"] is None


def test_list_articles_pagination_and_filtering(client: TestClient):
    # Seed multiple articles
    articles_data = [
        {"company_name": "Apple", "title": "Apple Keynote 1", "url": "https://apple.com/1", "content": "Content 1"},
        {"company_name": "Apple", "title": "Apple Keynote 2", "url": "https://apple.com/2", "content": "Content 2"},
        {"company_name": "Tesla", "title": "Tesla Robotaxi", "url": "https://tesla.com/1", "content": "Content 3"},
    ]
    for art in articles_data:
        client.post("/api/v1/articles", json=art)

    # Test pagination
    res_page_1 = client.get("/api/v1/articles?page=1&page_size=2")
    assert res_page_1.status_code == 200
    res_json = res_page_1.json()

    assert res_json["status"] == "success"
    assert res_json["message"] == "Articles retrieved successfully"
    assert isinstance(res_json["data"], list)
    assert len(res_json["data"]) == 2

    # Meta pagination object
    meta = res_json["meta"]
    assert meta is not None
    assert meta["page"] == 1
    assert meta["page_size"] == 2
    assert meta["total"] >= 3
    assert meta["total_pages"] >= 2

    # Test filtering by company_name
    res_apple = client.get("/api/v1/articles?company_name=apple")
    assert res_apple.status_code == 200
    apple_json = res_apple.json()
    assert apple_json["status"] == "success"
    assert all("apple" in item["company_name"].lower() for item in apple_json["data"])
    assert apple_json["meta"]["total"] >= 2

    # Test filtering by status
    res_pending = client.get("/api/v1/articles?status=PENDING")
    assert res_pending.status_code == 200
    pending_json = res_pending.json()
    assert pending_json["status"] == "success"
    assert all(item["status"] == "PENDING" for item in pending_json["data"])

    # Test filtering by non-existent status
    res_non_existent = client.get("/api/v1/articles?status=UNKNOWN_STATUS")
    assert res_non_existent.status_code == 200
    non_existent_json = res_non_existent.json()
    assert non_existent_json["status"] == "success"
    assert non_existent_json["meta"]["total"] == 0
    assert len(non_existent_json["data"]) == 0
