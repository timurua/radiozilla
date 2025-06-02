class MinHashRegistry:
    _hashers: Dict[str, MinHasher] = {}

    @staticmethod
    def _init_registry():
        MinHashRegistry._hashers = {
            "default": MinHasher(),
            "url": MinHasher(num_permutations=32)
        }
    