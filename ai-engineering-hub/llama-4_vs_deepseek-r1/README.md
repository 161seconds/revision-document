# MetaAI's Llama 4 and DeeSeek-R1 compared using RAG

This tutorials build a RAG app powered by [LlamaIndex](https://www.llamaindex.ai/) to compare Llama 4 and DeeSeek-R1. We have used [Opik](https://github.com/comet-ml/opik) for evaluation and observability, which is 100% open-source and nicely integrates with alsmot all popular frameworks.

You can quickly test it on your own complex docs [here](https://eyelevel.ai/).

### Setup

To sync dependencies, run:

```sh
uv sync
```

### Environment Variables

You need to set up the following environment variables:

```sh
GROQ_API_KEY=...
OPENAI_API_KEY=...
```
OpenAI API key needed for using o1 and a judge during evaluation

Ensure these variables are configured correctly before running the application use `.env.example` as reference and create your own `.env` file.

Run the streamlit app using `streamlit run app.py`

---

## 📬 Stay Updated with Our Newsletter!
**Get a FREE Data Science eBook** 📖 with 150+ essential lessons in Data Science when you subscribe to our newsletter! Stay in the loop with the latest tutorials, insights, and exclusive resources. [Subscribe now!](https://join.dailydoseofds.com)

[![Daily Dose of Data Science Newsletter](https://github.com/patchy631/ai-engineering/blob/main/resources/join_ddods.png)](https://join.dailydoseofds.com)

---

## Contribution

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

