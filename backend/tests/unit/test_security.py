from app.core.security import (
    generate_ticket_signature,
    hash_password,
    verify_password,
    verify_ticket_signature,
)


def test_password_hashing():
    raw_password = "SecurePassword123!"
    hashed = hash_password(raw_password)

    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_ticket_signature_and_anti_tampering():
    ticket_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    trip_id = "c9a646d3-9c61-4cd9-bc15-4581c32bde21"
    booking_id = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"

    signature = generate_ticket_signature(ticket_id, trip_id, booking_id)

    assert isinstance(signature, str)
    assert len(signature) == 64  # SHA256 hex digest length

    # Valid signature check
    assert (
        verify_ticket_signature(ticket_id, trip_id, booking_id, signature)
        is True
    )

    # Tampered ticket_id
    tampered_ticket_id = "f47ac10b-58cc-4372-a567-0e02b2c3d480"
    assert (
        verify_ticket_signature(
            tampered_ticket_id, trip_id, booking_id, signature
        )
        is False
    )

    # Tampered trip_id
    tampered_trip_id = "c9a646d3-9c61-4cd9-bc15-4581c32bde22"
    assert (
        verify_ticket_signature(
            ticket_id, tampered_trip_id, booking_id, signature
        )
        is False
    )
