from app.main import app


def test_routes_registered():
    paths = set(app.openapi()["paths"].keys())

    required = {
        "/api/v1/health",
        "/api/v1/auth/login",
        "/api/v1/auth/me",
        "/api/v1/admin/dashboard",
        "/api/v1/admin/news",
        "/api/v1/admin/programs",
        "/api/v1/admin/organization/members",
        "/api/v1/admin/documents",
        "/api/v1/admin/settings/{key}",
        "/api/v1/public/news",
        "/api/v1/media/images/{filename}",
    }

    assert required <= paths
    assert "/api/v1/health" in paths
    assert len([path for path in paths if path == "/api/v1/health"]) == 1


def test_not_found_json(client):
    response = client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    assert response.json()["detail"]