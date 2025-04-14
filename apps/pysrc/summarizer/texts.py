from sentence_transformers import SentenceTransformer

class EmbeddingService:
    _model:SentenceTransformer|None = None

    @staticmethod
    def calculate_embeddings(text: str|None)->list[float]|None:        
        if text is None:
            return None

        model = EmbeddingService.initialize_model_if_needed()
        embeddings = model.encode(text)
        return embeddings.tolist()
    
    @staticmethod
    def initialize_model_if_needed()-> SentenceTransformer:
        if not EmbeddingService._model:
            # pylint: disable=no-value-for-parameter
            # type: ignore
            EmbeddingService._model = SentenceTransformer('all-MiniLM-L6-v2').to('cpu')
        model = EmbeddingService._model
        return model
