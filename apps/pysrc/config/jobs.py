from ..db.database import Database
from .rzconfig import RzConfig
from ..observe.log import Logging

class Jobs:
    @classmethod
    async def initialize(cls) -> None:
        Logging.initialize(RzConfig.instance().google_account_file, RzConfig.instance().service_name, RzConfig.instance().env_name)        

        