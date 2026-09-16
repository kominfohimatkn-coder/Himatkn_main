def test_login_me_logout(client):
 csrf=client.get('/api/v1/auth/csrf'); assert csrf.status_code==200
 r=client.post('/api/v1/auth/login',json={'username':'admin','password':'admin-password-1234'},headers={'Origin':'http://localhost:3000'}); assert r.status_code==200
 me=client.get('/api/v1/auth/me'); assert me.status_code==200 and me.json()['admin']['username']=='admin'
 token=client.cookies.get('himatkn_csrf'); out=client.post('/api/v1/auth/logout',headers={'X-CSRF-Token':token,'Origin':'http://localhost:3000'}); assert out.status_code==200
 assert client.get('/api/v1/auth/me').status_code==401
def test_bad_login(client):
 r=client.post('/api/v1/auth/login',json={'username':'admin','password':'wrong-password'},headers={'Origin':'http://localhost:3000'}); assert r.status_code==401
def test_csrf_required(client):
 client.post('/api/v1/auth/login',json={'username':'admin','password':'admin-password-1234'},headers={'Origin':'http://localhost:3000'})
 r=client.put('/api/v1/admin/settings/example',json={'setting_value':'x','value_type':'string'},headers={'Origin':'http://localhost:3000'}); assert r.status_code==403


def test_login_rate_limit_returns_429(client):
    from app.core.rate_limit import limiter
    limiter._events.clear()
    for _ in range(5):
        r=client.post('/api/v1/auth/login',json={'username':'admin','password':'wrong-password'},headers={'Origin':'http://localhost:3000'})
        assert r.status_code==401
    r=client.post('/api/v1/auth/login',json={'username':'admin','password':'wrong-password'},headers={'Origin':'http://localhost:3000'})
    assert r.status_code==429
    assert 'detail' in r.json() and r.headers.get('Retry-After')

def test_origin_protection(client):
    r=client.post('/api/v1/auth/login',json={'username':'admin','password':'admin-password-1234'},headers={'Origin':'https://evil.example'})
    assert r.status_code==403
