
# Try to import sqlalchemy, else provide dummy classes
try:
    from sqlalchemy import create_engine, Column, Integer, Float, String, Boolean, DateTime
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    from dotenv import load_dotenv
    import os
    from datetime import datetime as dt

    load_dotenv()

    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ridecast.db")  # Default to SQLite if no Postgres

    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()


    class PredictionRecord(Base):
        __tablename__ = "predictions"

        id = Column(Integer, primary_key=True, index=True)
        city = Column(String, index=True)
        temperature = Column(Float)
        weather = Column(String)
        local_time = Column(String)
        holiday = Column(Boolean)
        weekend = Column(Boolean)
        demand_score = Column(Integer)
        demand_category = Column(String)
        surge_multiplier = Column(Float)
        recommended_drivers = Column(Integer)
        revenue_estimate = Column(String)
        explanation = Column(String)
        created_at = Column(DateTime, default=dt.now)


    def init_db():
        Base.metadata.create_all(bind=engine)
        print("Database initialized")
        
except ImportError:
    # If sqlalchemy is missing, provide dummy exports
    print("WARNING: SQLAlchemy not available, database features disabled")
    
    # Dummy classes/functions
    class DummySession:
        def query(self, *args): return self
        def order_by(self, *args): return []
        def add(self, *args): pass
        def commit(self): pass
        def refresh(self, *args): pass
        def close(self): pass
        
    SessionLocal = DummySession
    
    # Dummy base class
    class Base:
        pass
        
    # Dummy record class
    class PredictionRecord:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
            self.id = 0
    
    def init_db():
        print("Database init skipped - SQLAlchemy not available")
