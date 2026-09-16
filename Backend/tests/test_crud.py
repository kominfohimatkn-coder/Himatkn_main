from datetime import datetime, timedelta

def login(client):
    client.get('/api/v1/auth/csrf')
    r=client.post('/api/v1/auth/login',json={'username':'admin','password':'admin-password-1234'},headers={'Origin':'http://localhost:3000'})
    assert r.status_code==200
    return client.cookies.get('himatkn_csrf')

def test_admin_modules(client):
    token=login(client); h={'X-CSRF-Token':token,'Origin':'http://localhost:3000'}
    assert client.get('/api/v1/admin/dashboard').status_code==200
    assert client.get('/api/v1/admin/organization/periods').status_code==200
    assert client.post('/api/v1/admin/organization/periods',json={'name':'2026/2027','start_date':'2026-01-01','end_date':'2027-12-31','is_active':True},headers=h).status_code==201
    p=client.get('/api/v1/admin/organization/periods').json()['items'][0]
    period_id=p['id']
    assert client.post('/api/v1/admin/programs',json={'period_id':period_id,'name':'Program Test','slug':'program-test','description':'desc','status':'planned'},headers=h).status_code==201
    assert client.get('/api/v1/admin/programs').status_code==200
    assert client.post('/api/v1/admin/agendas',json={'title':'Agenda Test','start_at':'2026-09-20T10:00:00'},headers=h).status_code==201
    assert client.get('/api/v1/admin/agendas').status_code==200
    assert client.post('/api/v1/admin/news',json={'title':'Berita Test','content':'Konten','status':'draft'},headers=h).status_code==201
    assert client.get('/api/v1/admin/news').status_code==200
    assert client.get('/api/v1/admin/settings').status_code==200
    assert client.get('/api/v1/admin/documents').status_code==200
    assert client.get('/api/v1/admin/notifications').status_code==200
    assert client.get('/api/v1/admin/activity-logs').status_code==200
    assert client.get('/api/v1/admin/visitor-logs').status_code==200

def test_public_and_document_upload(client, tmp_path, monkeypatch):
    import app.services.storage as storage
    monkeypatch.setattr(storage.settings,'storage_local_dir',str(tmp_path),raising=False)
    news_response = client.get('/api/v1/public/news')
    assert news_response.status_code==200
    assert all('content' not in item for item in news_response.json()['items'])
    assert client.get('/api/v1/public/programs').status_code==200
    assert client.get('/api/v1/public/organization').status_code==200
    assert client.post('/api/v1/public/visits',params={'page':'/'}).status_code==201
    token=login(client); h={'X-CSRF-Token':token,'Origin':'http://localhost:3000'}
    pdf=b'%PDF-1.4\n%test pdf\n'
    r=client.post('/api/v1/admin/documents',data={'title':'Doc Test','category':'General'},files={'file':('test.pdf',pdf,'application/pdf')},headers=h)
    assert r.status_code==201



def test_permission_enforced(client):
    client.get('/api/v1/auth/csrf')
    r=client.post('/api/v1/auth/login',json={'username':'limited','password':'limited-password-1234'},headers={'Origin':'http://localhost:3000'})
    assert r.status_code==200
    token=client.cookies.get('himatkn_csrf')
    r=client.post('/api/v1/admin/programs',json={'period_id':1,'name':'Denied','slug':'denied','status':'planned'},headers={'Origin':'http://localhost:3000','X-CSRF-Token':token})
    assert r.status_code==403


def test_image_upload_endpoint(client, tmp_path, monkeypatch):
    import io
    from PIL import Image
    import app.services.storage as storage
    monkeypatch.setattr(storage.settings, 'storage_local_dir', str(tmp_path), raising=False)
    token=login(client)
    buf=io.BytesIO(); Image.new('RGB',(100,100),'white').save(buf,'PNG'); buf.seek(0)
    r=client.post('/api/v1/media/images',files={'file':('photo.png',buf,'image/png')},headers={'Origin':'http://localhost:3000','X-CSRF-Token':token})
    assert r.status_code==201
    body=r.json(); assert body['compressed_size_bytes']>0 and body['original_size_bytes']>0
