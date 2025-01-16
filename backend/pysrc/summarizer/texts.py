from sentence_transformers import SentenceTransformer

class EmbeddingService:
    _model:SentenceTransformer = None

    @staticmethod
    def calculate_embeddings(self, texts)->list[float]:
        lines = [line.strip() for line in texts.split('\n') if line.strip()]
        model = self.initialize_model_if_needed()
        embeddings = model.encode(lines)
        return embeddings.tolist()
    
    @staticmethod
    def initialize_model_if_needed(cls):
        if not EmbeddingService._model:
            EmbeddingService._model = SentenceTransformer('all-MiniLM-L6-v2')
        model = EmbeddingService._model
        return model
