import pytest
from fastapi.testclient import TestClient
from app.main import application_setup


@pytest.fixture
def get_app():
    """
    Fixture to create a FastAPI application instance for testing.
    """
    app = application_setup()
    yield app


def test_generate(get_app):
    """
    Test the AI generate endpoint with a sample message.

    This test sends a POST request to the "/ai/generate" endpoint with a message
    containing a user role and message content. It asserts the response status
    code is 200 (success) and optionally verifies the presence of generated text
    in the response (depending on your implementation).
    """

    client = TestClient(get_app)
    message_data = {"messages": [{"role": "user", "content": "Hello"}]}
    response = client.post("/ai/generate", json=message_data)

    print(response.json())

    assert response.status_code == 200


def test_response_structure(get_app):
    """
    Test that the response has the expected structure.
    """

    client = TestClient(get_app)
    message_data = {"messages": [{"role": "user", "content": "Hello"}]}
    response = client.post("/ai/generate", json=message_data)

    assert response.status_code == 200
    assert set(response.json().keys()) == {
        "id", "choices", "created", "model", "object", "system_fingerprint", "usage"}


def test_invalid_message_format(get_app):
    """
    Test the response to a malformed message.
    """

    client = TestClient(get_app)
    message_data = {"messages": "invalid format"}  # Invalid format
    response = client.post("/ai/generate", json=message_data)

    assert response.status_code == 422  # Unprocessable Entity (invalid format)
