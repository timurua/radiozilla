from sentence_transformers import SentenceTransformer

class EmbeddingService:
    _model:SentenceTransformer = None

    @staticmethod
    def calculate_embeddings(text)->list[float]:        
        model = EmbeddingService.initialize_model_if_needed()
        embeddings = model.encode(text)
        return embeddings.tolist()
    
    @staticmethod
    def initialize_model_if_needed()->SentenceTransformer:
        if not EmbeddingService._model:
            EmbeddingService._model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        model = EmbeddingService._model
        return model
