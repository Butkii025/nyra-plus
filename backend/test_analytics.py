
from types import SimpleNamespace

from app.analytics.engagement import calculate_engagement

sample = SimpleNamespace(
    views=10000,
    likes=800,
    comments=200
)

result = calculate_engagement(sample)

print(result)
