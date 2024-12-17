class Minio:
    def __init__(self, endpoint, access_key, secret_key, secure=False):
        self.client = Minio(endpoint, access_key, secret_key, secure=secure)

    def list_objects(self, bucket_name):
        return self.client.list_objects(bucket_name)