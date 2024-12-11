from setuptools import setup, find_packages

setup(
    name="pywebscaper",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'requests>=2.25.1',
        'beautifulsoup4>=4.9.3',
        'lxml>=4.6.3',
    ],
    author="Timur Valiulin",
    author_email="timurua@gmail.com",
    description="A web scraping utility package",
    long_description=open("README.md").read() if os.path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    url="https://github.com/timurua/pywebscaper",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)