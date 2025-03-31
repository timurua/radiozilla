from ..db.database import Database
from .rzconfig import RzConfig
from ..observe.log import Logging

class Jobs:
    @classmethod
    async def initialize(cls):
        Logging.initialize(RzConfig.instance().google_account_file, RzConfig.instance().service_name, RzConfig.instance().env_name)        
        Database.initialize(RzConfig.instance().db_url)
        await Database.create_tables() 
        