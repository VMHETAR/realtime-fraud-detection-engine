"""
FastAPI Server Launcher with Dynamic Port Collision Resolution on Localhost.
Automatically detects if the requested port is busy and allocates the next available port.
"""

import os
import sys
import socket
import logging
import argparse
import uvicorn
from typing import Tuple

logger = logging.getLogger("fraud_engine.server")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")


def is_port_available(port: int, host: str = "127.0.0.1") -> bool:
    """
    Checks whether a specific TCP port is open and available for binding.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((host, port))
            return True
        except OSError:
            return False


def find_available_port(
    preferred_port: int = 8000,
    max_scan_range: int = 50,
    host: str = "127.0.0.1"
) -> Tuple[int, bool]:
    """
    Finds an open port on localhost starting from preferred_port.
    Returns (selected_port, was_preferred_busy).
    """
    if is_port_available(preferred_port, host):
        return preferred_port, False

    print(f"[!] Port {preferred_port} on {host} is currently busy / in use.")
    print(f"[*] Scanning next available open ports on {host}...")

    for candidate_port in range(preferred_port + 1, preferred_port + 1 + max_scan_range):
        if is_port_available(candidate_port, host):
            print(f"[+] Found available port: {candidate_port} on {host}")
            return candidate_port, True

    # Fallback to OS assigned ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        ephemeral_port = s.getsockname()[1]
        print(f"[+] Fallback to OS ephemeral port: {ephemeral_port}")
        return ephemeral_port, True


def run_server(
    host: str = "127.0.0.1",
    port: int = 8000,
    reload: bool = False,
    auto_port: bool = True
):
    """
    Launches Uvicorn FastAPI server on localhost with automatic port fallback.
    """
    selected_port = port
    if auto_port:
        selected_port, was_busy = find_available_port(preferred_port=port, host=host)
        if was_busy:
            print(f"[INFO] Switched from busy port {port} -> {selected_port}")

    frontend_mounted = os.path.exists(FRONTEND_DIST_DIR)

    print("\n" + "=" * 75)
    print("  🚀 AEGISRISK FRAUD DETECTION & ANOMALY SCORING ENGINE")
    print(f"  • Web Dashboard (UI):   http://{host}:{selected_port}")
    print(f"  • Swagger Docs (API):   http://{host}:{selected_port}/docs")
    print(f"  • Health Endpoint:      http://{host}:{selected_port}/health")
    print(f"  • Frontend Mounted:     {'YES (Ready at /)' if frontend_mounted else 'NO (Run cd frontend && npm run build)'}")
    print("=" * 75 + "\n")

    uvicorn.run(
        "src.api.app:app",
        host=host,
        port=selected_port,
        reload=reload,
        log_level="info"
    )


def main():
    parser = argparse.ArgumentParser(description="Real-Time Fraud Detection FastAPI Server")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host IP to bind (default: 127.0.0.1 localhost)")
    parser.add_argument("--port", type=int, default=8000, help="Initial target port (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--no-auto-port", action="store_true", help="Disable automatic fallback if port is busy")

    args = parser.parse_args()
    run_server(
        host=args.host,
        port=args.port,
        reload=args.reload,
        auto_port=not args.no_auto_port
    )


if __name__ == "__main__":
    main()
