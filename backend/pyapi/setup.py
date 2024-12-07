from setuptools import setup, find_packages

setup(
    name="pyapi",
    version="0.1",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'flask>=3.0.0',
        'flask-sqlalchemy>=3.1.1',
        'dependency-injector>=4.41.0',
        'python-dotenv>=1.0.0',
    ],
)