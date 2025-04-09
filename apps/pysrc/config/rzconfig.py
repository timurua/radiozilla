import os
from dotenv import load_dotenv

class RzConfig:
    
    _instance = None

    @classmethod
    def initialize(cls):        
        cls._instance = RzConfig()
        
    @classmethod    
    def instance(cls) -> 'RzConfig':
        if cls._instance is None:
            cls.initialize()
        instance = cls._instance
        if instance is None:
            raise Exception("RzConfig not initialized")
        return instance
        
    def __init__(self):
        env_path = os.getenv('ENV_FILE', '.env')
        load_dotenv(env_path)

        self.env_name = os.getenv('ENV_NAME', 'unknown')
        self.service_name = os.getenv('SERVICE_NAME', 'unknown')
        self.db_url = os.getenv('DB_URL', 'unknown')
        self.google_account_file = os.getenv('GOOGLE_ACCOUNT_FILE', 'unknown')
        self.audio_dir = os.getenv('AUDIO_DIR', 'unknown')
        self.image_resource_dir = os.getenv('IMAGE_RESOURCE_DIR', 'unknown')
        
        self.ollama_model = os.getenv('OLLAMA_MODEL', 'unknown')
        self.dfs_bucket_prefix = os.getenv('DFS_BUCKET_PREFIX', 'unknown')