import pytest
from fastapi.testclient import TestClient
from app.core.exceptions import AppException, BadRequestException
from app.main import app


def test_custom_app_exception_response_format(client: TestClient):
    @app.get("/test-custom-error")
    def trigger_error():
        raise BadRequestException(message="Invalid parameters provided", data={"hint": "Check field X"})

    res = client.get("/test-custom-error")
    assert res.status_code == 400
    res_json = res.json()
    assert res_json["status"] == "error"
    assert res_json["message"] == "Invalid parameters provided"
    assert res_json["data"] == {"hint": "Check field X"}
    assert res_json["meta"] is None


def test_unhandled_exception_response_format():
    @app.get("/test-500-error")
    def trigger_crash():
        raise RuntimeError("Unexpected failure")

    client_no_raise = TestClient(app, raise_server_exceptions=False)
    res = client_no_raise.get("/test-500-error")
    assert res.status_code == 500
    res_json = res.json()
    assert res_json["status"] == "error"
    assert "unexpected" in res_json["message"].lower() or "internal" in res_json["message"].lower()
    assert res_json["data"] is None
    assert res_json["meta"] is None

