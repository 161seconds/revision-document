# Brand monitoring flow using DeepSeek-R1, CrewAI and BrightData

This project implements an automated brand monitoring system using AI agents. We use the following tools to build this:
- [Bright Data](https://brdta.com/dailydoseofds) is used to scrape the web.
- CrewAI to build the Agentic workflow.
- DeepSeek-R1 as the LLM.

The brand monitoring output is shown here: [Sample output](brand-monitoring-demo.mp4)

---
## Setup and installations

**Get BrightData API Key**:
- Go to [Bright Data](https://brdta.com/dailydoseofds) and sign up for an account.
- Select "Proxies & Scraping" and create a new "SERP API"
- Select "Native proxy-based access"
- You will find your username and password there.
- Store it in the .env file of the src/ folder (after renaming the .env.example file to .env)

```
BRIGHT_DATA_USERNAME="..."
BRIGHT_DATA_PASSWORD="..."
```

- Also get the Bright Data API key from your dashboard.

```
BRIGHT_DATA_API_KEY="..."
```

**Setup Ollama**:
   ```bash
   # setup ollama on linux 
   curl -fsSL https://ollama.com/install.sh | sh
   # pull deepseek-r1 model
   ollama pull deepseek-r1
   ```


**Install Dependencies**:
   Ensure you have Python 3.11 or later installed.
   ```bash
   pip install ollama crewai crewai-tools streamlit
   ```

---

## Run the project

Finally, head over to this folder:
```
cd brand_monitoring_flow/src
```

and run the project by running the following command:

```bash
streamlit run brand_monitoring_app.py
```

---

## 📬 Stay Updated with Our Newsletter!
**Get a FREE Data Science eBook** 📖 with 150+ essential lessons in Data Science when you subscribe to our newsletter! Stay in the loop with the latest tutorials, insights, and exclusive resources. [Subscribe now!](https://join.dailydoseofds.com)

[![Daily Dose of Data Science Newsletter](https://github.com/patchy631/ai-engineering/blob/main/resources/join_ddods.png)](https://join.dailydoseofds.com)

---

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.
