# Use Ubuntu 24.04 as the base image
FROM ubuntu:24.04

# Install Python, pip, Java, and dependencies for Jupyter and PyLucene
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    default-jdk \
    python3-venv \
    ant \
    g++ \
    make \
    wget \
    && apt-get clean

# Set default Python and Java commands
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install Jupyter
RUN pip install jupyter --break-system-packages

# Install PyLucene (Apache Lucene bindings for Python)
# Note: PyLucene has specific build requirements and compatibility with Java versions.
RUN pip install pylucene --break-system-packages

# Set the working directory
WORKDIR /app

# Expose Jupyter port
EXPOSE 8888

# Default command
CMD ["bash"]
