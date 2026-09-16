from ipaddress import ip_address, ip_network
from app.core.config import settings

def get_client_ip(request):
    if request.client:
        return request.client.host
    return "unknown"
