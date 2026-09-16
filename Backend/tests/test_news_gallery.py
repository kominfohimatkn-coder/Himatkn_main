from __future__ import annotations

from io import BytesIO

from PIL import Image


def _login(client) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin-password-1234"},
    )
    assert response.status_code == 200
    return response.json()


def _csrf_headers(client) -> dict[str, str]:
    csrf = client.cookies.get("himatkn_csrf")
    assert csrf
    return {
        "X-CSRF-Token": csrf,
        "Origin": "http://localhost:3000",
    }


def _image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (320, 240), "white").save(buffer, format="PNG")
    return buffer.getvalue()


def test_news_gallery_full_lifecycle(client):
    _login(client)
    headers = _csrf_headers(client)

    create = client.post(
        "/api/v1/admin/news",
        json={
            "title": "Gallery Regression Test",
            "content": "Konten regression test gallery.",
            "status": "published",
        },
        headers=headers,
    )
    assert create.status_code == 201
    news = create.json()
    news_id = news["id"]
    slug = news["slug"]

    upload = client.post(
        f"/api/v1/admin/news/{news_id}/images",
        files={
            "file": (
                "gallery.png",
                _image_bytes(),
                "image/png",
            )
        },
        data={
            "caption": "Caption awal",
            "sort_order": "0",
        },
        headers=headers,
    )
    assert upload.status_code == 201
    image = upload.json()

    assert image["news_id"] == news_id
    assert image["storage_key"].startswith("images/")
    assert image["url"].startswith("/api/v1/media/images/")
    assert image["caption"] == "Caption awal"
    assert image["sort_order"] == 0

    public_list = client.get("/api/v1/public/news")
    assert public_list.status_code == 200
    public_item = next(
        item for item in public_list.json()["items"] if item["id"] == news_id
    )
    assert len(public_item["images"]) == 1
    assert public_item["images"][0]["storage_key"] == image["storage_key"]
    assert public_item["images"][0]["url"] == image["url"]

    public_detail = client.get(f"/api/v1/public/news/{slug}")
    assert public_detail.status_code == 200
    detail = public_detail.json()
    assert detail["id"] == news_id
    assert len(detail["images"]) == 1

    media = client.get(image["url"])
    assert media.status_code == 200
    assert media.headers["content-type"].startswith("image/")

    update = client.put(
        f"/api/v1/admin/news/{news_id}/images/{image['id']}",
        data={
            "caption": "Caption diperbarui",
            "sort_order": "3",
        },
        headers=headers,
    )
    assert update.status_code == 200
    updated = update.json()
    assert updated["caption"] == "Caption diperbarui"
    assert updated["sort_order"] == 3

    delete_image = client.delete(
        f"/api/v1/admin/news/{news_id}/images/{image['id']}",
        headers=headers,
    )
    assert delete_image.status_code == 204

    public_after_delete = client.get(f"/api/v1/public/news/{slug}")
    assert public_after_delete.status_code == 200
    assert public_after_delete.json()["images"] == []

    delete_news = client.delete(
        f"/api/v1/admin/news/{news_id}",
        headers=headers,
    )
    assert delete_news.status_code == 204

    assert client.get(f"/api/v1/public/news/{slug}").status_code == 404
