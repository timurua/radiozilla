from setuptools import setup, find_packages

def parse_requirements():
    requirements = []
    pip_options = []
    
    with open("requirements.txt") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("--"):
                pip_options.append(line)
            else:
                requirements.append(line)
    
    return requirements

setup(
    name="scraper",
    version="0.1.0",
    packages=find_packages(),
    install_requires=parse_requirements(),
    entry_points={
        "console_scripts": [
            "api=backend.main:app",
        ],
    },
)