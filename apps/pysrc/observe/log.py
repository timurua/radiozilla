#!/usr/bin/env python3
import logging
import google.cloud.logging # type: ignore
from google.oauth2 import service_account
import sys

class Logging:
    @staticmethod
    def initialize(account_file: str, service_name: str, env_name: str):
        credentials = service_account.Credentials.from_service_account_file(
            account_file
        )
        client = google.cloud.logging.Client(credentials=credentials)
        client.setup_logging(log_level=logging.INFO)
        logger = logging.getLogger()
        logger.setLevel(logging.INFO)
        logger.addHandler(logging.StreamHandler())

