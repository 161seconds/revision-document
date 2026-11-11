import os
import gc
import tempfile
import uuid
import pandas as pd
from typing import Optional, Dict, Any
import logging

from gitingest import ingest
from llama_index.core import Settings, PromptTemplate, VectorStoreIndex, SimpleDirectoryReader
from llama_index.core.node_parser import MarkdownNodeParser
import streamlit as st
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Constants
MAX_REPO_SIZE = 100 * 1024 * 1024  # 100MB
SUPPORTED_REPO_TYPES = ['.py', '.md', '.ipynb', '.js', '.ts', '.json']

class GitHubRAGError(Exception):
    """Custom exception for GitHub RAG application errors"""
    pass

def validate_github_url(url: str) -> bool:
    """Validate GitHub repository URL"""
    return url.startswith(('https://github.com/', 'http://github.com/'))

def get_repo_name(url: str) -> str:
    """Extract repository name from URL"""
    try:
        return url.split('/')[-1].replace('.git', '')
    except Exception as e:
        raise GitHubRAGError(f"Invalid repository URL: {str(e)}")

def reset_chat():
    """Reset chat session and clean up resources"""
    try:
        st.session_state.messages = []
        st.session_state.context = None
        gc.collect()
        logger.info("Chat session reset successfully")
    except Exception as e:
        logger.error(f"Error resetting chat: {str(e)}")
        raise GitHubRAGError("Failed to reset chat session")

def process_with_gitingets(github_url: str) -> tuple:
    """Process GitHub repository using gitingest"""
    try:
        summary, tree, content = ingest(github_url)
        if not all([summary, tree, content]):
            raise GitHubRAGError("Failed to process repository: Missing data")
        return summary, tree, content
    except Exception as e:
        logger.error(f"Error processing repository: {str(e)}")
        raise GitHubRAGError(f"Failed to process repository: {str(e)}")

def create_query_engine(content_path: str, repo_name: str) -> Any:
    """Create and configure query engine"""
    try:
        loader = SimpleDirectoryReader(input_dir=content_path)
        docs = loader.load_data()
        node_parser = MarkdownNodeParser()
        index = VectorStoreIndex.from_documents(
            documents=docs, 
            transformations=[node_parser], 
            show_progress=True
        )

        qa_prompt_tmpl_str = """
        You are an AI assistant specialized in analyzing GitHub repositories.

        Repository structure:
        {tree}
        ---------------------

        Context information from the repository:
        {context_str}
        ---------------------

        Given the repository structure and context above, provide a clear and precise answer to the query. 
        Focus on the repository's content, code structure, and implementation details. 
        If the information is not available in the context, respond with 'I don't have enough information about that aspect of the repository.'

        Query: {query_str}
        Answer: """
        
        qa_prompt_tmpl = PromptTemplate(qa_prompt_tmpl_str)
        query_engine = index.as_query_engine(streaming=True)
        query_engine.update_prompts(
            {"response_synthesizer:text_qa_template": qa_prompt_tmpl}
        )
        return query_engine
    except Exception as e:
        logger.error(f"Error creating query engine: {str(e)}")
        raise GitHubRAGError(f"Failed to create query engine: {str(e)}")

# Initialize session state
if "id" not in st.session_state:
    st.session_state.id = uuid.uuid4()
    st.session_state.file_cache = {}
    st.session_state.messages = []

session_id = st.session_state.id

# Sidebar
with st.sidebar:
    st.header("Add your GitHub repository!")
    
    github_url = st.text_input(
        "Enter GitHub repository URL",
        placeholder="https://github.com/username/repo",
        help="Enter a valid GitHub repository URL"
    )
    
    load_repo = st.button("Load Repository", type="primary")

    if github_url and load_repo:
        try:
            # Validate URL
            if not validate_github_url(github_url):
                st.error("Please enter a valid GitHub repository URL")
                st.stop()

            repo_name = get_repo_name(github_url)
            file_key = f"{session_id}-{repo_name}"
            
            if file_key not in st.session_state.file_cache:
                with st.spinner("Processing your repository..."):
                    with tempfile.TemporaryDirectory() as temp_dir:
                        try:
                            summary, tree, content = process_with_gitingets(github_url)
                            
                            # Write content to temporary file
                            content_path = os.path.join(temp_dir, f"{repo_name}_content.md")
                            with open(content_path, "w", encoding="utf-8") as f:
                                f.write(content)
                            
                            # Create and cache query engine
                            query_engine = create_query_engine(temp_dir, repo_name)
                            st.session_state.file_cache[file_key] = query_engine
                            
                            st.success("Repository loaded successfully! Ready to chat.")
                            logger.info(f"Successfully processed repository: {repo_name}")
                            
                        except GitHubRAGError as e:
                            st.error(str(e))
                            logger.error(f"Error processing repository {repo_name}: {str(e)}")
                            st.stop()
                        except Exception as e:
                            st.error("An unexpected error occurred while processing the repository")
                            logger.error(f"Unexpected error: {str(e)}")
                            st.stop()
            else:
                st.info("Repository already loaded. Ready to chat!")
                
        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
            logger.error(f"Error in repository loading process: {str(e)}")
            st.stop()

# Main content
col1, col2 = st.columns([6, 1])

with col1:
    st.header("Chat with GitHub using RAG </>")

with col2:
    st.button("Clear Chat ↺", on_click=reset_chat, help="Clear chat history and reset session")

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("What's up?"):
    try:
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Display user message
        with st.chat_message("user"):
            st.markdown(prompt)

        # Process and display assistant response
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""
            
            try:
                repo_name = get_repo_name(github_url)
                file_key = f"{session_id}-{repo_name}"
                query_engine = st.session_state.file_cache.get(file_key)
                
                if query_engine is None:
                    raise GitHubRAGError("Please load a repository first!")
                
                response = query_engine.query(prompt)
                
                if hasattr(response, 'response_gen'):
                    for chunk in response.response_gen:
                        if isinstance(chunk, str):
                            full_response += chunk
                            message_placeholder.markdown(full_response + "▌")
                else:
                    full_response = str(response)
                    message_placeholder.markdown(full_response)
                    
                message_placeholder.markdown(full_response)
                st.session_state.messages.append({"role": "assistant", "content": full_response})
                
            except GitHubRAGError as e:
                st.error(str(e))
                logger.error(f"Error in chat processing: {str(e)}")
            except Exception as e:
                st.error("An unexpected error occurred while processing your query")
                logger.error(f"Unexpected error in chat: {str(e)}")
                
    except Exception as e:
        st.error("An error occurred in the chat system")
        logger.error(f"Chat system error: {str(e)}")