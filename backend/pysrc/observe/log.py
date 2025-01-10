#!/usr/bin/env python3
import logging
from pyminiscraper.scraper import Scraper, ScraperConfig, ScraperUrl
from pyminiscraper.store_file import FileStoreFactory
import google.cloud.logging
from google.oauth2 import service_account
import logging
import sys

class Logging:
    @staticmethod
    def initialize(account_file: str, service_name: str, env_name: str):
        credentials = service_account.Credentials.from_service_account_file(
            account_file
        )
        client = google.cloud.logging.Client(credentials=credentials)
        client.setup_logging()    

        class CloudLoggingHandler(logging.Handler):
            def __init__(self, log_name=service_name, labels=None):
                super().__init__()
                self.cloud_logger = client.logger(log_name)
                self.labels = labels or {}

            def emit(self, record):
                msg = self.format(record)
                self.cloud_logger.log_struct({
                    'message': msg,
                    'severity': record.levelname,
                    'labels': {
                        **self.labels,
                        **getattr(record, 'labels', {})
                    }
                })

        # Usage
        handler = CloudLoggingHandler(labels={'env': env_name, 'service': service_name})
        # logger = logging.getLogger()
        # logger.addHandler(handler)

        logging.basicConfig(
            # Set the log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            level=logging.INFO,
            # Define the log format
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                handler,
                logging.StreamHandler(sys.stdout),  # Log to standard output
            ]
        )
