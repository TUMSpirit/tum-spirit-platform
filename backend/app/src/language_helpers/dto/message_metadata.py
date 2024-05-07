from datetime import datetime

from .OCEAN import OCEANResult

class Metadata():
    sentiment: dict
    flesh_reading_ease: float
    MTBI: dict
    OCEAN: OCEANResult


class MessageMetadata():
    id: str
    message_id: str
    timestamp: datetime
    metadata: Metadata
