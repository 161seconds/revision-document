# Simple RAG Workflow with LlamaIndex

A basic implementation guide for building a Retrieval-Augmented Generation (RAG) system using LlamaIndex.

## Prerequisites

- Python 3.10+
- Ollama

## Installation

1. Install Ollama:

**macOS**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Linux**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

2. Pull the Llama 2 model:
```bash
ollama pull llama3.2
```

## Project Overview

This project demonstrates how to:
- Set up a basic RAG system using LlamaIndex
- Integrate with Ollama for local LLM inference
- Process and index documents for retrieval
- Generate contextual responses using the indexed knowledge

## Getting Started

1. Clone this repository
2. Follow the installation steps above
3. Run the Jupyter notebook `workflow.ipynb` to see the RAG system in action

## Note

Make sure Ollama is running in the background before executing the notebook:
```bash
ollama serve
``` 