from app.database import engine, Base
from app.models.content import ContentItem, MetricSnapshot

Base.metadata.create_all(bind=engine)

print("NYRA PLUS database tables created successfully!")