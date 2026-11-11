# server.py
from mcp.server.fastmcp import FastMCP
from rag_code import *

# Create an MCP server
mcp = FastMCP("MCP-RAG-app",
              host="127.0.0.1",
              port=8080,
              timeout=30)

@mcp.tool()
def machine_learning_faq_retrieval_tool(query: str) -> str:
    """Retrieve the most relevant documents from the machine learning
       FAQ collection. Use this tool when the user asks about ML.

    Input:
        query: str -> The user query to retrieve the most relevant documents

    Output:
        context: str -> most relevant documents retrieved from a vector DB
    """

    # check type of text
    if not isinstance(query, str):
        raise ValueError("query must be a string")
    
    retriever = Retriever(QdrantVDB("ml_faq_collection"), EmbedData())
    response = retriever.search(query)

    return response


@mcp.tool()
def bright_data_web_search_tool(query: str) -> list[str]:
    """
    Search for information on a given topic using Bright Data.
    Use this tool when the user asks about a specific topic or question 
    that is not related to general machine learning.

    Input:
        query: str -> The user query to search for information

    Output:
        context: list[str] -> list of most relevant web search results
    """
    # check type of text
    if not isinstance(query, str):
        raise ValueError("query must be a string")
    
    import os
    import ssl
    import requests
    from dotenv import load_dotenv

    # Load environment variables and configure SSL
    load_dotenv()
    ssl._create_default_https_context = ssl._create_unverified_context

    # Bright Data configuration
    host = 'brd.superproxy.io'
    port = 33335
    
    # get username and password from brightdata.com
    username = os.getenv("BRIGHT_DATA_USERNAME")
    password = os.getenv("BRIGHT_DATA_PASSWORD")

    proxy_url = f'http://{username}:{password}@{host}:{port}'
    proxies = {
        'http': proxy_url,
        'https': proxy_url
    }

    # Format query and make request
    formatted_query = "+".join(query.split(" "))
    url = f"https://www.google.com/search?q={formatted_query}&brd_json=1&num=50"
    response = requests.get(url, proxies=proxies, verify=False)

    # Return organic search results
    return response.json()['organic']

if __name__ == "__main__":
    print("Starting MCP server at http://127.0.0.1:8080 on port 8080")
    mcp.run()

