from setuptools import setup, find_packages

setup(
    name='pyradiozilla',
    version='0.1.5',
    description='Python library for importing data from external datasources',
    author='Radiozilla',
    author_email='timurua@gmail.com',
    url='https://github.com/timurua/radiozilla/backend/datasources',
    packages=find_packages(where="."), 
    install_requires=[
        "PyGithub==2.4.0",
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)